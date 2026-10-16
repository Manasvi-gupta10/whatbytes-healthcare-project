import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = '#0284c7', subtitle }) => {
  const getColors = () => {
    if (color === '#10b981' || color === '#16a34a') {
      return { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' };
    }
    if (color === '#6366f1' || color === '#7e22ce') {
      return { bg: '#f3e8ff', text: '#7e22ce', border: '#e9d5ff' };
    }
    return { bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd' };
  };

  const scheme = getColors();

  return (
    <div
      className="glass-card"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        position: 'relative',
        background: '#ffffff',
      }}
    >
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: 'var(--radius-md)',
          background: scheme.bg,
          border: `1px solid ${scheme.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: scheme.text,
          flexShrink: 0,
        }}
      >
        <Icon size={26} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: '0.78rem',
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            fontWeight: 700,
          }}
        >
          {title}
        </p>
        <h3 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', margin: '0.1rem 0' }}>
          {value}
        </h3>
        {subtitle && (
          <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
