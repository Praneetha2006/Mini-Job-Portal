import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getMyApplications, getSavedJobs, unsaveJob } from "../../api/jobApi";
import Loader from "../../components/Loader/Loader";

function CandidateDashboard() {
  const { user, refreshUser } = useAuth();
  
  // Lists states
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("applied"); // 'applied' or 'saved'

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const apps = await getMyApplications();
      setAppliedJobs(apps);
      
      const bookmarks = await getSavedJobs();
      setSavedJobs(bookmarks);
    } catch (error) {
      console.error("Error fetching candidate dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (jobId) => {
    if (window.confirm("Are you sure you want to remove this job from your bookmarks?")) {
      try {
        await unsaveJob(jobId);
        // Refresh local list
        setSavedJobs(savedJobs.filter((b) => b.jobId && b.jobId._id !== jobId));
        // Refresh context user state
        await refreshUser();
      } catch (error) {
        console.error("Error unsaving job:", error);
        alert(error.message || "Failed to remove job bookmark");
      }
    }
  };

  if (loading) {
    return <Loader />;
  }

  const initial = user && user.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <div className="candidate-layout">
      {/* Dashboard Top Title Bar */}
      <div className="dashboard-header">
        <div className="dashboard-header-title">
          <h1>Candidate Dashboard</h1>
          <p>Manage your profile, applications, and bookmarked listings</p>
        </div>
      </div>

      <div className="candidate-grid">
        {/* LEFT COLUMN: Candidate Profile Details Panel */}
        <div className="dashboard-card-section profile-details-card">
          <div className="profile-avatar-large">{initial}</div>
          <div className="profile-identity">
            <h3>{user.name}</h3>
            <p>{user.email}</p>
            <span className="badge badge-accent mt-sm">Job Seeker</span>
          </div>

          <div className="profile-fields-list">
            <div className="profile-field-item">
              <span className="profile-field-label">📍 Location</span>
              <span className="profile-field-val">{user.location || "Not set"}</span>
            </div>
            
            <div className="profile-field-item">
              <span className="profile-field-label">💼 Experience</span>
              <span className="profile-field-val">
                {user.experience !== undefined ? `${user.experience} year${user.experience !== 1 ? "s" : ""}` : "Not set"}
              </span>
            </div>

            <div className="profile-field-item">
              <span className="profile-field-label">⚡ Skills</span>
              <span className="profile-field-val">
                {user.skills ? (
                  <div className="skills-badge-list mt-sm" style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                    {user.skills.split(",").map((skill, index) => (
                      <span key={index} className="badge badge-primary" style={{ fontSize: "10px" }}>
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                ) : (
                  "Not set"
                )}
              </span>
            </div>
          </div>

          <Link 
            to="/profile" 
            className="btn btn-secondary btn-block mt-lg"
            style={{ textAlign: "center", display: "inline-flex" }}
          >
            👤 Edit Profile Info
          </Link>
        </div>

        {/* RIGHT COLUMN: Application History / Saved Bookmarks Tabs */}
        <div className="candidate-main-panel">
          <div className="panel-tabs-row">
            <button
              onClick={() => setActiveTab("applied")}
              className={`panel-tab ${activeTab === "applied" ? "active" : ""}`}
            >
              Applied Jobs ({appliedJobs.length})
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={`panel-tab ${activeTab === "saved" ? "active" : ""}`}
            >
              Saved Bookmarks ({savedJobs.length})
            </button>
          </div>

          {activeTab === "applied" ? (
            /* Applied Jobs Tab */
            appliedJobs.length === 0 ? (
              <div className="dashboard-empty-card">
                <p>You haven't submitted any job applications yet.</p>
                <Link to="/" className="btn btn-primary btn-sm mt-md">
                  Browse Active Jobs
                </Link>
              </div>
            ) : (
              <div className="simple-feed-list">
                {appliedJobs.map((app) => (
                  <div key={app._id} className="simple-feed-item">
                    <div className="item-main-details">
                      <h4>{app.jobId ? app.jobId.title : "Unknown Title"}</h4>
                      <p>{app.jobId ? app.jobId.company : "Unknown Company"} &bull; {app.jobId ? app.jobId.location : "Remote"}</p>
                      <span className="item-date-text">
                        Applied Date: {new Date(app.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                    {app.jobId && (
                      <Link to={`/job/${app.jobId._id}`} className="btn btn-secondary btn-sm">
                        View Details
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )
          ) : (
            /* Bookmarked/Saved Jobs Tab */
            savedJobs.length === 0 ? (
              <div className="dashboard-empty-card">
                <p>You don't have any bookmarked jobs.</p>
                <Link to="/" className="btn btn-primary btn-sm mt-md">
                  Search & Save Jobs
                </Link>
              </div>
            ) : (
              <div className="simple-feed-list">
                {savedJobs.map((bookmark) => {
                  const job = bookmark.jobId;
                  if (!job) return null;
                  return (
                    <div key={bookmark._id} className="simple-feed-item">
                      <div className="item-main-details">
                        <h4>{job.title}</h4>
                        <p>{job.company} &bull; {job.location}</p>
                        <span className="item-date-text">
                          Saved Date: {new Date(bookmark.savedAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                      <div className="action-buttons-flex">
                        <Link to={`/job/${job._id}`} className="btn btn-primary btn-sm">
                          Apply Now
                        </Link>
                        <button 
                          onClick={() => handleUnsave(job._id)} 
                          className="btn btn-danger btn-sm"
                        >
                          🗑 Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default CandidateDashboard;
