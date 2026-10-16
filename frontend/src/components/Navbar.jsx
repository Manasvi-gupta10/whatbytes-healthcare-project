import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, LogOut, ShieldCheck, HeartPulse } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header
      style={{
        background: '#ffffff',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.85rem 2rem',
          maxWidth: '1440px',
          margin: '0 auto',
        }}
      >
        {/* Brand */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              background: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)',
            }}
          >
            <HeartPulse size={22} />
          </div>
          <div>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.25rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#0f172a',
              }}
            >
              PulseCare
            </span>
            <span
              style={{
                display: 'block',
                fontSize: '0.65rem',
                color: '#0284c7',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              Clinical Management Portal
            </span>
          </div>
        </Link>

        {/* Right Info & Actions */}
        {isAuthenticated && user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* User Profile */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.35rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                background: '#f8fafc',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#ffffff',
                }}
              >
                {user.name ? user.name.replace(/^(dr\.?|doctor)\s+/i, '').charAt(0).toUpperCase() : 'U'}
              </div>
              <div style={{ lineHeight: 1.2 }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  {user.name ? user.name.replace(/^(dr\.?|doctor)\s+/i, '') : ''}
                </p>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                  {user.email}
                </p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="btn btn-secondary btn-sm"
              style={{ gap: '0.4rem' }}
              title="Sign Out"
            >
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
