import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getJobs, getApplications, getJobById, getMyApplications } from "../../api/jobApi";
import { useAuth } from "../../context/AuthContext";
import "./Applications.css";
import Loader from "../../components/Loader/Loader";

function Applications() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State for specific job view (recruiter)
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  
  // State for all jobs summary view (recruiter)
  const [jobsSummary, setJobsSummary] = useState([]);
  
  // State for candidate's own applications (candidate)
  const [candidateApps, setCandidateApps] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [activeCoverLetterId, setActiveCoverLetterId] = useState(null);

  useEffect(() => {
    if (id) {
      // Recruiter checking applicants for a specific job
      fetchJobApplications(id);
    } else if (user?.role === "recruiter") {
      // Recruiter summary list of all jobs
      fetchAllJobsSummary();
    } else if (user?.role === "candidate") {
      // Candidate checking their own applications
      fetchCandidateApplications();
    }
  }, [id, user]);

  // Fetch applications for a single job post (recruiter view)
  const fetchJobApplications = async (jobId) => {
    try {
      setLoading(true);
      const [jobData, appData] = await Promise.all([
        getJobById(jobId),
        getApplications(jobId)
      ]);
      setJob(jobData);
      setApplications(appData.reverse());
    } catch (error) {
      console.error("Error fetching job applications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all jobs and calculate application counts (recruiter view)
  const fetchAllJobsSummary = async () => {
    try {
      setLoading(true);
      const jobsList = await getJobs();
      
      const jobsWithCounts = await Promise.all(
        jobsList.map(async (j) => {
          try {
            const apps = await getApplications(j._id);
            return { ...j, appCount: apps.length };
          } catch (err) {
            return { ...j, appCount: 0 };
          }
        })
      );
      
      setJobsSummary(jobsWithCounts.reverse());
    } catch (error) {
      console.error("Error fetching jobs summary:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch candidate's own submitted applications (candidate view)
  const fetchCandidateApplications = async () => {
    try {
      setLoading(true);
      const data = await getMyApplications();
      setCandidateApps(data.reverse());
    } catch (error) {
      console.error("Error fetching candidate applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCoverLetter = (appId) => {
    setActiveCoverLetterId(activeCoverLetterId === appId ? null : appId);
  };

  if (loading) {
    return (
      <div className="applications-page">
        <div className="container">
          <Loader />
        </div>
      </div>
    );
  }

  // ================= VIEW 1: RECRUITER VIEWING JOB-SPECIFIC CANDIDATES =================
  if (id) {
    return (
      <div className="applications-page">
        <div className="container apps-container">
          <div className="apps-navigation">
            <button className="apps-back-btn" onClick={() => navigate("/applications")}>
              ← Back to Dashboard
            </button>
            {job && (
              <Link to={`/job/${job._id}`} className="btn btn-secondary btn-sm">
                👁️ View Job Post
              </Link>
            )}
          </div>

          <header className="apps-header-section">
            <span className="badge badge-primary">Recruiter View</span>
            <h1>Applicants for {job ? job.title : "Job"}</h1>
            <p className="apps-subtitle">
              {job ? job.company : ""} • {applications.length} candidate{applications.length !== 1 ? "s" : ""} applied
            </p>
          </header>

          {applications.length === 0 ? (
            <div className="apps-empty-card">
              <div className="empty-icon">📂</div>
              <h3>No Applicants Yet</h3>
              <p>No candidates have applied to this job posting yet.</p>
              <Link to="/" className="btn btn-primary mt-md">Back to Home</Link>
            </div>
          ) : (
            <div className="applicants-grid">
              {applications.map((app) => (
                <div key={app._id} className="applicant-detail-card">
                  <div className="applicant-card-header">
                    <div className="applicant-avatar">
                      {app.name ? app.name.split(" ").map(n => n[0]).join("").toUpperCase() : "A"}
                    </div>
                    <div className="applicant-basic-info">
                      <h4>{app.name}</h4>
                      <p className="applied-time-stamp">
                        Applied: {new Date(app.createdAt || Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="applicant-contacts">
                    <div className="contact-row">
                      <span className="contact-icon">📧</span>
                      <a href={`mailto:${app.email}`} className="contact-link">{app.email}</a>
                    </div>
                    <div className="contact-row">
                      <span className="contact-icon">📞</span>
                      <a href={`tel:${app.phone}`} className="contact-link">{app.phone}</a>
                    </div>
                  </div>

                  {app.resume && (
                    <div className="resume-section">
                      <a 
                        href={app.resume} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="btn btn-accent btn-sm btn-block"
                      >
                        📄 View Submitted Resume
                      </a>
                    </div>
                  )}

                  {app.coverLetter && (
                    <div className="cover-letter-section">
                      <button 
                        onClick={() => toggleCoverLetter(app._id)}
                        className="btn btn-secondary btn-sm btn-block toggle-cover-btn"
                      >
                        {activeCoverLetterId === app._id ? "Hide Cover Letter" : "Read Cover Letter"}
                      </button>
                      
                      {activeCoverLetterId === app._id && (
                        <div className="cover-letter-body">
                          <p>{app.coverLetter}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ================= VIEW 2: CANDIDATE TRACKING THEIR OWN APPLICATIONS =================
  if (user?.role === "candidate") {
    return (
      <div className="applications-page">
        <div className="container apps-container">
          <header className="apps-header-section">
            <span className="badge badge-accent">Candidate View</span>
            <h1>My Job Applications</h1>
            <p className="apps-subtitle">Track and review all the positions you've applied to.</p>
          </header>

          {candidateApps.length === 0 ? (
            <div className="apps-empty-card">
              <div className="empty-icon">💼</div>
              <h3>No Applications Sent</h3>
              <p>You haven't submitted any job applications yet. Browse active listings and find your next role.</p>
              <Link to="/" className="btn btn-primary mt-md">Explore Job Postings</Link>
            </div>
          ) : (
            <div className="dashboard-jobs-list">
              {candidateApps.map((app) => {
                const targetJob = app.jobId;
                if (!targetJob) return null;
                
                const jobType = targetJob.type ? targetJob.type.replace("-", " ") : "Full Time";
                const companyInitial = targetJob.company ? targetJob.company.charAt(0).toUpperCase() : "J";

                return (
                  <div key={app._id} className="dashboard-job-item">
                    <div className="dashboard-job-info">
                      <div className="dashboard-job-logo-placeholder" style={{ backgroundColor: "var(--accent-light)", color: "var(--accent-dark)" }}>
                        {companyInitial}
                      </div>
                      <div>
                        <h3 className="dashboard-job-title">{targetJob.title}</h3>
                        <p className="dashboard-job-company">
                          {targetJob.company} • {targetJob.location}
                        </p>
                        <div className="badge-row mt-sm" style={{ display: "flex", gap: "8px" }}>
                          <span className="badge badge-primary">{jobType}</span>
                          <span className="badge badge-accent">${targetJob.salary ? targetJob.salary.toLocaleString() : "N/A"}/yr</span>
                        </div>
                      </div>
                    </div>

                    <div className="dashboard-job-stats">
                      <div className="applicant-counter" style={{ minWidth: "110px" }}>
                        <span className="count-num" style={{ color: "var(--accent)", fontSize: "var(--font-size-lg)" }}>
                          Submitted
                        </span>
                        <span className="count-lbl">
                          Applied: {new Date(app.createdAt || Date.now()).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="dashboard-item-actions">
                        <Link to={`/job/${targetJob._id}`} className="btn btn-secondary btn-sm">
                          👁️ View Position
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ================= VIEW 3: RECRUITER LISTING SUMMARY DASHBOARD =================
  return (
    <div className="applications-page">
      <div className="container apps-container">
        <header className="apps-header-section">
          <span className="badge badge-primary">Recruiter View</span>
          <h1>Applications Dashboard</h1>
          <p className="apps-subtitle">Track and review incoming applications for all active job postings.</p>
        </header>

        {jobsSummary.length === 0 ? (
          <div className="apps-empty-card">
            <div className="empty-icon">💼</div>
            <h3>No Active Job Postings</h3>
            <p>You haven't posted any jobs yet. Create a job posting first to start receiving applications.</p>
            <Link to="/create-job" className="btn btn-primary mt-md">Post a Job Now</Link>
          </div>
        ) : (
          <div className="dashboard-jobs-list">
            {jobsSummary.map((j) => (
              <div key={j._id} className="dashboard-job-item">
                <div className="dashboard-job-info">
                  <div className="dashboard-job-logo-placeholder">
                    {j.company ? j.company.charAt(0).toUpperCase() : "J"}
                  </div>
                  <div>
                    <h3 className="dashboard-job-title">{j.title}</h3>
                    <p className="dashboard-job-company">{j.company} • {j.location}</p>
                    <span className="badge badge-primary mt-sm">
                      {j.type ? j.type.replace("-", " ") : "Full Time"}
                    </span>
                  </div>
                </div>

                <div className="dashboard-job-stats">
                  <div className="applicant-counter">
                    <span className="count-num">{j.appCount}</span>
                    <span className="count-lbl">applicant{j.appCount !== 1 ? "s" : ""}</span>
                  </div>
                  
                  <div className="dashboard-item-actions">
                    <Link 
                      to={`/applications/${j._id}`} 
                      className="btn btn-primary btn-sm"
                      disabled={j.appCount === 0}
                    >
                      📊 Review Applicants
                    </Link>
                    <Link to={`/job/${j._id}`} className="btn btn-secondary btn-sm">
                      👁️ View Post
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Applications;