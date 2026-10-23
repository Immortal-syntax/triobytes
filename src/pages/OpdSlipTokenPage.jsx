import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import qrcode from 'qrcode-generator';
import { useT } from '../i18n/useT.js';
import { useHospital } from '../context/HospitalContext.jsx';
import { useAccessibility } from '../context/AccessibilityContext.jsx';
import { getDepartmentById, estimateWait } from '../data/departments.js';
import {
  TicketIcon,
  ClockIcon,
  MapPinIcon,
  PrinterIcon,
  VolumeIcon,
  VolumeOffIcon,
  StaffBadgeIcon,
  CheckCircleIcon,
  CloseIcon,
  InfoIcon,
} from '../components/common/Icons.jsx';

// Inline Icon for Save as Image / Download
function DownloadImageIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
      <path d="M12 11v6M9 14l3 3 3-3" />
    </svg>
  );
}

function FullscreenIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
    </svg>
  );
}

// Build dynamic URL for /turn/:token that works with standard root, sub-paths, or hash routing
export function buildTurnUrl(tokenCode) {
  if (typeof window === 'undefined') return `/turn/${tokenCode}`;
  
  const { origin, pathname, hash } = window.location;

  // Handle hash routing (e.g. #/slip/ORTHO-14 -> #/turn/ORTHO-14)
  if (hash && hash.includes('#')) {
    const basePath = pathname.endsWith('/') ? pathname : `${pathname}/`;
    return `${origin}${basePath}#/turn/${encodeURIComponent(tokenCode)}`;
  }

  // Handle subpath hosting (e.g. /triobytes/slip/ORTHO-14 or /slip/ORTHO-14)
  const cleanPath = pathname.replace(/\/slip(?:\/[^/?#]+)?\/?$/, '');
  const prefix = cleanPath === '' || cleanPath === '/' ? '' : cleanPath;
  return `${origin}${prefix}/turn/${encodeURIComponent(tokenCode)}`;
}

// Safe XML text escaper for SVG template
function escapeXml(unsafe) {
  if (unsafe == null) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export default function OpdSlipTokenPage() {
  const { token } = useParams();
  const { t, language } = useT();
  const { myToken, queues } = useHospital();
  const { speak, isSpeaking, stopSpeaking } = useAccessibility();
  const navigate = useNavigate();

  const [staffModalOpen, setStaffModalOpen] = useState(false);

  // Retrieve token data or fallback to sample
  const tokenData = useMemo(() => {
    const searchCode = (token || '').toUpperCase();
    if (!searchCode && myToken) return myToken;

    for (const q of Object.values(queues)) {
      const match = q.tokens.find((tk) => tk.tokenCode.toUpperCase() === searchCode);
      if (match) {
        return {
          ...match,
          deptId: q.deptId,
          room: getDepartmentById(q.deptId).room,
          floor: getDepartmentById(q.deptId).floor,
          doctorName: getDepartmentById(q.deptId).doctorName,
        };
      }
    }

    if (searchCode.startsWith('ORTHO')) {
      return {
        tokenNumber: 14,
        tokenCode: searchCode,
        patientName: 'Kamla',
        deptId: 'ortho',
        room: 'R101',
        floor: 1,
        doctorName: 'Dr. Anand Kulkarni',
        timeIssued: '09:20 AM',
        dateIssued: new Date().toLocaleDateString(),
      };
    }

    return myToken || {
      tokenNumber: 14,
      tokenCode: 'ORTHO-14',
      patientName: 'Kamla',
      deptId: 'ortho',
      room: 'R101',
      floor: 1,
      doctorName: 'Dr. Anand Kulkarni',
      timeIssued: '09:20 AM',
      dateIssued: new Date().toLocaleDateString(),
    };
  }, [token, myToken, queues]);

  const dept = getDepartmentById(tokenData.deptId);
  const currentQ = queues[tokenData.deptId] || { currentToken: 1, tokens: [] };
  const waitingTokens = currentQ.tokens.filter(
    (tk) => tk.status === 'waiting' && tk.tokenNumber < tokenData.tokenNumber
  );
  const peopleAhead = waitingTokens.length;

  // Use estimateWait function from departments.js
  const waitMinutes = estimateWait(peopleAhead, dept);

  // Extract FIRST NAME ONLY (Constraint: Do not show surname, age or mobile on the slip)
  const firstName = useMemo(() => {
    const raw = (tokenData.patientName || '').trim();
    if (!raw) return 'Patient';
    const clean = raw.replace(/^(mr|mrs|ms|dr|smt|shri)\.?\s+/i, '');
    return clean.split(/\s+/)[0] || raw;
  }, [tokenData.patientName]);

  // Construct full URL for turn tracking
  const turnUrl = useMemo(() => {
    return buildTurnUrl(tokenData.tokenCode);
  }, [tokenData.tokenCode]);

  // Generate QR Code using qrcode-generator
  const qr = useMemo(() => {
    try {
      const q = qrcode(0, 'M');
      q.addData(turnUrl);
      q.make();
      return q;
    } catch (e) {
      console.warn('QR Code generation error:', e);
      return null;
    }
  }, [turnUrl]);

  // Read Aloud Handler
  const handleReadAloud = () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    const textToSpeak = language === 'hi'
      ? `आपकी ओपीडी पर्ची का टोकन नंबर ${tokenData.tokenCode} है। मरीज ${firstName}। विभाग ${t(dept.nameKey)}। डॉक्टर ${tokenData.doctorName || dept.doctorName}। कमरा नंबर ${dept.room}, ${t(dept.floorKey)}। आपसे पहले ${peopleAhead} मरीज हैं। अनुमानित प्रतीक्षा समय लगभग ${waitMinutes} मिनट है।`
      : `Your OPD token is ${tokenData.tokenCode}. Patient ${firstName}. Department ${t(dept.nameKey)}. Doctor ${tokenData.doctorName || dept.doctorName}. Room ${dept.room}, ${t(dept.floorKey)}. There are ${peopleAhead} people ahead of you. Estimated wait is approximately ${waitMinutes} minutes.`;

    speak(textToSpeak);
  };

  // Save as image: renders the slip to an SVG then canvas then PNG without heavy library
  const handleSaveAsImage = () => {
    if (!qr) return;

    const moduleCount = qr.getModuleCount();
    const width = 600;
    const height = 830;
    const qrSize = 150;
    const qrX = (width - qrSize) / 2;
    const qrY = 560;
    const cellSize = qrSize / (moduleCount + 2);

    let qrRects = `<rect x="${qrX}" y="${qrY}" width="${qrSize}" height="${qrSize}" fill="#ffffff" stroke="#cbd5e1" stroke-width="2" rx="8" />`;
    for (let r = 0; r < moduleCount; r++) {
      for (let c = 0; c < moduleCount; c++) {
        if (qr.isDark(r, c)) {
          qrRects += `<rect x="${qrX + (c + 1) * cellSize}" y="${qrY + (r + 1) * cellSize}" width="${cellSize + 0.4}" height="${cellSize + 0.4}" fill="#0f172a" />`;
        }
      }
    }

    const svgString = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <style>
      .title { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 26px; font-weight: 900; fill: #0f172a; text-anchor: middle; }
      .sub { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 13px; font-weight: 700; fill: #0284c7; text-anchor: middle; letter-spacing: 2px; text-transform: uppercase; }
      .token-lbl { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 14px; font-weight: 800; fill: #0369a1; text-anchor: middle; letter-spacing: 2px; }
      .token-val { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 58px; font-weight: 900; fill: #0f172a; text-anchor: middle; }
      .meta { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 13px; font-weight: 600; fill: #64748b; text-anchor: middle; }
      .lbl { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 18px; font-weight: 700; fill: #475569; }
      .val { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 20px; font-weight: 900; fill: #0f172a; text-anchor: end; }
      .val-dept { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 20px; font-weight: 900; fill: #0284c7; text-anchor: end; }
      .dash { stroke: #94a3b8; stroke-width: 2; stroke-dasharray: 6 6; }
      .line { stroke: #e2e8f0; stroke-width: 1.5; }
    </style>
  </defs>

  <!-- Card Background -->
  <rect width="${width}" height="${height}" fill="#ffffff" rx="28" stroke="#0f172a" stroke-width="4" />

  <!-- Header -->
  <text x="300" y="52" class="sub">Government Health Services</text>
  <text x="300" y="86" class="title">${escapeXml(t('hospital.name'))}</text>
  <text x="300" y="112" class="meta">${escapeXml(t('slip.title'))} • ${escapeXml(t('slip.fee'))}</text>
  <line x1="40" y1="128" x2="560" y2="128" class="dash" />

  <!-- Large Token Box -->
  <rect x="50" y="146" width="500" height="114" rx="20" fill="#f0f9ff" stroke="#0284c7" stroke-width="3" />
  <text x="300" y="174" class="token-lbl">${escapeXml(t('slip.tokenLabel'))}</text>
  <text x="300" y="234" class="token-val">${escapeXml(tokenData.tokenCode)}</text>
  <text x="300" y="280" class="meta">Issued: ${escapeXml(tokenData.timeIssued || '')} • ${escapeXml(tokenData.dateIssued || '')}</text>

  <!-- Details Table (First Name Only; No surname, age or mobile) -->
  <line x1="50" y1="300" x2="550" y2="300" class="line" />
  <text x="60" y="326" class="lbl">${escapeXml(t('slip.firstName'))}:</text>
  <text x="540" y="326" class="val">${escapeXml(firstName)}</text>

  <line x1="50" y1="344" x2="550" y2="344" class="line" />
  <text x="60" y="370" class="lbl">${escapeXml(t('slip.department'))}:</text>
  <text x="540" y="370" class="val-dept">${escapeXml(t(dept.nameKey))}</text>

  <line x1="50" y1="388" x2="550" y2="388" class="line" />
  <text x="60" y="414" class="lbl">${escapeXml(t('slip.doctor'))}:</text>
  <text x="540" y="414" class="val">${escapeXml(tokenData.doctorName || dept.doctorName)}</text>

  <line x1="50" y1="432" x2="550" y2="432" class="line" />
  <text x="60" y="458" class="lbl">${escapeXml(t('slip.room'))}:</text>
  <text x="540" y="458" class="val">Room ${escapeXml(dept.room)} (${escapeXml(t(dept.floorKey))})</text>

  <!-- Waiting Status Banner -->
  <rect x="50" y="480" width="500" height="60" rx="14" fill="#fef3c7" stroke="#f59e0b" stroke-width="2" />
  <text x="70" y="506" font-family="sans-serif" font-size="15px" font-weight="800" fill="#78350f">${escapeXml(t('slip.waitingAhead'))}: ${peopleAhead}</text>
  <text x="70" y="528" font-family="sans-serif" font-size="14px" font-weight="700" fill="#92400e">${escapeXml(t('slip.estimatedWait'))}: ~${waitMinutes} ${escapeXml(t('slip.minutes'))}</text>

  <!-- QR Code -->
  <line x1="40" y1="548" x2="560" y2="548" class="dash" />
  ${qrRects}
  <text x="300" y="736" font-family="sans-serif" font-size="13px" font-weight="800" fill="#0284c7" text-anchor="middle">Scan QR code to track turn live (/turn/${escapeXml(tokenData.tokenCode)})</text>
  <text x="300" y="756" font-family="sans-serif" font-size="11px" font-weight="600" fill="#64748b" text-anchor="middle">Your token is your turn number • City District Hospital</text>
</svg>
    `.trim();

    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1200; // 2x scale
      canvas.height = 1660;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);

      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.download = `OPD-Slip-${tokenData.tokenCode}.png`;
      a.href = pngUrl;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };

    img.src = url;
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto pb-12">
      {/* 1-Line Explanation: What a token is on first view */}
      <div className="bg-hospital-50 dark:bg-hospital-950/60 border-2 border-hospital-200 dark:border-hospital-800 rounded-2xl p-4 flex items-center gap-3 text-hospital-950 dark:text-hospital-100 shadow-sm">
        <TicketIcon className="w-7 h-7 text-hospital-600 flex-shrink-0" />
        <p className="font-extrabold text-base sm:text-lg leading-snug">
          {t('slip.tokenDefinition')}
        </p>
      </div>

      {/* The Printable OPD Slip Card */}
      <div
        id="opd-slip-card"
        className="bg-white dark:bg-slate-900 border-4 border-slate-900 dark:border-slate-100 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 relative overflow-hidden"
      >
        {/* Hospital Header */}
        <div className="border-b-4 border-dashed border-slate-300 dark:border-slate-700 pb-4 text-center space-y-1">
          <p className="font-black text-xs sm:text-sm tracking-widest text-hospital-700 dark:text-hospital-400 uppercase">
            Government Health Services
          </p>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {t('hospital.name')}
          </h2>
          <p className="text-sm sm:text-base font-bold text-slate-600 dark:text-slate-300">
            {t('slip.title')} • {t('slip.fee')}
          </p>
        </div>

        {/* The Token Large (e.g. MED-042 or ORTHO-14) */}
        <div className="bg-hospital-50 dark:bg-hospital-950/80 border-4 border-hospital-600 rounded-2xl p-5 sm:p-6 text-center space-y-2">
          <p className="text-xs sm:text-sm font-black uppercase tracking-wider text-hospital-800 dark:text-hospital-300">
            {t('slip.tokenLabel')}
          </p>
          <p className="text-5xl sm:text-6xl font-black text-hospital-950 dark:text-white font-mono tracking-tight">
            {tokenData.tokenCode}
          </p>
          <p className="text-xs sm:text-sm font-semibold text-hospital-700 dark:text-hospital-300">
            Issued: {tokenData.timeIssued} • {tokenData.dateIssued}
          </p>
        </div>

        {/* Details Table: First Name, Department, Doctor Name, Room & Floor */}
        {/* Strict Constraint: Do NOT show surname, age or mobile on the slip */}
        <div className="divide-y-2 divide-slate-200 dark:divide-slate-800 text-base sm:text-lg">
          {/* First Name */}
          <div className="py-2.5 flex items-center justify-between gap-2">
            <span className="font-bold text-slate-600 dark:text-slate-400">
              {t('slip.firstName')}:
            </span>
            <span className="font-black text-slate-900 dark:text-white text-lg sm:text-xl">
              {firstName}
            </span>
          </div>

          {/* Department */}
          <div className="py-2.5 flex items-center justify-between gap-2">
            <span className="font-bold text-slate-600 dark:text-slate-400">
              {t('slip.department')}:
            </span>
            <span className="font-black text-hospital-700 dark:text-hospital-300 text-right">
              {t(dept.nameKey)}
            </span>
          </div>

          {/* Doctor Name */}
          <div className="py-2.5 flex items-center justify-between gap-2">
            <span className="font-bold text-slate-600 dark:text-slate-400">
              {t('slip.doctor')}:
            </span>
            <span className="font-bold text-slate-900 dark:text-white text-right">
              {tokenData.doctorName || dept.doctorName}
            </span>
          </div>

          {/* Room and Floor */}
          <div className="py-2.5 flex items-center justify-between gap-2">
            <span className="font-bold text-slate-600 dark:text-slate-400">
              {t('slip.room')}:
            </span>
            <span className="font-black text-amber-800 dark:text-amber-300 text-right">
              Room {dept.room} ({t(dept.floorKey)})
            </span>
          </div>

          {/* People Ahead & Estimated Wait */}
          <div className="py-2.5 flex items-center justify-between gap-2">
            <span className="font-bold text-slate-600 dark:text-slate-400">
              {t('slip.waitingAhead')}:
            </span>
            <span className="font-black text-slate-900 dark:text-white">
              {peopleAhead}
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between gap-2">
            <span className="font-bold text-slate-600 dark:text-slate-400">
              {t('slip.estimatedWait')}:
            </span>
            <span className="font-extrabold text-hospital-700 dark:text-hospital-300">
              ~{waitMinutes} {t('slip.minutes')}
            </span>
          </div>
        </div>

        {/* QR Code that opens /turn/:token rendered as inline SVG */}
        <div className="border-t-4 border-dashed border-slate-300 dark:border-slate-700 pt-4 text-center space-y-2">
          {qr && (
            <div className="inline-block p-2.5 sm:p-3 bg-white border-2 border-slate-300 rounded-2xl shadow-sm">
              <svg
                viewBox={`0 0 ${qr.getModuleCount() + 4} ${qr.getModuleCount() + 4}`}
                className="w-36 h-36 sm:w-44 sm:h-44 mx-auto"
                role="img"
                aria-label={`QR Code for live queue turn ${tokenData.tokenCode}`}
              >
                <rect width={qr.getModuleCount() + 4} height={qr.getModuleCount() + 4} fill="#ffffff" />
                {Array.from({ length: qr.getModuleCount() }).map((_, r) =>
                  Array.from({ length: qr.getModuleCount() }).map((_, c) =>
                    qr.isDark(r, c) ? (
                      <rect
                        key={`${r}-${c}`}
                        x={c + 2}
                        y={r + 2}
                        width="1"
                        height="1"
                        fill="#0f172a"
                      />
                    ) : null
                  )
                )}
              </svg>
            </div>
          )}

          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-extrabold text-slate-700 dark:text-slate-300">
              {t('slip.qrHelp')}
            </p>
            <button
              type="button"
              onClick={() => navigate(`/turn/${tokenData.tokenCode}`)}
              className="text-xs sm:text-sm font-bold text-hospital-600 dark:text-hospital-400 underline hover:text-hospital-700"
            >
              /turn/{tokenData.tokenCode}
            </button>
          </div>
        </div>
      </div>

      {/* Buttons (icon + word):
          1. Save as image
          2. Print
          3. Read aloud
          4. Show to staff (full-screen very large token and department)
          5. "Go to my room" (opens directions)
      */}
      <div className="space-y-3 print-hidden no-print">
        {/* Primary Action Row: "Go to my room" and "Show to staff" */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* "Go to my room" (opens directions) */}
          <button
            id="btn-go-to-my-room"
            type="button"
            onClick={() => navigate(`/find?dest=${dept.nodeId}`)}
            className="min-h-[56px] py-3.5 px-5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-lg sm:text-xl rounded-2xl flex items-center justify-center gap-3 shadow-lg focus:ring-4 focus:ring-emerald-300 focus:outline-none transition-transform active:scale-95"
          >
            <MapPinIcon className="w-6 h-6" />
            <span>{t('slip.goToRoomBtn')}</span>
          </button>

          {/* "Show to staff" (full-screen very large token and department) */}
          <button
            id="btn-show-to-staff"
            type="button"
            onClick={() => setStaffModalOpen(true)}
            className="min-h-[56px] py-3.5 px-5 bg-hospital-600 hover:bg-hospital-700 active:bg-hospital-800 text-white font-extrabold text-lg sm:text-xl rounded-2xl flex items-center justify-center gap-3 shadow-lg focus:ring-4 focus:ring-hospital-300 focus:outline-none transition-transform active:scale-95"
          >
            <StaffBadgeIcon className="w-6 h-6" />
            <span>{t('slip.showStaffBtn')}</span>
          </button>
        </div>

        {/* Secondary Row: "Save as image" and "Read aloud" */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* "Save as image" */}
          <button
            id="btn-save-image"
            type="button"
            onClick={handleSaveAsImage}
            className="min-h-[54px] py-3 px-4 bg-slate-800 hover:bg-slate-900 active:bg-black text-white font-bold text-base sm:text-lg rounded-2xl flex items-center justify-center gap-2.5 shadow focus:ring-4 focus:ring-slate-400 focus:outline-none transition-transform active:scale-95"
          >
            <DownloadImageIcon className="w-6 h-6" />
            <span>{t('slip.saveImageBtn')}</span>
          </button>

          {/* "Read aloud" */}
          <button
            id="btn-read-aloud"
            type="button"
            onClick={handleReadAloud}
            className={`min-h-[54px] py-3 px-4 text-white font-bold text-base sm:text-lg rounded-2xl flex items-center justify-center gap-2.5 shadow focus:ring-4 focus:ring-amber-300 focus:outline-none transition-transform active:scale-95 ${
              isSpeaking
                ? 'bg-amber-600 hover:bg-amber-700 ring-4 ring-amber-300'
                : 'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            {isSpeaking ? <VolumeOffIcon className="w-6 h-6" /> : <VolumeIcon className="w-6 h-6" />}
            <span>{isSpeaking ? t('slip.stopReadingBtn') : t('slip.readAloudBtn')}</span>
          </button>
        </div>

        {/* Print Button (Print: a print stylesheet that shows only the slip) */}
        <div>
          <button
            id="btn-print-slip"
            type="button"
            onClick={() => window.print()}
            className="w-full min-h-[54px] py-3 px-6 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white border-2 border-slate-300 dark:border-slate-700 font-extrabold text-base sm:text-lg rounded-2xl flex items-center justify-center gap-2.5 shadow-sm focus:ring-4 focus:ring-slate-400 focus:outline-none transition-transform active:scale-95"
          >
            <PrinterIcon className="w-6 h-6" />
            <span>{t('slip.printBtn')}</span>
          </button>
        </div>
      </div>

      {/* FULL-SCREEN STAFF VIEW MODAL: Show to staff */}
      {staffModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="staff-view-heading"
          className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-6 overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <StaffBadgeIcon className="w-7 h-7 text-amber-400" />
              <div>
                <h2 id="staff-view-heading" className="text-xl sm:text-2xl font-black text-white">
                  {t('slip.staffViewTitle')}
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 font-semibold">
                  {t('slip.staffViewSubtitle')}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setStaffModalOpen(false)}
              className="min-h-[48px] px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl flex items-center gap-2 border border-slate-700 focus:ring-4 focus:ring-amber-300 focus:outline-none"
              aria-label="Close"
            >
              <CloseIcon className="w-6 h-6" />
              <span>{t('slip.closeStaffView')}</span>
            </button>
          </div>

          {/* Center Body: Very large token and department */}
          <div className="my-auto text-center space-y-6 py-6">
            {/* Very large token */}
            <div className="space-y-1">
              <span className="text-sm sm:text-base font-extrabold uppercase tracking-widest text-amber-400">
                {t('slip.tokenLabel')}
              </span>
              <p className="text-6xl sm:text-8xl md:text-9xl font-black font-mono tracking-tight text-white drop-shadow-lg">
                {tokenData.tokenCode}
              </p>
            </div>

            {/* Department Name */}
            <div className="space-y-1">
              <h3 className="text-3xl sm:text-5xl font-black text-amber-300">
                {t(dept.nameKey)}
              </h3>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                Room {dept.room} • {t(dept.floorKey)}
              </p>
            </div>

            {/* Doctor & Patient First Name */}
            <div className="text-lg sm:text-2xl font-bold text-slate-300 space-y-1">
              <p>Doctor: <span className="font-black text-white">{tokenData.doctorName || dept.doctorName}</span></p>
              <p>{t('slip.firstName')}: <span className="font-black text-white">{firstName}</span></p>
            </div>

            {/* Large QR Code for Staff Scanner */}
            {qr && (
              <div className="inline-block p-4 bg-white rounded-3xl shadow-2xl">
                <svg
                  viewBox={`0 0 ${qr.getModuleCount() + 4} ${qr.getModuleCount() + 4}`}
                  className="w-44 h-44 sm:w-56 sm:h-56 mx-auto"
                >
                  <rect width={qr.getModuleCount() + 4} height={qr.getModuleCount() + 4} fill="#ffffff" />
                  {Array.from({ length: qr.getModuleCount() }).map((_, r) =>
                    Array.from({ length: qr.getModuleCount() }).map((_, c) =>
                      qr.isDark(r, c) ? (
                        <rect
                          key={`${r}-${c}`}
                          x={c + 2}
                          y={r + 2}
                          width="1"
                          height="1"
                          fill="#0f172a"
                        />
                      ) : null
                    )
                  )}
                </svg>
              </div>
            )}
          </div>

          {/* Footer Action */}
          <div className="pt-3 border-t border-slate-800 text-center">
            <button
              type="button"
              onClick={() => setStaffModalOpen(false)}
              className="w-full sm:w-auto min-h-[52px] px-8 py-3 bg-white text-slate-950 font-black text-lg sm:text-xl rounded-2xl shadow-lg hover:bg-slate-200 focus:ring-4 focus:ring-amber-300 focus:outline-none"
            >
              {t('slip.closeStaffView')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
