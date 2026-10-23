/**
 * OPD Saathi - Initial Seed Patients & Queue Data
 * Simulates a busy, functional government district hospital.
 * Includes Kamla's scenario for realistic demonstration.
 */

export const INITIAL_QUEUES = {
  medicine: {
    deptId: 'medicine',
    currentToken: 21,
    doctorStatus: 'available', // 'available' | 'break' | 'emergency'
    tokens: [
      { tokenNumber: 21, tokenCode: 'MED-21', patientName: 'Ram Prasad', age: 58, status: 'in-consultation', timeIssued: '08:45 AM' },
      { tokenNumber: 22, tokenCode: 'MED-22', patientName: 'Suresh Kumar', age: 44, status: 'waiting', timeIssued: '08:52 AM' },
      { tokenNumber: 23, tokenCode: 'MED-23', patientName: 'Meena Bai', age: 60, status: 'waiting', timeIssued: '09:01 AM' },
      { tokenNumber: 24, tokenCode: 'MED-24', patientName: 'Gopal Lal', age: 35, status: 'waiting', timeIssued: '09:12 AM' },
    ],
  },
  ortho: {
    deptId: 'ortho',
    currentToken: 11,
    doctorStatus: 'available',
    tokens: [
      { tokenNumber: 11, tokenCode: 'ORTHO-11', patientName: 'Babulal', age: 70, status: 'in-consultation', timeIssued: '09:00 AM' },
      { tokenNumber: 12, tokenCode: 'ORTHO-12', patientName: 'Shanti Devi', age: 65, status: 'waiting', timeIssued: '09:05 AM' },
      { tokenNumber: 13, tokenCode: 'ORTHO-13', patientName: 'Harish', age: 48, status: 'waiting', timeIssued: '09:15 AM' },
      // Kamla's seed token:
      {
        tokenNumber: 14,
        tokenCode: 'ORTHO-14',
        patientName: 'Kamla',
        age: 62,
        gender: 'female',
        avoidStairs: true,
        phone: '9876543210',
        status: 'waiting',
        timeIssued: '09:20 AM',
        isKamlaScenario: true,
      },
      { tokenNumber: 15, tokenCode: 'ORTHO-15', patientName: 'Rajinder', age: 52, status: 'waiting', timeIssued: '09:25 AM' },
    ],
  },
  eye: {
    deptId: 'eye',
    currentToken: 8,
    doctorStatus: 'available',
    tokens: [
      { tokenNumber: 8, tokenCode: 'EYE-08', patientName: 'Geeta', age: 54, status: 'in-consultation', timeIssued: '09:10 AM' },
      { tokenNumber: 9, tokenCode: 'EYE-09', patientName: 'Mohd. Iqbal', age: 63, status: 'waiting', timeIssued: '09:18 AM' },
      { tokenNumber: 10, tokenCode: 'EYE-10', patientName: 'Radhika', age: 29, status: 'waiting', timeIssued: '09:22 AM' },
    ],
  },
  ent: {
    deptId: 'ent',
    currentToken: 6,
    doctorStatus: 'available',
    tokens: [
      { tokenNumber: 6, tokenCode: 'ENT-06', patientName: 'Vikas', age: 31, status: 'in-consultation', timeIssued: '09:15 AM' },
      { tokenNumber: 7, tokenCode: 'ENT-07', patientName: 'Tara Chand', age: 67, status: 'waiting', timeIssued: '09:24 AM' },
    ],
  },
  paediatrics: {
    deptId: 'paediatrics',
    currentToken: 15,
    doctorStatus: 'available',
    tokens: [
      { tokenNumber: 15, tokenCode: 'PAED-15', patientName: 'Aarav (Child)', age: 4, status: 'in-consultation', timeIssued: '09:05 AM' },
      { tokenNumber: 16, tokenCode: 'PAED-16', patientName: 'Ananya (Child)', age: 2, status: 'waiting', timeIssued: '09:19 AM' },
    ],
  },
  gynae: {
    deptId: 'gynae',
    currentToken: 12,
    doctorStatus: 'available',
    tokens: [
      { tokenNumber: 12, tokenCode: 'GYN-12', patientName: 'Rekha Devi', age: 28, status: 'in-consultation', timeIssued: '09:08 AM' },
      { tokenNumber: 13, tokenCode: 'GYN-13', patientName: 'Pooja', age: 25, status: 'waiting', timeIssued: '09:21 AM' },
    ],
  },
  dermatology: {
    deptId: 'dermatology',
    currentToken: 9,
    doctorStatus: 'available',
    tokens: [
      { tokenNumber: 9, tokenCode: 'DERM-09', patientName: 'Kailash', age: 39, status: 'in-consultation', timeIssued: '09:12 AM' },
      { tokenNumber: 10, tokenCode: 'DERM-10', patientName: 'Poonam', age: 41, status: 'waiting', timeIssued: '09:26 AM' },
    ],
  },
  dental: {
    deptId: 'dental',
    currentToken: 7,
    doctorStatus: 'available',
    tokens: [
      { tokenNumber: 7, tokenCode: 'DENT-07', patientName: 'Mahesh', age: 46, status: 'in-consultation', timeIssued: '09:10 AM' },
      { tokenNumber: 8, tokenCode: 'DENT-08', patientName: 'Sumitra', age: 59, status: 'waiting', timeIssued: '09:20 AM' },
    ],
  },
};

export const INITIAL_URGENT_ALERTS = [
  // empty by default, populated when a user taps "I need urgent help"
];
