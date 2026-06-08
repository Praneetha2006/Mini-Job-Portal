import "./Home.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getJobs, getApplications, getMyApplications } from "../../api/jobApi";
import { useAuth } from "../../context/AuthContext";
import JobCard from "../../components/JobCard/JobCard";
import Loader from "../../components/Loader/Loader";

function Home() {
  const { user, isAuthenticated } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  
  // State for candidate's application count
  const [candidateAppCount, setCandidateAppCount] = useState(0);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [jobs, search, filter]);

  useEffect(() => {
    if (isAuthenticated && user?.role === "candidate" && jobs.length > 0) {
      calculateCandidateApplications();
    }
  }, [isAuthenticated, user, jobs]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await getJobs();
      setJobs(data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCandidateApplications = async () => {
    try {
      const data = await getMyApplications();
      setCandidateAppCount(data.length);
    } catch (err) {
      console.error("Error calculating candidate application count:", err);
    }
  };

  const applyFilters = () => {
    let result = jobs;

    if (search) {
      const query = search.toLowerCase();
      result = result.filter(
        (job) =>
          (job.title && job.title.toLowerCase().includes(query)) ||
          (job.company && job.company.toLowerCase().includes(query)) ||
          (job.location && job.location.toLowerCase().includes(query))
      );
    }

    if (filter !== "All") {
      result = result.filter((job) => {
        if (!job.type) return false;
        const normalizedJobType = job.type.replace("-", " ").toLowerCase();
        const normalizedFilter = filter.replace("-", " ").toLowerCase();
        return normalizedJobType.includes(normalizedFilter);
      });
    }

    setFilteredJobs(result);
  };

  // Live Stats calculations
  const totalJobs = jobs.length;
  const fullTimeCount = jobs.filter(j => j.type && j.type.replace("-", " ").toLowerCase().includes("full")).length;
  const partTimeCount = jobs.filter(j => j.type && j.type.replace("-", " ").toLowerCase().includes("part")).length;
  const contractCount = jobs.filter(j => j.type && j.type.replace("-", " ").toLowerCase().includes("contract")).length;

  const getUserInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  return (
    <div className="home-page">
      <div className="container home-container">
        {/* LEFT COLUMN: User Profile Widget (Dynamic) */}
        <aside className="home-sidebar-left">
          {!isAuthenticated ? (
            /* Guest Widget */
            <div className="sidebar-card profile-widget guest-widget">
              <div className="profile-banner"></div>
              <div className="profile-info">
                <div className="profile-avatar">?</div>
                <h3 className="profile-name">Welcome Guest</h3>
                <p className="profile-title">Find job listings & connect</p>
              </div>
              <div className="guest-cta-box">
                <p className="guest-prompt">Sign in to post job openings, manage applications, and easily apply to active roles.</p>
                <Link to="/login" className="btn btn-primary btn-sm btn-block">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-secondary btn-sm btn-block">
                  Create Account
                </Link>
              </div>
            </div>
          ) : user.role === "recruiter" ? (
            /* Recruiter Widget */
            <div className="sidebar-card profile-widget">
              <div className="profile-banner"></div>
              <div className="profile-info">
                <div className="profile-avatar">{getUserInitials(user.name)}</div>
                <h3 className="profile-name">{user.name}</h3>
                <p className="profile-title">Employer 🏢</p>
              </div>
              <div className="profile-stats">
                <div className="profile-stat-row">
                  <span className="stat-label">Active Listings</span>
                  <span className="stat-value">{totalJobs}</span>
                </div>
                <div className="profile-stat-row">
                  <span className="stat-label">Full-Time Posts</span>
                  <span className="stat-value">{fullTimeCount}</span>
                </div>
                <div className="profile-stat-row">
                  <span className="stat-label">Part-Time / Contract</span>
                  <span className="stat-value">{partTimeCount + contractCount}</span>
                </div>
              </div>
              <div className="profile-actions">
                <Link to="/create-job" className="btn btn-primary btn-sm btn-block">
                  ＋ Post a Job
                </Link>
                <Link to="/applications" className="btn btn-secondary btn-sm btn-block">
                  🗂 Manage Applications
                </Link>
              </div>
            </div>
          ) : (
            /* Candidate Widget */
            <div className="sidebar-card profile-widget">
              <div className="profile-banner"></div>
              <div className="profile-info">
                <div className="profile-avatar">{getUserInitials(user.name)}</div>
                <h3 className="profile-name">{user.name}</h3>
                <p className="profile-title">Job Seeker 💼</p>
              </div>
              <div className="profile-stats">
                <div className="profile-stat-row">
                  <span className="stat-label">Tracked Applications</span>
                  <span className="stat-value">{candidateAppCount}</span>
                </div>
                <div className="profile-stat-row">
                  <span className="stat-label">Membership</span>
                  <span className="stat-value">Active Seek</span>
                </div>
              </div>
              <div className="profile-actions">
                <button onClick={() => { setSearch(""); setFilter("All"); }} className="btn btn-primary btn-sm btn-block">
                  🔍 Browse Jobs
                </button>
              </div>
            </div>
          )}
        </aside>

        {/* CENTER COLUMN: Job Search, Filters, Feed */}
        <main className="home-main-feed">
          <div className="feed-header-card">
            <h2 className="feed-greeting">
              {isAuthenticated ? `Welcome back, ${user.name.split(" ")[0]}!` : "Find Your Perfect Job"}
            </h2>
            <p className="feed-subtext">Search active job openings or apply filters below.</p>
            
            <div className="search-filter-controls">
              <div className="search-box-wrapper">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search by title, company, or location..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="feed-search-input"
                />
              </div>

              <div className="filter-select-wrapper">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="feed-filter-select"
                >
                  <option value="All">All Job Types</option>
                  <option value="Full Time">Full-Time</option>
                  <option value="Part Time">Part-Time</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>
            </div>

            <div className="feed-stats-row">
              <span className="results-count-text">
                Showing <strong>{filteredJobs.length}</strong> matching job{filteredJobs.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Job Feed List */}
          {loading ? (
            <Loader />
          ) : filteredJobs.length === 0 ? (
            <div className="feed-empty-card">
              <div className="empty-icon">📭</div>
              <h3>No Jobs Found</h3>
              <p>We couldn't find any job posts matching your criteria. Try widening your search queries or resetting filters.</p>
              <button onClick={() => { setSearch(""); setFilter("All"); }} className="btn btn-primary mt-md">
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="jobs-feed-list">
              {filteredJobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Home;