import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useState } from "react";
import "./Navbar.css";

function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
  };

  const initial = user && user.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <nav className="navbar glass">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="logo-box">S</span>
          <span className="logo-text">stikbook<span className="logo-sub">Jobs</span></span>
        </Link>

        <div className="navbar-menu-wrapper">
          <ul className="navbar-menu">
            <li>
              <NavLink 
                to="/" 
                className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                end
              >
                <svg className="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                </svg>
                <span className="nav-text">Home</span>
              </NavLink>
            </li>

            {/* Recruiter-Only Navigation Links */}
            {isAuthenticated && user?.role === "recruiter" && (
              <li>
                <NavLink 
                  to="/create-job" 
                  className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                >
                  <svg className="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                  </svg>
                  <span className="nav-text">Post Job</span>
                </NavLink>
              </li>
            )}

            {/* Dashboard Navigation Link for all Authenticated Users */}
            {isAuthenticated && (
              <li>
                <NavLink 
                  to="/dashboard" 
                  className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                >
                  <svg className="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 13h6c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1zm0 8h6c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1zm10 0h6c.55 0 1-.45 1-1v-8c0-.55-.45-1-1-1h-6c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1zM14 4v4c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1h-6c-.55 0-1 .45-1 1z"/>
                  </svg>
                  <span className="nav-text">Dashboard</span>
                </NavLink>
              </li>
            )}

            {/* Applications Navigation Link for both Recruiters and Candidates */}
            {isAuthenticated && (
              <li>
                <NavLink 
                  to="/applications" 
                  className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                >
                  <svg className="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>
                  </svg>
                  <span className="nav-text">Applications</span>
                </NavLink>
              </li>
            )}
          </ul>

          <button 
            onClick={toggleTheme} 
            className="theme-toggle-btn"
            aria-label="Toggle Theme"
            style={{ 
              borderRadius: "var(--radius-full)", 
              width: "36px", 
              height: "36px", 
              padding: 0, 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              border: "1px solid var(--gray-light)",
              background: "var(--input-bg)",
              color: "var(--dark)",
              marginRight: "12px",
              cursor: "pointer",
              transition: "all var(--transition)"
            }}
          >
            {theme === "light" ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            )}
          </button>

          {/* Conditional authentication menu */}
          {isAuthenticated ? (
            <div className="navbar-user-dropdown-container">
              <div 
                className="navbar-profile-avatar"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <span className="avatar-initials">{initial}</span>
                <div className="avatar-badge"></div>
              </div>

              {dropdownOpen && (
                <div className="navbar-dropdown-box glass">
                  <div className="dropdown-user-info">
                    <p className="dropdown-username">{user.name}</p>
                    <p className="dropdown-userrole">{user.role === "recruiter" ? "Employer 🏢" : "Job Seeker 💼"}</p>
                  </div>
                  
                  <Link 
                    to="/profile" 
                    onClick={() => setDropdownOpen(false)} 
                    style={{ 
                      display: "block", 
                      padding: "10px 16px", 
                      fontSize: "var(--font-size-xs)", 
                      borderTop: "1px solid var(--gray-lighter)", 
                      color: "var(--primary)",
                      fontWeight: "600"
                    }}
                  >
                    👤 My Profile
                  </Link>

                  <Link 
                    to="/dashboard" 
                    onClick={() => setDropdownOpen(false)} 
                    style={{ 
                      display: "block", 
                      padding: "10px 16px", 
                      fontSize: "var(--font-size-xs)", 
                      borderTop: "1px solid var(--gray-lighter)", 
                      borderBottom: "1px solid var(--gray-lighter)",
                      color: "var(--primary)",
                      fontWeight: "600"
                    }}
                  >
                    📊 My Dashboard
                  </Link>

                  <button 
                    onClick={handleLogout} 
                    className="btn btn-danger btn-sm btn-block dropdown-logout-btn"
                    style={{ marginTop: "8px" }}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="navbar-auth-buttons">
              <Link to="/login" className="btn btn-secondary btn-sm login-nav-btn">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm register-nav-btn">
                Join Now
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;