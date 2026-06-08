import { useNavigate } from "react-router-dom";
import JobForm from "../../components/JobForm/JobForm";
import "./CreateJob.css";

function CreateJob() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate("/");
  };

  return (
    <div className="create-job-page">
      <div className="container create-job-container">
        <div className="create-job-nav">
          <button className="create-back-btn" onClick={() => navigate("/")}>
            ← Cancel and Return
          </button>
        </div>

        <header className="create-job-header">
          <h1>Post a New Job</h1>
          <p>Fill out the forms below to announce a new opening. Active job seekers will match instantly.</p>
        </header>

        <div className="create-form-wrapper card">
          <JobForm onSubmitSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  );
}

export default CreateJob;