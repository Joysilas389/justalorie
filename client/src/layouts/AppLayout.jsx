import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { NAV_ITEMS, MOBILE_NAV } from '../constants';

export default function AppLayout() {
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="d-flex">
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none"
          style={{ zIndex: 1029 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`app-sidebar bg-body border-end d-flex flex-column ${sidebarOpen ? 'show' : ''}`}>
        <div className="p-3 border-bottom">
          <NavLink to="/" className="text-decoration-none d-flex align-items-center gap-2" onClick={() => setSidebarOpen(false)}>
            <span style={{ fontSize: '1.5rem' }}>🍽️</span>
            <span className="fw-bold fs-5 text-success">Justalorie</span>
          </NavLink>
        </div>
        <nav className="sidebar-nav flex-grow-1 p-2 overflow-auto">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <i className={`bi ${item.icon}`}></i>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-top">
          <button className="btn btn-sm btn-outline-secondary w-100" onClick={toggleTheme}>
            <i className={`bi ${theme === 'light' ? 'bi-moon-stars' : 'bi-sun'} me-2`}></i>
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="app-main flex-grow-1">
        {/* Top bar for mobile */}
        <nav className="navbar sticky-top bg-body border-bottom d-lg-none px-3">
          <button className="btn btn-sm btn-outline-secondary" onClick={() => setSidebarOpen(true)}>
            <i className="bi bi-list fs-5"></i>
          </button>
          <span className="navbar-brand mb-0 fw-bold text-success">
            🍽️ Justalorie
          </span>
          <button className="btn btn-sm btn-outline-secondary" onClick={toggleTheme}>
            <i className={`bi ${theme === 'light' ? 'bi-moon-stars' : 'bi-sun'}`}></i>
          </button>
        </nav>

        <div className="container-fluid p-3 p-md-4">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="mobile-bottom-nav bg-body justify-content-around align-items-center px-1">
        {MOBILE_NAV.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <i className={`bi ${item.icon}`}></i>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
