import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Register.css";

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("candidate"); // 'candidate' or 'recruiter'
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validations
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill out all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setError("");
      setLoading(true);
      await register(name.trim(), email.toLowerCase().trim(), password, role);
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to create account. Email might already be taken.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card-wrapper card glass">
        <div className="register-header">
          <div className="brand-logo-large">S</div>
          <h2>Join Stikbook</h2>
          <p>Make the most of your professional life</p>
        </div>

        {error && (
          <div className="register-alert-error">
            <span className="alert-icon">⚠️</span>
            <span className="alert-text">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="name">Your Name</label>
            <input
              id="name"
              type="text"
              placeholder="e.g. Jane Doe"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              required
            />
          </div>

          {/* Role Selection Box */}
          <div className="form-group">
            <label>I want to join as a:</label>
            <div className="role-selector-grid">
              <div 
                className={`role-option-card ${role === "candidate" ? "selected" : ""}`}
                onClick={() => setRole("candidate")}
              >
                <div className="role-radio-circle"></div>
                <div className="role-option-text">
                  <h5>Candidate</h5>
                  <p>I am looking for job opportunities</p>
                </div>
              </div>
              
              <div 
                className={`role-option-card ${role === "recruiter" ? "selected" : ""}`}
                onClick={() => setRole("recruiter")}
              >
                <div className="role-radio-circle"></div>
                <div className="role-option-text">
                  <h5>Recruiter</h5>
                  <p>I am hiring talent for my company</p>
                </div>
              </div>
            </div>
          </div>

          <div className="form-row-auth">
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="6+ characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError("");
                }}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block btn-lg submit-btn"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Agree & Join"}
          </button>
        </form>

        <div className="register-divider">
          <span>or</span>
        </div>

        <div className="register-footer">
          <p>
            Already on Stikbook? <Link to="/login" className="login-link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
