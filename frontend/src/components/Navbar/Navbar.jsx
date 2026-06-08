import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import "./Navbar.css";

function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
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
                  <button onClick={handleLogout} className="btn btn-danger btn-sm btn-block dropdown-logout-btn">
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