import "./Dashboard.css";
import { useAuth } from "../../context/AuthContext";
import CandidateDashboard from "./CandidateDashboard";
import RecruiterDashboard from "./RecruiterDashboard";

function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="dashboard-container">
        <div className="container text-center py-5">
          <h3>Please log in to access your dashboard.</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page-wrapper">
      <div className="container dashboard-main-container">
        {user.role === "recruiter" ? (
          <RecruiterDashboard />
        ) : (
          <CandidateDashboard />
        )}
      </div>
    </div>
  );
}

export default Dashboard;
