import "./Home.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getJobs, getMyApplications } from "../../api/jobApi";
import { useAuth } from "../../context/AuthContext";
import JobCard from "../../components/JobCard/JobCard";
import Loader from "../../components/Loader/Loader";

function Home() {
  const { user, isAuthenticated } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States (Server-side)
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [sort, setSort] = useState("-createdAt");
  
  // Pagination States
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobsCount, setTotalJobsCount] = useState(0);
  const limit = 6; // Page limit size

  // Stats calculation state
  const [allJobsForStats, setAllJobsForStats] = useState([]);
  
  // State for candidate's application count
  const [candidateAppCount, setCandidateAppCount] = useState(0);

  // Fetch stats count data once on mount (or when a job changes)
  useEffect(() => {
    fetchStatsData();
    if (isAuthenticated && user?.role === "candidate") {
      calculateCandidateApplications();
    }
  }, [isAuthenticated, user]);

  // Fetch paginated jobs on filter change
  useEffect(() => {
    fetchPaginatedJobs();
  }, [search, location, filterType, minSalary, maxSalary, sort, page]);

  const fetchStatsData = async () => {
    try {
      // Fetch stats using unpaginated or large limit query
      const params = {};
      if (isAuthenticated && user?.role === "recruiter") {
        params.postedBy = "me";
      }
      params.limit = 1000;
      const response = await getJobs(params);
      setAllJobsForStats(response.data || []);
    } catch (err) {
      console.error("Error fetching stats data:", err);
    }
  };

  const fetchPaginatedJobs = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        sort,
      };

      if (search) params.search = search;
      if (location) params.location = location;
      if (filterType !== "All") params.type = filterType;
      if (minSalary) params.minSalary = minSalary;
      if (maxSalary) params.maxSalary = maxSalary;
      if (isAuthenticated && user?.role === "recruiter") {
        params.postedBy = "me";
      }

      const response = await getJobs(params);
      setJobs(response.data || []);
      setTotalPages(response.pages || 1);
      setTotalJobsCount(response.total || 0);
    } catch (error) {
      console.error("Error fetching paginated jobs:", error);
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

  const resetAllFilters = () => {
    setSearch("");
    setLocation("");
    setFilterType("All");
    setMinSalary("");
    setMaxSalary("");
    setSort("-createdAt");
    setPage(1);
  };

  // Stats derived from allJobsForStats
  const totalStatsCount = allJobsForStats.length;
  const fullTimeCount = allJobsForStats.filter(j => j.type && j.type.toLowerCase().includes("full")).length;
  const partTimeCount = allJobsForStats.filter(j => j.type && j.type.toLowerCase().includes("part")).length;
  const contractCount = allJobsForStats.filter(j => j.type && j.type.toLowerCase().includes("contract")).length;

  const getUserInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  // Pagination helper to generate page number buttons
  const renderPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          className={`btn btn-sm ${page === i ? "btn-primary" : "btn-secondary"}`}
          style={{ minWidth: "32px", padding: "0.25rem 0.5rem" }}
        >
          {i}
        </button>
      );
    }
    return pageNumbers;
  };

  return (
    <div className="home-page">
      <div className="container home-container">
        {/* LEFT COLUMN: User Profile Widget */}
        <aside className="home-sidebar-left">
          {!isAuthenticated ? (
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
                  <span className="stat-value">{totalStatsCount}</span>
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
                <Link to="/dashboard" className="btn btn-secondary btn-sm btn-block">
                  📊 Recruiter Dashboard
                </Link>
              </div>
            </div>
          ) : (
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
                  <span className="stat-label">Location</span>
                  <span className="stat-value">{user.location || "Not Set"}</span>
                </div>
              </div>
              <div className="profile-actions">
                <Link to="/dashboard" className="btn btn-primary btn-sm btn-block">
                  👤 View Profile
                </Link>
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
            <p className="feed-subtext">Use our advanced filters to target your search results.</p>
            
            {/* SEARCH AND LOCATION ROW */}
            <div className="search-filter-controls">
              <div className="search-box-wrapper">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Job title or company..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="feed-search-input"
                />
              </div>

              <div className="search-box-wrapper">
                <span className="search-icon">📍</span>
                <input
                  type="text"
                  placeholder="City, state or remote..."
                  value={location}
                  onChange={(e) => { setLocation(e.target.value); setPage(1); }}
                  className="feed-search-input"
                />
              </div>
            </div>

            {/* ADDITIONAL FILTERS ROW */}
            <div className="search-filter-controls" style={{ marginTop: "12px" }}>
              <div className="filter-select-wrapper">
                <select
                  value={filterType}
                  onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
                  className="feed-filter-select"
                >
                  <option value="All">All Job Types</option>
                  <option value="Full Time">Full-Time</option>
                  <option value="Part Time">Part-Time</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>

              <div className="salary-range-wrapper" style={{ display: "flex", gap: "8px" }}>
                <input
                  type="number"
                  placeholder="Min Salary ($)"
                  value={minSalary}
                  onChange={(e) => { setMinSalary(e.target.value); setPage(1); }}
                  style={{ flex: 1 }}
                />
                <input
                  type="number"
                  placeholder="Max Salary ($)"
                  value={maxSalary}
                  onChange={(e) => { setMaxSalary(e.target.value); setPage(1); }}
                  style={{ flex: 1 }}
                />
              </div>
            </div>

            {/* SORTING AND RESET ROW */}
            <div className="feed-stats-row" style={{ marginTop: "16px" }}>
              <div className="filter-select-wrapper" style={{ minWidth: "180px" }}>
                <select
                  value={sort}
                  onChange={(e) => { setSort(e.target.value); setPage(1); }}
                  style={{ padding: "0.5rem" }}
                >
                  <option value="-createdAt">Newest First</option>
                  <option value="createdAt">Oldest First</option>
                  <option value="-salary">Salary: High to Low</option>
                  <option value="salary">Salary: Low to High</option>
                </select>
              </div>

              <button onClick={resetAllFilters} className="btn btn-secondary btn-sm">
                Reset Filters
              </button>
            </div>
            
            <div className="feed-stats-row" style={{ marginTop: "8px", borderTop: "none", paddingTop: 0 }}>
              <span className="results-count-text">
                Showing <strong>{totalJobsCount}</strong> matching job{totalJobsCount !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Job Feed List */}
          {loading ? (
            <Loader />
          ) : jobs.length === 0 ? (
            <div className="feed-empty-card">
              <div className="empty-icon">📭</div>
              <h3>No Jobs Found</h3>
              <p>We couldn't find any job posts matching your criteria. Try widening your search queries or resetting filters.</p>
              <button onClick={resetAllFilters} className="btn btn-primary mt-md">
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              <div className="jobs-feed-list">
                {jobs.map((job) => (
                  <JobCard key={job._id} job={job} />
                ))}
              </div>

              {/* PAGINATION CONTROLS */}
              {totalPages > 1 && (
                <div 
                  className="pagination-controls-wrapper" 
                  style={{ 
                    display: "flex", 
                    justifyContent: "center", 
                    alignItems: "center", 
                    gap: "8px", 
                    marginTop: "24px" 
                  }}
                >
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="btn btn-secondary btn-sm"
                  >
                    &larr; Prev
                  </button>
                  
                  {renderPageNumbers()}

                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="btn btn-secondary btn-sm"
                  >
                    Next &rarr;
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default Home;