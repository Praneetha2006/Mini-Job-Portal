import { useState, useEffect } from "react";
import { createJob, getJobById, updateJob } from "../../api/jobApi";
import "./JobForm.css";

function JobForm({ jobId, onSubmitSuccess }) {
  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    salary: "",
    type: "",
    description: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Load existing job details if jobId is provided (edit mode)
  useEffect(() => {
    if (jobId) {
      const loadJobDetails = async () => {
        try {
          setLoading(true);
          const data = await getJobById(jobId);
          // Normalize type casing for edit matching
          const normalizedType = data.type ? data.type.replace("-", " ") : "Full Time";
          setForm({
            title: data.title || "",
            company: data.company || "",
            location: data.location || "",
            salary: data.salary || "",
            type: normalizedType,
            description: data.description || "",
          });
        } catch (error) {
          console.error("Error loading job details for editing:", error);
        } finally {
          setLoading(false);
        }
      };
      loadJobDetails();
    }
  }, [jobId]);

  const validateForm = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Job title is required";
    if (!form.company.trim()) newErrors.company = "Company name is required";
    if (!form.location.trim()) newErrors.location = "Job location is required";
    if (!form.salary || form.salary <= 0) newErrors.salary = "Valid annual salary is required";
    if (!form.type) newErrors.type = "Job scheduling type is required";
    if (!form.description.trim() || form.description.trim().length < 20)
      newErrors.description = "Job description must be at least 20 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      if (jobId) {
        // Edit mode
        await updateJob(jobId, form);
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          if (onSubmitSuccess) onSubmitSuccess();
        }, 1500);
      } else {
        // Create mode
        await createJob(form);
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setForm({
            title: "",
            company: "",
            location: "",
            salary: "",
            type: "",
            description: "",
          });
          if (onSubmitSuccess) onSubmitSuccess();
        }, 1500);
      }
    } catch (error) {
      console.error("Error submitting job form:", error);
      alert("Failed to save job posting details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="job-form">
      {success && (
        <div className="form-message success">
          {jobId ? "✓ Job post updated successfully!" : "✓ Job posted successfully!"}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="title">Job Title *</label>
        <input
          id="title"
          type="text"
          name="title"
          placeholder="e.g. Senior React Architect"
          value={form.title}
          onChange={handleChange}
          className={errors.title ? "error" : ""}
        />
        {errors.title && <span className="error-text">{errors.title}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="company">Company Name *</label>
          <input
            id="company"
            type="text"
            name="company"
            placeholder="e.g. Tech Corp"
            value={form.company}
            onChange={handleChange}
            className={errors.company ? "error" : ""}
          />
          {errors.company && <span className="error-text">{errors.company}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="location">Location *</label>
          <input
            id="location"
            type="text"
            name="location"
            placeholder="e.g. San Francisco, CA (or Remote)"
            value={form.location}
            onChange={handleChange}
            className={errors.location ? "error" : ""}
          />
          {errors.location && <span className="error-text">{errors.location}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="salary">Salary (Annual USD) *</label>
          <input
            id="salary"
            type="number"
            name="salary"
            placeholder="e.g. 120000"
            value={form.salary}
            onChange={handleChange}
            className={errors.salary ? "error" : ""}
          />
          {errors.salary && <span className="error-text">{errors.salary}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="type">Job Type *</label>
          <select
            id="type"
            name="type"
            value={form.type}
            onChange={handleChange}
            className={errors.type ? "error" : ""}
          >
            <option value="">Select Type</option>
            <option value="Full Time">Full-Time</option>
            <option value="Part Time">Part-Time</option>
            <option value="Contract">Contract</option>
          </select>
          {errors.type && <span className="error-text">{errors.type}</span>}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="description">Job Description *</label>
        <textarea
          id="description"
          name="description"
          placeholder="Describe the role, candidate responsibilities, requirements, and benefits..."
          value={form.description}
          onChange={handleChange}
          className={errors.description ? "error" : ""}
          rows="6"
        />
        {errors.description && <span className="error-text">{errors.description}</span>}
        <div className="form-helper-text">
          <span>{form.description.length} characters</span>
          <span>(minimum 20 characters)</span>
        </div>
      </div>

      <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
        {loading ? "Saving..." : jobId ? "Save Changes" : "Post Job Listing"}
      </button>
    </form>
  );
}

export default JobForm;