import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Link2,
} from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/patients', label: 'Patients Directory', icon: Users },
    { to: '/doctors', label: 'Doctor Directory', icon: Stethoscope },
    { to: '/mappings', label: 'Doctor Assignments', icon: Link2 },
  ];

  return (
    <aside
      style={{
        width: '260px',
        background: '#ffffff',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.75rem 1.25rem',
        flexShrink: 0,
      }}
    >
      <div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#0369a1' : '#475569',
                  backgroundColor: isActive ? '#e0f2fe' : 'transparent',
                  border: isActive ? '1px solid #bae6fd' : '1px solid transparent',
                  transition: 'all 0.15s ease',
                  textDecoration: 'none',
                })}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
