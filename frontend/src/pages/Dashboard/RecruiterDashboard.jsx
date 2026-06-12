import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getJobs, deleteJob, getRecruiterStats, getApplications } from "../../api/jobApi";
import Loader from "../../components/Loader/Loader";

function RecruiterDashboard() {
  const [myJobs, setMyJobs] = useState([]);
  const [stats, setStats] = useState({
    jobsPosted: 0,
    totalApplications: 0,
    mostApplied: { title: "None", count: 0 },
  });
  const [loading, setLoading] = useState(true);

  // Applicants Modal state
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchRecruiterDashboard();
  }, []);

  const fetchRecruiterDashboard = async () => {
    try {
      setLoading(true);
      
      // Fetch Recruiter's jobs list
      const jobsResponse = await getJobs({ postedBy: "me" });
      setMyJobs(jobsResponse.data || []);

      // Fetch dashboard metrics
      const statsResponse = await getRecruiterStats();
      setStats(statsResponse);
    } catch (error) {
      console.error("Error fetching recruiter dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (
      window.confirm(
        `Are you sure you want to delete the job listing: "${title}"? This will also delete all applications for this job.`
      )
    ) {
      try {
        await deleteJob(id);
        // Refresh dashboard data
        fetchRecruiterDashboard();
      } catch (error) {
        console.error("Error deleting job:", error);
        alert(error.message || "Failed to delete job listing");
      }
    }
  };

  const handleOpenApplicants = async (job) => {
    setSelectedJob(job);
    setShowModal(true);
    setLoadingApplicants(true);
    try {
      const applicantList = await getApplications(job._id);
      setApplicants(applicantList);
    } catch (error) {
      console.error("Error fetching applicants:", error);
      alert(error.message || "Failed to fetch candidate applications");
    } finally {
      setLoadingApplicants(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="recruiter-layout">
      {/* Dashboard Top Title Bar */}
      <div className="dashboard-header">
        <div className="dashboard-header-title">
          <h1>Employer Dashboard</h1>
          <p>Track metrics, manage listings, and inspect applicant details</p>
        </div>
        <Link to="/create-job" className="btn btn-primary">
          ＋ Create Job Opening
        </Link>
      </div>

      {/* KPI Stats Cards Row */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper">💼</div>
          <div className="stat-info">
            <span className="stat-val">{stats.jobsPosted}</span>
            <span className="stat-desc">Jobs Posted</span>
          </div>
        </div>

        <div className="stat-card accent">
          <div className="stat-icon-wrapper">📄</div>
          <div className="stat-info">
            <span className="stat-val">{stats.totalApplications}</span>
            <span className="stat-desc">Applications</span>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon-wrapper">🔥</div>
          <div className="stat-info">
            <span className="stat-val" style={{ fontSize: stats.mostApplied?.title?.length > 15 ? "var(--font-size-lg)" : "var(--font-size-xl)" }}>
              {stats.mostApplied?.title || "None"}
            </span>
            <span className="stat-desc">
              Most Applied {stats.mostApplied?.count > 0 ? `(${stats.mostApplied.count} apps)` : ""}
            </span>
          </div>
        </div>
      </div>

      {/* My Jobs Section */}
      <div className="dashboard-card-section">
        <div className="section-header-row">
          <h3>Your Job Listings ({myJobs.length})</h3>
        </div>

        {myJobs.length === 0 ? (
          <div className="dashboard-empty-card" style={{ padding: "4rem 2rem" }}>
            <p>You haven't posted any job openings yet.</p>
            <Link to="/create-job" className="btn btn-primary btn-sm mt-md">
              Create Your First Posting
            </Link>
          </div>
        ) : (
          <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Location</th>
                  <th>Salary</th>
                  <th>Type</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {myJobs.map((job) => (
                  <tr key={job._id}>
                    <td>
                      <div className="job-table-title">{job.title}</div>
                      <div className="job-table-company">{job.company}</div>
                    </td>
                    <td>📍 {job.location}</td>
                    <td>💰 ${job.salary ? job.salary.toLocaleString() : "N/A"}</td>
                    <td>
                      <span className={`badge ${job.type?.toLowerCase().includes("full") ? "badge-primary" : "badge-accent"}`}>
                        {job.type}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons-flex" style={{ justifyContent: "flex-end" }}>
                        <button
                          onClick={() => handleOpenApplicants(job)}
                          className="btn btn-accent btn-sm"
                        >
                          👥 Applicants
                        </button>
                        <Link
                          to={`/edit-job/${job._id}`}
                          className="btn btn-secondary btn-sm"
                        >
                          ✏️ Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(job._id, job.title)}
                          className="btn btn-danger btn-sm"
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* APPLICANTS MODAL */}
      {showModal && (
        <div className="dashboard-modal-backdrop">
          <div className="dashboard-modal-card" style={{ maxWidth: "700px" }}>
            <div className="modal-header">
              <h3>
                Applicants for "{selectedJob?.title}"
              </h3>
              <button onClick={() => setShowModal(false)} className="modal-close-btn">
                &times;
              </button>
            </div>

            <div className="modal-body">
              {loadingApplicants ? (
                <Loader />
              ) : applicants.length === 0 ? (
                <div className="dashboard-empty-card" style={{ border: "none" }}>
                  <p>No candidates have applied for this job listing yet.</p>
                </div>
              ) : (
                <div className="applicant-card-list">
                  {applicants.map((app) => (
                    <div key={app._id} className="applicant-card">
                      <div className="applicant-card-header">
                        <h4>{app.name}</h4>
                        <span className="item-date-text">
                          Applied: {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="applicant-contact-info">
                        <span>📧 {app.email}</span>
                        <span>📞 {app.phone}</span>
                        {app.resume && (
                          <span>
                            📄{" "}
                            <a
                              href={app.resume}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ fontWeight: "600", textDecoration: "underline" }}
                            >
                              Open Resume File
                            </a>
                          </span>
                        )}
                      </div>

                      <div className="applicant-cover-letter">
                        <strong>Cover Letter:</strong>
                        <p style={{ marginTop: "8px", fontStyle: "italic" }}>
                          {app.coverLetter || "No cover letter provided."}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button onClick={() => setShowModal(false)} className="btn btn-secondary">
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecruiterDashboard;
