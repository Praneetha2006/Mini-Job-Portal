const BASE_URL = "http://localhost:5000/api/jobs";

// Helper to attach authorization header if token exists
const getHeaders = (hasBody = true) => {
  const token = localStorage.getItem("token");
  const headers = {};
  
  if (hasBody) {
    headers["Content-Type"] = "application/json";
  }
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  return headers;
};

// Parse validator details if present in backend error response
const handleApiError = (data, defaultMessage) => {
  if (data && data.errors && Array.isArray(data.errors)) {
    return data.errors.map((err) => `${err.message}`).join(", ");
  }
  return data?.message || defaultMessage;
};

export const getJobs = async (params = {}) => {
  const query = new URLSearchParams();
  
  Object.keys(params).forEach((key) => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== "") {
      query.append(key, params[key]);
    }
  });

  const queryString = query.toString();
  const url = queryString ? `${BASE_URL}?${queryString}` : BASE_URL;

  const response = await fetch(url, {
    headers: getHeaders(false),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(handleApiError(data, "Failed to fetch jobs"));
  }
  return data;
};

export const getJobById = async (id) => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    headers: getHeaders(false),
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(handleApiError(data, "Failed to fetch job details"));
  }
  return data.data;
};

export const createJob = async (jobData) => {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(jobData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(handleApiError(data, "Failed to create job posting"));
  }
  return data.data;
};

export const updateJob = async (id, jobData) => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: getHeaders(true),
    body: JSON.stringify(jobData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(handleApiError(data, "Failed to update job posting"));
  }
  return data.data;
};

export const deleteJob = async (id) => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: getHeaders(false),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(handleApiError(data, "Failed to delete job posting"));
  }
  return data.data;
};

export const applyJob = async (id, applicationData) => {
  const response = await fetch(`${BASE_URL}/${id}/applications`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(applicationData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(handleApiError(data, "Failed to submit application"));
  }
  return data.data;
};

export const getApplications = async (id) => {
  const response = await fetch(`${BASE_URL}/${id}/applications`, {
    method: "GET",
    headers: getHeaders(false),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(handleApiError(data, "Failed to fetch applications list"));
  }
  return data.data;
};

export const getMyApplications = async () => {
  const response = await fetch(`${BASE_URL}/my-applications`, {
    method: "GET",
    headers: getHeaders(false),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(handleApiError(data, "Failed to fetch candidate applications list"));
  }
  return data.data;
};

export const saveJob = async (id) => {
  const response = await fetch(`${BASE_URL}/${id}/save`, {
    method: "POST",
    headers: getHeaders(false),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(handleApiError(data, "Failed to save job"));
  }
  return data.data;
};

export const unsaveJob = async (id) => {
  const response = await fetch(`${BASE_URL}/${id}/save`, {
    method: "DELETE",
    headers: getHeaders(false),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(handleApiError(data, "Failed to remove saved job"));
  }
  return data.data;
};

export const getSavedJobs = async () => {
  const response = await fetch(`${BASE_URL}/saved`, {
    method: "GET",
    headers: getHeaders(false),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(handleApiError(data, "Failed to fetch saved jobs list"));
  }
  return data.data;
};

export const getRecruiterStats = async () => {
  const response = await fetch(`${BASE_URL}/recruiter/stats`, {
    method: "GET",
    headers: getHeaders(false),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(handleApiError(data, "Failed to fetch recruiter stats"));
  }
  return data.data;
};