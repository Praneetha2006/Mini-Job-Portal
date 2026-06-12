import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { updateProfile } from "../../api/authApi";
import "./Profile.css";

function Profile() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    skills: "",
    experience: 0,
    location: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        skills: user.skills || "",
        experience: user.experience || 0,
        location: user.location || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return;
    }

    try {
      setUpdating(true);
      setError("");
      setSuccess("");

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
      };

      if (user.role === "candidate") {
        payload.skills = formData.skills.trim();
        payload.experience = Number(formData.experience);
        payload.location = formData.location.trim();
      }

      await updateProfile(payload);
      await refreshUser();
      
      setSuccess("Profile settings updated successfully!");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Profile update error:", err);
      setError(err.message || "Failed to update profile.");
    } finally {
      setUpdating(false);
    }
  };

  if (!user) return null;

  const initial = user.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase() : "U";
  const roleText = user.role === "recruiter" ? "Employer 🏢" : "Job Seeker 💼";

  return (
    <div className="profile-page-wrapper">
      <div className="container profile-container">
        
        {/* Navigation Header Bar */}
        <div className="profile-header-navigation">
          <button 
            onClick={() => navigate("/dashboard")} 
            className="details-back-btn"
          >
            ← Back to Dashboard
          </button>
          <span className="profile-navigation-title">My Account Settings</span>
        </div>

        <div className="profile-grid-layout">
          
          {/* LEFT COLUMN: Profile Summary Card */}
          <aside className="profile-sidebar-card card glass">
            <div className="profile-avatar-large-glow">
              {initial}
            </div>
            
            <div className="profile-sidebar-identity">
              <h3>{user.name}</h3>
              <p className="profile-sidebar-email">{user.email}</p>
              <span className={`badge ${user.role === "recruiter" ? "badge-primary" : "badge-accent"}`}>
                {roleText}
              </span>
            </div>

            <div className="profile-sidebar-details">
              {user.role === "candidate" ? (
                <>
                  <div className="sidebar-detail-item">
                    <span className="sidebar-detail-label">📍 Location</span>
                    <span className="sidebar-detail-val">{user.location || "Not specified"}</span>
                  </div>
                  
                  <div className="sidebar-detail-item">
                    <span className="sidebar-detail-label">💼 Experience</span>
                    <span className="sidebar-detail-val">
                      {user.experience !== undefined ? `${user.experience} year${user.experience !== 1 ? "s" : ""}` : "Not specified"}
                    </span>
                  </div>

                  <div className="sidebar-detail-item">
                    <span className="sidebar-detail-label">⚡ Core Skills</span>
                    <div className="skills-badge-flex">
                      {user.skills ? (
                        user.skills.split(",").map((skill, idx) => (
                          <span key={idx} className="badge badge-primary skill-mini-badge">
                            {skill.trim()}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted" style={{ fontSize: "var(--font-size-xs)" }}>None listed</span>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="sidebar-detail-item">
                  <span className="sidebar-detail-label">🏢 Account Role</span>
                  <span className="sidebar-detail-val">Recruitment Manager</span>
                </div>
              )}
            </div>
          </aside>

          {/* RIGHT COLUMN: Settings Form */}
          <main className="profile-settings-main card">
            <div className="settings-header-box">
              <h3>Personal Settings</h3>
              <p>Customize your account details and contact information.</p>
            </div>

            {error && (
              <div className="register-alert-error mb-lg">
                <span className="alert-icon">⚠️</span>
                <span className="alert-text">{error}</span>
              </div>
            )}

            {success && (
              <div className="badge badge-success mb-lg p-md" style={{ display: "block", textAlign: "center", width: "100%", padding: "10px" }}>
                🎉 {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="profile-settings-form">
              <div className="settings-form-grid">
                
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                {user.role === "candidate" && (
                  <>
                    <div className="form-group">
                      <label htmlFor="location">Location (City, State / Remote)</label>
                      <input
                        id="location"
                        type="text"
                        name="location"
                        placeholder="e.g. Remote or San Francisco, CA"
                        value={formData.location}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="experience">Years of Experience</label>
                      <input
                        id="experience"
                        type="number"
                        name="experience"
                        min="0"
                        max="50"
                        value={formData.experience}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group full-width">
                      <label htmlFor="skills">Professional Skills (Comma separated list)</label>
                      <textarea
                        id="skills"
                        name="skills"
                        placeholder="e.g. JavaScript, React, Node.js, HTML5, CSS3"
                        value={formData.skills}
                        onChange={handleChange}
                        rows="4"
                      />
                    </div>
                  </>
                )}

              </div>

              <div className="profile-action-bar">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="btn btn-secondary"
                  disabled={updating}
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={updating}
                >
                  {updating ? "Saving Changes..." : "Save Settings"}
                </button>
              </div>
            </form>
          </main>

        </div>
      </div>
    </div>
  );
}

export default Profile;
