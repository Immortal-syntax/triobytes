/**
 * OPD Saathi - Hospital Departments Data
 * Fictional Government Hospital OPD Clinics
 */

export const DEPARTMENTS = [
  {
    id: 'medicine',
    nameKey: 'dept.medicine.name',
    shortKey: 'dept.medicine.short',
    descKey: 'dept.medicine.desc',
    symptomsKey: 'dept.medicine.symptoms',
    room: 'R1',
    nodeId: 'g_med_1',
    floor: 0,
    floorKey: 'floors.ground.short',
    doctorName: 'Dr. Ramesh Sharma',
    doctorRoleKey: 'dept.medicine.role',
    avgConsultTimeMinutes: 7,
    fee: '₹0 (Free / निःशुल्क)',
    color: 'emerald',
    icon: 'Stethoscope',
  },
  {
    id: 'ortho',
    nameKey: 'dept.ortho.name',
    shortKey: 'dept.ortho.short',
    descKey: 'dept.ortho.desc',
    symptomsKey: 'dept.ortho.symptoms',
    room: 'R101',
    nodeId: 'ortho_101',
    floor: 1,
    floorKey: 'floors.first.short',
    doctorName: 'Dr. Anand Kulkarni',
    doctorRoleKey: 'dept.ortho.role',
    avgConsultTimeMinutes: 10,
    fee: '₹0 (Free / निःशुल्क)',
    color: 'amber',
    icon: 'Bone',
  },
  {
    id: 'eye',
    nameKey: 'dept.eye.name',
    shortKey: 'dept.eye.short',
    descKey: 'dept.eye.desc',
    symptomsKey: 'dept.eye.symptoms',
    room: 'R103',
    nodeId: 'eye_103',
    floor: 1,
    floorKey: 'floors.first.short',
    doctorName: 'Dr. Meenakshi Sundaram',
    doctorRoleKey: 'dept.eye.role',
    avgConsultTimeMinutes: 6,
    fee: '₹0 (Free / निःशुल्क)',
    color: 'cyan',
    icon: 'Eye',
  },
  {
    id: 'ent',
    nameKey: 'dept.ent.name',
    shortKey: 'dept.ent.short',
    descKey: 'dept.ent.desc',
    symptomsKey: 'dept.ent.symptoms',
    room: 'R104',
    nodeId: 'ent_104',
    floor: 1,
    floorKey: 'floors.first.short',
    doctorName: 'Dr. Rajesh Gupta',
    doctorRoleKey: 'dept.ent.role',
    avgConsultTimeMinutes: 6,
    fee: '₹0 (Free / निःशुल्क)',
    color: 'blue',
    icon: 'Ear',
  },
  {
    id: 'paediatrics',
    nameKey: 'dept.paediatrics.name',
    shortKey: 'dept.paediatrics.short',
    descKey: 'dept.paediatrics.desc',
    symptomsKey: 'dept.paediatrics.symptoms',
    room: 'R105',
    nodeId: 'paed_105',
    floor: 1,
    floorKey: 'floors.first.short',
    doctorName: 'Dr. Pooja Saxena',
    doctorRoleKey: 'dept.paediatrics.role',
    avgConsultTimeMinutes: 8,
    fee: '₹0 (Free / निःशुल्क)',
    color: 'purple',
    icon: 'Baby',
  },
  {
    id: 'gynae',
    nameKey: 'dept.gynae.name',
    shortKey: 'dept.gynae.short',
    descKey: 'dept.gynae.desc',
    symptomsKey: 'dept.gynae.symptoms',
    room: 'R201',
    nodeId: 'gynae_201',
    floor: 2,
    floorKey: 'floors.second.short',
    doctorName: 'Dr. Anita Deshmukh',
    doctorRoleKey: 'dept.gynae.role',
    avgConsultTimeMinutes: 9,
    fee: '₹0 (Free / निःशुल्क)',
    color: 'pink',
    icon: 'HeartPulse',
  },
  {
    id: 'dermatology',
    nameKey: 'dept.dermatology.name',
    shortKey: 'dept.dermatology.short',
    descKey: 'dept.dermatology.desc',
    symptomsKey: 'dept.dermatology.symptoms',
    room: 'R203',
    nodeId: 'skin_203',
    floor: 2,
    floorKey: 'floors.second.short',
    doctorName: 'Dr. Vikram Singhania',
    doctorRoleKey: 'dept.dermatology.role',
    avgConsultTimeMinutes: 5,
    fee: '₹0 (Free / निःशुल्क)',
    color: 'orange',
    icon: 'Sparkles',
  },
  {
    id: 'dental',
    nameKey: 'dept.dental.name',
    shortKey: 'dept.dental.short',
    descKey: 'dept.dental.desc',
    symptomsKey: 'dept.dental.symptoms',
    room: 'R204',
    nodeId: 'dental_204',
    floor: 2,
    floorKey: 'floors.second.short',
    doctorName: 'Dr. Neha Malhotra',
    doctorRoleKey: 'dept.dental.role',
    avgConsultTimeMinutes: 8,
    fee: '₹0 (Free / निःशुल्क)',
    color: 'teal',
    icon: 'Smile',
  },
];

export function getDepartmentById(deptId) {
  return DEPARTMENTS.find(d => d.id === deptId) || DEPARTMENTS[0];
}

/**
 * Calculates estimated wait time in minutes based on people ahead and department average consult time
 * @param {number} peopleAhead 
 * @param {string|object} deptIdOrDept 
 * @returns {number} estimated wait minutes
 */
export function estimateWait(peopleAhead, deptIdOrDept) {
  const dept = typeof deptIdOrDept === 'string' ? getDepartmentById(deptIdOrDept) : (deptIdOrDept || DEPARTMENTS[0]);
  const avg = dept?.avgConsultTimeMinutes || 8;
  return Math.max(0, Number(peopleAhead) || 0) * avg;
}
