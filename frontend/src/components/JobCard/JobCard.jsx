import "./JobCard.css";
import { Link } from "react-router-dom";

function JobCard({ job }) {
  // Normalize job type casing (e.g., "Full-time" -> "Full Time")
  const type = job.type ? job.type.replace("-", " ") : "Full Time";
  
  const getBadgeClass = (jobType) => {
    const t = jobType.toLowerCase();
    if (t.includes("full")) return "badge-primary";
    if (t.includes("part")) return "badge-warning";
    if (t.includes("contract")) return "badge-accent";
    return "badge-primary";
  };

  // Generate a consistent profile logo color based on company name
  const getLogoBgColor = (name) => {
    const colors = ["#4f46e5", "#0d9488", "#7c3aed", "#db2777", "#2563eb", "#ea580c"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const initial = job.company ? job.company.charAt(0).toUpperCase() : "J";
  const logoBg = getLogoBgColor(job.company || "Company");

  return (
    <div className="job-card">
      <div className="job-card-top">
        <div className="company-logo" style={{ backgroundColor: logoBg }}>
          {initial}
        </div>
        <div className="job-info-header">
          <Link to={`/job/${job._id}`} className="job-title-link">
            <h3 className="job-card-title">{job.title}</h3>
          </Link>
          <p className="job-card-company">{job.company}</p>
        </div>
      </div>

      <div className="job-card-meta">
        <div className="job-meta-row">
          <span className="job-meta-icon">📍</span>
          <span className="job-meta-text">{job.location}</span>
        </div>
        <div className="job-meta-row">
          <span className="job-meta-icon">💰</span>
          <span className="job-meta-text">
            ${job.salary ? job.salary.toLocaleString() : "N/A"} / yr
          </span>
        </div>
      </div>

      <p className="job-card-description">
        {job.description && job.description.length > 100
          ? job.description.substring(0, 100) + "..."
          : job.description}
      </p>

      <div className="job-card-footer">
        <span className={`badge ${getBadgeClass(type)}`}>
          {type}
        </span>
        <Link to={`/job/${job._id}`} className="btn btn-secondary btn-sm details-btn">
          View Details
        </Link>
      </div>
    </div>
  );
}

export default JobCard;