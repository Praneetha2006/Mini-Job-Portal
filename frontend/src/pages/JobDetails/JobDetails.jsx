import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getJobById, applyJob, getMyApplications, saveJob, unsaveJob } from "../../api/jobApi";
import { useAuth } from "../../context/AuthContext";
import "./JobDetails.css";
import Loader from "../../components/Loader/Loader";

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, refreshUser } = useAuth();
  
  const [job, setJob] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showApply, setShowApply] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appData, setAppData] = useState({
    name: "",
    email: "",
    phone: "",
    resume: "",
    coverLetter: "",
  });

  useEffect(() => {
    fetchJob();
  }, [id]);

  // Pre-fill candidate profile information if logged in
  useEffect(() => {
    if (isAuthenticated && user?.role === "candidate") {
      setAppData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
      }));
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated && user?.role === "candidate" && user.savedJobs) {
      const alreadySaved = user.savedJobs.some(bookmark => {
        const jobIdStr = bookmark.jobId?._id ? bookmark.jobId._id.toString() : (bookmark.jobId?.toString() || bookmark.toString());
        return jobIdStr === id;
      });
      setIsSaved(alreadySaved);
    }
  }, [user, id, isAuthenticated]);

  const handleSaveToggle = async () => {
    try {
      if (isSaved) {
        await unsaveJob(id);
      } else {
        await saveJob(id);
      }
      await refreshUser();
    } catch (error) {
      console.error("Error toggling save job:", error);
      alert(error.message || "Failed to update save status");
    }
  };

  const fetchJob = async () => {
    try {
      setLoading(true);
      const data = await getJobById(id);
      setJob(data);

      // Check if logged in candidate has already applied to this job
      if (isAuthenticated && user?.role === "candidate") {
        try {
          const userApps = await getMyApplications();
          const alreadyApplied = userApps.some(app => {
            const jobIdStr = app.jobId?._id ? app.jobId._id.toString() : app.jobId?.toString();
            return jobIdStr === id;
          });
          setHasApplied(alreadyApplied);
        } catch (err) {
          console.error("Error checking candidate applied status:", err);
        }
      }
    } catch (error) {
      console.error("Error fetching job details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyChange = (e) => {
    const { name, value } = e.target;
    setAppData({ ...appData, [name]: value });
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await applyJob(id, appData);
      alert("Application submitted successfully!");
      setHasApplied(true);
      setShowApply(false);
      setAppData({ name: user?.name || "", email: user?.email || "", phone: "", resume: "", coverLetter: "" });
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="job-details-page">
        <div className="container">
          <Loader />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="job-details-page">
        <div className="container">
          <div className="details-empty-state">
            <h2>Job Posting Not Found</h2>
            <p>The job details you are trying to view are unavailable or have been deleted.</p>
            <button className="btn btn-primary mt-md" onClick={() => navigate("/")}>
              Back to Job Feed
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Casing normalization
  const jobType = job.type ? job.type.replace("-", " ") : "Full Time";

  // Dynamic logo generator
  const getLogoBgColor = (name) => {
    const colors = ["#4f46e5", "#0d9488", "#7c3aed", "#db2777", "#2563eb", "#ea580c"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const logoBg = getLogoBgColor(job.company || "Company");
  const initial = job.company ? job.company.charAt(0).toUpperCase() : "J";

  // Ownership checks
  const isJobOwner = isAuthenticated && 
                     user?.role === "recruiter" && 
                     job.postedBy && 
                     (job.postedBy._id === user._id || job.postedBy === user._id);

  return (
    <div className="job-details-page">
      <div className="container details-container">
        <div className="details-navigation">
          <button className="details-back-btn" onClick={() => navigate("/")}>
            ← Back to Job Feed
          </button>
          
          {isJobOwner && (
            <div className="action-buttons-group">
              <Link to={`/edit-job/${job._id}`} className="btn btn-secondary btn-sm">
                ✏️ Edit Job Listing
              </Link>
            </div>
          )}
        </div>

        <div className="details-layout-grid">
          {/* Main Job Details Content */}
          <main className="details-main-content">
            <div className="job-details-header">
              <div className="details-company-logo" style={{ backgroundColor: logoBg }}>
                {initial}
              </div>
              <div className="details-header-info">
                <h1>{job.title}</h1>
                <p className="details-company-name">{job.company}</p>
                <div className="details-badge-row">
                  <span className="badge badge-primary">{jobType}</span>
                  <span className="details-post-date">
                    Posted on {new Date(job.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Meta statistics strip */}
            <div className="details-meta-grid">
              <div className="details-meta-card">
                <span className="details-meta-label">📍 Location</span>
                <span className="details-meta-val">{job.location}</span>
              </div>
              <div className="details-meta-card">
                <span className="details-meta-label">💰 Annual Salary</span>
                <span className="details-meta-val">${job.salary ? job.salary.toLocaleString() : "N/A"}</span>
              </div>
              <div className="details-meta-card">
                <span className="details-meta-label">💼 Work Type</span>
                <span className="details-meta-val">{jobType}</span>
              </div>
            </div>

            <div className="details-body-section">
              <h2>About The Position</h2>
              <div className="details-description-text">
                {job.description}
              </div>
            </div>

            {/* Application & Bookmark actions - Only show for candidates or guests */}
            {(!isAuthenticated || user?.role === "candidate") && (
              <div className="details-footer-actions" style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                {hasApplied ? (
                  <button className="btn btn-secondary btn-lg" style={{ borderColor: "var(--success)", color: "var(--success)" }} disabled>
                    ✓ Applied Successfully
                  </button>
                ) : (
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={() => {
                      if (!isAuthenticated) {
                        navigate("/login", { state: { from: { pathname: `/job/${job._id}` } } });
                      } else {
                        setShowApply(!showApply);
                      }
                    }}
                  >
                    {!isAuthenticated ? "Log in to Apply" : showApply ? "Hide Form" : "Apply Now"}
                  </button>
                )}

                {isAuthenticated && user?.role === "candidate" && (
                  <button
                    className={`btn btn-lg ${isSaved ? "btn-secondary" : "btn-accent"}`}
                    onClick={handleSaveToggle}
                    style={{ minWidth: "160px" }}
                  >
                    {isSaved ? "⭐ Bookmarked" : "☆ Save Job"}
                  </button>
                )}
              </div>
            )}
          </main>

          {/* Sidebar Area: Forms & Stats */}
          <aside className="details-sidebar-content">
            {isAuthenticated && user?.role === "candidate" && showApply && !hasApplied ? (
              <div className="sidebar-form-card glass">
                <h3>Easy Apply</h3>
                <p className="form-sub-heading">Submit your details to {job.company} directly.</p>
                <form onSubmit={handleApplySubmit} className="apply-sidebar-form">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="e.g. John Doe"
                      value={appData.name}
                      onChange={handleApplyChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="john@example.com"
                      value={appData.email}
                      onChange={handleApplyChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="555-0199"
                      value={appData.phone}
                      onChange={handleApplyChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Resume Link *</label>
                    <input
                      type="url"
                      name="resume"
                      placeholder="https://drive.google.com/.../resume.pdf"
                      value={appData.resume}
                      onChange={handleApplyChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Cover Letter (Optional)</label>
                    <textarea
                      name="coverLetter"
                      placeholder="Introduce yourself and explain why you're a great fit..."
                      value={appData.coverLetter}
                      onChange={handleApplyChange}
                      rows="4"
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary btn-block"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </button>
                </form>
              </div>
            ) : (
              <div className="sidebar-info-card">
                <h3>Job Overview</h3>
                <div className="overview-item">
                  <span className="overview-lbl">Job ID</span>
                  <span className="overview-val">{job._id}</span>
                </div>
                <div className="overview-item">
                  <span className="overview-lbl">Location</span>
                  <span className="overview-val">{job.location}</span>
                </div>
                <div className="overview-item">
                  <span className="overview-lbl">Salary Range</span>
                  <span className="overview-val">${job.salary ? job.salary.toLocaleString() : "N/A"} / year</span>
                </div>
                <div className="overview-item">
                  <span className="overview-lbl">Category</span>
                  <span className="overview-val">{jobType}</span>
                </div>
                
                {/* Recruiters who own this job can review application counts */}
                {isJobOwner && (
                  <div className="sidebar-card-action">
                    <Link to={`/applications/${job._id}`} className="btn btn-secondary btn-sm btn-block">
                      📊 View Job Applications
                    </Link>
                  </div>
                )}

                {/* Prompts guest users */}
                {!isAuthenticated && (
                  <div className="sidebar-card-action text-center mt-md">
                    <p style={{ fontSize: "11px", color: "var(--gray)", marginBottom: "8px" }}>
                      Interested in this opening?
                    </p>
                    <Link to="/login" className="btn btn-primary btn-sm btn-block">
                      Login to Apply
                    </Link>
                  </div>
                )}

                {/* Candidate already applied indicator */}
                {isAuthenticated && user?.role === "candidate" && hasApplied && (
                  <div className="sidebar-card-action text-center mt-md" style={{ color: "var(--success)", fontWeight: "500", fontSize: "var(--font-size-xs)" }}>
                    🎉 Application Submitted on your account!
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

export default JobDetails;