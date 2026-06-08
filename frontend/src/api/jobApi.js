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

export const getJobs = async () => {
  const response = await fetch(BASE_URL, {
    headers: getHeaders(false),
  });
  return response.json();
};

export const getJobById = async (id) => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    headers: getHeaders(false),
  });
  return response.json();
};

export const createJob = async (jobData) => {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(jobData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to create job posting");
  }
  return data;
};

export const updateJob = async (id, jobData) => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: getHeaders(true),
    body: JSON.stringify(jobData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to update job posting");
  }
  return data;
};

export const deleteJob = async (id) => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: getHeaders(false),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to delete job posting");
  }
  return data;
};

export const applyJob = async (id, applicationData) => {
  const response = await fetch(`${BASE_URL}/${id}/applications`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(applicationData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to submit application");
  }
  return data;
};

export const getApplications = async (id) => {
  const response = await fetch(`${BASE_URL}/${id}/applications`, {
    method: "GET",
    headers: getHeaders(false),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch applications list");
  }
  return data;
};

export const getMyApplications = async () => {
  const response = await fetch(`${BASE_URL}/my-applications`, {
    method: "GET",
    headers: getHeaders(false),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch candidate applications list");
  }
  return data;
};