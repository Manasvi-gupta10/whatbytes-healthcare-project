import React from 'react';

export const formatSpecialization = (str = '') => {
  if (!str || typeof str !== 'string') return '';
  return str
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const DoctorBadge = ({ specialization }) => {
  const formatted = formatSpecialization(specialization);

  const getBadgeClass = (spec = '') => {
    const s = spec.toLowerCase();
    if (s.includes('cardio')) return 'badge-primary';
    if (s.includes('neuro') || s.includes('psych')) return 'badge-purple';
    if (s.includes('pediat') || s.includes('medic')) return 'badge-warning';
    return 'badge-success';
  };

  return <span className={`badge ${getBadgeClass(formatted)}`}>{formatted}</span>;
};

export default DoctorBadge;
