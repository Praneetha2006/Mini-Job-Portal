import { useParams, useNavigate } from "react-router-dom";
import JobForm from "../../components/JobForm/JobForm";
import "./EditJob.css";

function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate(`/job/${id}`);
  };

  return (
    <div className="edit-job-page">
      <div className="container edit-job-container">
        <div className="edit-job-nav">
          <button className="edit-back-btn" onClick={() => navigate(`/job/${id}`)}>
            ← Cancel and Return
          </button>
        </div>

        <header className="edit-job-header">
          <h1>Edit Job Posting</h1>
          <p>Update candidate requirements, description, salary, or schedule types.</p>
        </header>

        <div className="edit-form-wrapper card">
          <JobForm jobId={id} onSubmitSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  );
}

export default EditJob;