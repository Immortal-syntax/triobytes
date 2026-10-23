import React from 'react';
import { MAP_NODES } from '../../data/hospital.js';
import { useI18n } from '../../context/I18nContext.jsx';

export default function FloorSvgMap({
  floor = 0,
  activeNodeId = null,
  activePath = [],
  onSelectNode = null,
}) {
  const { t } = useI18n();

  // Filter nodes belonging to the selected floor
  const floorNodes = Object.values(MAP_NODES).filter((n) => n.floor === floor);

  // Compute SVG polyline points for the active path if it passes through this floor
  const currentFloorPathNodes = activePath
    .map((nodeId) => MAP_NODES[nodeId])
    .filter((node) => node && node.floor === floor);

  const pathPoints = currentFloorPathNodes.map((n) => `${n.x},${n.y}`).join(' ');

  return (
    <div className="w-full bg-slate-900 border-4 border-slate-700 rounded-2xl p-2 sm:p-4 shadow-inner overflow-hidden">
      <div className="flex items-center justify-between mb-2 text-slate-300 text-xs sm:text-sm">
        <span className="font-bold flex items-center gap-1.5 text-white">
          <span className="w-3 h-3 rounded-full bg-hospital-500 inline-block"></span>
          {floor === 0 ? t('floors.ground.name') : floor === 1 ? t('floors.first.name') : t('floors.second.name')}
        </span>
        <span className="text-slate-400">Interactive Floor Plan • 360° View</span>
      </div>

      <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-slate-950 rounded-xl border-2 border-slate-800 flex items-center justify-center overflow-hidden">
        <svg
          viewBox="0 0 400 400"
          className="w-full h-full max-h-[500px]"
          aria-label={`Floor map for ${floor === 0 ? 'Ground Floor' : floor === 1 ? 'First Floor' : 'Second Floor'}`}
        >
          {/* Architectural Floor Grid Background */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.8" />
            </pattern>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <rect width="400" height="400" fill="url(#grid)" />

          {/* Exterior Hospital Boundary Walls */}
          <rect
            x="30"
            y="30"
            width="340"
            height="340"
            rx="16"
            fill="#090d16"
            stroke="#334155"
            strokeWidth="4"
          />

          {/* Central Corridor Hallmark */}
          <rect x="175" y="40" width="50" height="320" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
          <rect x="40" y="175" width="320" height="50" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />

          {/* Floor-specific Architectural Zones */}
          {floor === 0 && (
            <>
              {/* Gate 1 Entrance */}
              <rect x="160" y="340" width="80" height="26" rx="4" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
              <text x="200" y="357" fill="#60a5fa" fontSize="11" fontWeight="bold" textAnchor="middle">
                GATE 1
              </text>

              {/* Casualty / Emergency Zone (Red) */}
              <rect
                x="45"
                y="245"
                width="95"
                height="80"
                rx="8"
                fill="#450a0a"
                stroke="#dc2626"
                strokeWidth="3"
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => onSelectNode && onSelectNode('casualty')}
              />
              <text x="92" y="278" fill="#fca5a5" fontSize="12" fontWeight="bold" textAnchor="middle">
                CASUALTY
              </text>
              <text x="92" y="296" fill="#ef4444" fontSize="11" fontWeight="extrabold" textAnchor="middle">
                EMERGENCY (E1)
              </text>

              {/* Registration Desk Zone (Blue) */}
              <rect
                x="260"
                y="245"
                width="95"
                height="80"
                rx="8"
                fill="#082f49"
                stroke="#0284c7"
                strokeWidth="2"
                className="cursor-pointer hover:opacity-80"
                onClick={() => onSelectNode && onSelectNode('reg_desk')}
              />
              <text x="307" y="278" fill="#7dd3fc" fontSize="11" fontWeight="bold" textAnchor="middle">
                REGISTRATION
              </text>
              <text x="307" y="296" fill="#38bdf8" fontSize="10" textAnchor="middle">
                Counters 1-4
              </text>

              {/* General Medicine Room R1 */}
              <rect
                x="45"
                y="45"
                width="90"
                height="80"
                rx="8"
                fill="#064e3b"
                stroke="#10b981"
                strokeWidth="2"
                className="cursor-pointer hover:opacity-80"
                onClick={() => onSelectNode && onSelectNode('g_med_1')}
              />
              <text x="90" y="78" fill="#6ee7b7" fontSize="11" fontWeight="bold" textAnchor="middle">
                Medicine R1
              </text>
              <text x="90" y="96" fill="#a7f3d0" fontSize="10" textAnchor="middle">
                Dr. R. Sharma
              </text>

              {/* Medicine Room R2 */}
              <rect
                x="155"
                y="45"
                width="90"
                height="70"
                rx="8"
                fill="#064e3b"
                stroke="#10b981"
                strokeWidth="2"
                className="cursor-pointer hover:opacity-80"
                onClick={() => onSelectNode && onSelectNode('g_med_2')}
              />
              <text x="200" y="78" fill="#6ee7b7" fontSize="11" fontWeight="bold" textAnchor="middle">
                Medicine R2
              </text>

              {/* Pharmacy */}
              <rect
                x="265"
                y="45"
                width="90"
                height="80"
                rx="8"
                fill="#1e1b4b"
                stroke="#6366f1"
                strokeWidth="2"
                className="cursor-pointer hover:opacity-80"
                onClick={() => onSelectNode && onSelectNode('pharmacy')}
              />
              <text x="310" y="78" fill="#c7d2fe" fontSize="11" fontWeight="bold" textAnchor="middle">
                PHARMACY
              </text>
              <text x="310" y="96" fill="#a5b4fc" fontSize="10" textAnchor="middle">
                Dispensary
              </text>
            </>
          )}

          {floor === 1 && (
            <>
              {/* Orthopaedics Room R101 (Kamla's Destination - Special High Visibility Glow) */}
              <rect
                x="45"
                y="45"
                width="95"
                height="75"
                rx="8"
                fill="#451a03"
                stroke="#f59e0b"
                strokeWidth="3.5"
                filter="url(#glow)"
                className="cursor-pointer hover:opacity-90 transition-transform"
                onClick={() => onSelectNode && onSelectNode('ortho_101')}
              />
              <text x="92" y="75" fill="#fde68a" fontSize="12" fontWeight="black" textAnchor="middle">
                ORTHOPAEDICS
              </text>
              <text x="92" y="93" fill="#fbbf24" fontSize="11" fontWeight="bold" textAnchor="middle">
                ROOM R101 (Bones)
              </text>
              <text x="92" y="108" fill="#fef3c7" fontSize="9" textAnchor="middle">
                Dr. Kulkarni
              </text>

              {/* Ortho Dressing Room R102 */}
              <rect
                x="45"
                y="130"
                width="95"
                height="65"
                rx="8"
                fill="#312e81"
                stroke="#6366f1"
                strokeWidth="2"
                className="cursor-pointer hover:opacity-80"
                onClick={() => onSelectNode && onSelectNode('ortho_102')}
              />
              <text x="92" y="160" fill="#c7d2fe" fontSize="11" fontWeight="bold" textAnchor="middle">
                Ortho R102
              </text>
              <text x="92" y="176" fill="#a5b4fc" fontSize="9" textAnchor="middle">
                Dressing & Plaster
              </text>

              {/* Eye Clinic Room R103 */}
              <rect
                x="155"
                y="45"
                width="90"
                height="70"
                rx="8"
                fill="#164e63"
                stroke="#06b6d4"
                strokeWidth="2"
                className="cursor-pointer hover:opacity-80"
                onClick={() => onSelectNode && onSelectNode('eye_103')}
              />
              <text x="200" y="75" fill="#a5f3fc" fontSize="11" fontWeight="bold" textAnchor="middle">
                EYE CLINIC
              </text>
              <text x="200" y="93" fill="#67e8f9" fontSize="10" textAnchor="middle">
                Room R103
              </text>

              {/* ENT Clinic Room R104 */}
              <rect
                x="265"
                y="45"
                width="90"
                height="70"
                rx="8"
                fill="#1e3a8a"
                stroke="#3b82f6"
                strokeWidth="2"
                className="cursor-pointer hover:opacity-80"
                onClick={() => onSelectNode && onSelectNode('ent_104')}
              />
              <text x="310" y="75" fill="#bfdbfe" fontSize="11" fontWeight="bold" textAnchor="middle">
                ENT CLINIC
              </text>
              <text x="310" y="93" fill="#93c5fd" fontSize="10" textAnchor="middle">
                Room R104
              </text>

              {/* Paediatrics Room R105 */}
              <rect
                x="265"
                y="130"
                width="90"
                height="65"
                rx="8"
                fill="#581c87"
                stroke="#a855f7"
                strokeWidth="2"
                className="cursor-pointer hover:opacity-80"
                onClick={() => onSelectNode && onSelectNode('paed_105')}
              />
              <text x="310" y="158" fill="#e9d5ff" fontSize="11" fontWeight="bold" textAnchor="middle">
                PAEDIATRICS
              </text>
              <text x="310" y="174" fill="#d8b4fe" fontSize="9" textAnchor="middle">
                Child Clinic R105
              </text>

              {/* Waiting Lounge */}
              <rect x="155" y="245" width="90" height="70" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="2" />
              <text x="200" y="278" fill="#cbd5e1" fontSize="11" fontWeight="bold" textAnchor="middle">
                WAITING AREA
              </text>
              <text x="200" y="296" fill="#94a3b8" fontSize="10" textAnchor="middle">
                Seating Lounge
              </text>
            </>
          )}

          {floor === 2 && (
            <>
              {/* Gynaecology R201 */}
              <rect
                x="45"
                y="45"
                width="95"
                height="75"
                rx="8"
                fill="#831843"
                stroke="#ec4899"
                strokeWidth="2"
                className="cursor-pointer hover:opacity-80"
                onClick={() => onSelectNode && onSelectNode('gynae_201')}
              />
              <text x="92" y="75" fill="#fbcfe8" fontSize="11" fontWeight="bold" textAnchor="middle">
                GYNAECOLOGY
              </text>
              <text x="92" y="93" fill="#f472b6" fontSize="10" textAnchor="middle">
                Room R201
              </text>

              {/* Skin R203 */}
              <rect
                x="155"
                y="45"
                width="90"
                height="70"
                rx="8"
                fill="#7c2d12"
                stroke="#f97316"
                strokeWidth="2"
                className="cursor-pointer hover:opacity-80"
                onClick={() => onSelectNode && onSelectNode('skin_203')}
              />
              <text x="200" y="75" fill="#fed7aa" fontSize="11" fontWeight="bold" textAnchor="middle">
                DERMATOLOGY
              </text>
              <text x="200" y="93" fill="#fb923c" fontSize="10" textAnchor="middle">
                Room R203
              </text>

              {/* Dental R204 */}
              <rect
                x="265"
                y="45"
                width="90"
                height="70"
                rx="8"
                fill="#134e4a"
                stroke="#14b8a6"
                strokeWidth="2"
                className="cursor-pointer hover:opacity-80"
                onClick={() => onSelectNode && onSelectNode('dental_204')}
              />
              <text x="310" y="75" fill="#99f6e4" fontSize="11" fontWeight="bold" textAnchor="middle">
                DENTAL CLINIC
              </text>
              <text x="310" y="93" fill="#5eead4" fontSize="10" textAnchor="middle">
                Room R204
              </text>

              {/* Pathology Lab R205 */}
              <rect
                x="265"
                y="130"
                width="90"
                height="65"
                rx="8"
                fill="#3730a3"
                stroke="#818cf8"
                strokeWidth="2"
                className="cursor-pointer hover:opacity-80"
                onClick={() => onSelectNode && onSelectNode('lab_205')}
              />
              <text x="310" y="158" fill="#e0e7ff" fontSize="11" fontWeight="bold" textAnchor="middle">
                LAB & TESTS
              </text>
              <text x="310" y="174" fill="#c7d2fe" fontSize="9" textAnchor="middle">
                Blood/Urine R205
              </text>
            </>
          )}

          {/* Vertical Transitions (Present on all 3 floors at identical coordinates) */}
          {/* 1. Accessible Elevator (Lift) */}
          <g
            className="cursor-pointer hover:opacity-80"
            onClick={() => onSelectNode && onSelectNode(floor === 0 ? 'g_lift' : floor === 1 ? 'f1_lift' : 'f2_lift')}
          >
            <rect x="135" y="115" width="34" height="34" rx="6" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
            <text x="152" y="132" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
              LIFT
            </text>
            <text x="152" y="143" fill="#bae6fd" fontSize="8" textAnchor="middle">
              🛗
            </text>
          </g>

          {/* 2. Accessible Ramp (Gentle slope for Kamla / avoid stairs) */}
          <g
            className="cursor-pointer hover:opacity-80"
            onClick={() => onSelectNode && onSelectNode(floor === 0 ? 'g_ramp' : floor === 1 ? 'f1_ramp' : 'f2_ramp')}
          >
            <rect x="233" y="115" width="36" height="34" rx="6" fill="#059669" stroke="#34d399" strokeWidth="2" />
            <text x="251" y="132" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
              RAMP
            </text>
            <text x="251" y="143" fill="#a7f3d0" fontSize="8" textAnchor="middle">
              ♿
            </text>
          </g>

          {/* 3. Stairs */}
          <g
            className="cursor-pointer hover:opacity-80"
            onClick={() => onSelectNode && onSelectNode(floor === 0 ? 'g_stairs' : floor === 1 ? 'f1_stairs' : 'f2_stairs')}
          >
            <rect x="325" y="115" width="34" height="34" rx="6" fill="#475569" stroke="#94a3b8" strokeWidth="1.5" />
            <text x="342" y="132" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
              STAIRS
            </text>
            <text x="342" y="143" fill="#e2e8f0" fontSize="8" textAnchor="middle">
              🪜
            </text>
          </g>

          {/* Drinking Water Landmark */}
          <g className="cursor-pointer" onClick={() => onSelectNode && onSelectNode(floor === 0 ? 'g_water' : 'f1_water')}>
            <circle cx="130" cy={floor === 0 ? 200 : 280} r="14" fill="#0369a1" stroke="#38bdf8" strokeWidth="2" />
            <text x="130" y={floor === 0 ? 204 : 284} fill="#ffffff" fontSize="10" textAnchor="middle">
              💧
            </text>
          </g>

          {/* Washroom Landmark */}
          <g className="cursor-pointer" onClick={() => onSelectNode && onSelectNode(floor === 0 ? 'g_washroom' : 'f1_washroom')}>
            <circle cx="270" cy={floor === 0 ? 200 : 280} r="14" fill="#4338ca" stroke="#818cf8" strokeWidth="2" />
            <text x="270" y={floor === 0 ? 204 : 284} fill="#ffffff" fontSize="10" textAnchor="middle">
              🚻
            </text>
          </g>

          {/* Active Walking Route Path Polyline */}
          {currentFloorPathNodes.length > 1 && (
            <g>
              {/* Outer glowing path line */}
              <polyline
                points={pathPoints}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.5"
              />
              {/* Core animated dashed navigation line */}
              <polyline
                points={pathPoints}
                fill="none"
                stroke="#fbbf24"
                strokeWidth="4"
                strokeDasharray="8 6"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-pulse"
              />
            </g>
          )}

          {/* Node Point Markers on Current Floor */}
          {currentFloorPathNodes.map((n, idx) => (
            <g key={n.id}>
              <circle
                cx={n.x}
                cy={n.y}
                r={idx === 0 || idx === currentFloorPathNodes.length - 1 ? 8 : 5}
                fill={idx === 0 ? '#10b981' : idx === currentFloorPathNodes.length - 1 ? '#ef4444' : '#f59e0b'}
                stroke="#ffffff"
                strokeWidth="2"
              />
              {(idx === 0 || idx === currentFloorPathNodes.length - 1) && (
                <text
                  x={n.x}
                  y={n.y - 12}
                  fill="#ffffff"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                  className="bg-black px-1"
                >
                  {idx === 0 ? 'START' : 'END'}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* Accessible Map Legend */}
      <div className="mt-3 pt-2 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-medium text-slate-300">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-sky-500 border border-white"></span>
          <span>{t('map.legendLift')} (Lift)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-emerald-500 border border-white"></span>
          <span>{t('map.legendRamp')} (Ramp)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-amber-500 border border-white"></span>
          <span>Walking Route</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-blue-600 border border-white"></span>
          <span>{t('map.legendWater')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-red-600 border border-white"></span>
          <span>{t('map.legendEmergency')}</span>
        </div>
      </div>
    </div>
  );
}
