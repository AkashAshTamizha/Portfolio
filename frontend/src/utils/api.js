// Public-facing API client. Every function here reads live data from the
// backend — nothing in this file returns hardcoded/sample content. If the
// backend has no records for a resource, the relevant array/object comes
// back empty and the pages render a "No data available" state instead.

const API_BASE_URL = import.meta.env.VITE_API_URL;
// Origin without the /api suffix. Uploaded files (images, resumes, videos)
// now live on Cloudinary and always come back as full https:// URLs, so
// this is only a fallback for any legacy relative paths.
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

export function assetUrl(path) {
  if (!path) return "";
  return /^https?:\/\//i.test(path) ? path : `${API_ORIGIN}${path}`;
}
 
console.log("API_BASE_URL------------------------------>",API_BASE_URL);

async function getJson(path) {
  
  const response = await fetch(`${API_BASE_URL}${path}`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }
  return data;
}

export async function sendContactMessage(payload) {
  const response = await fetch(`${API_BASE_URL}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong. Please try again.");
  }

  return data;
}

// Singleton resources
export const getProfile = () => getJson("/profile").then((r) => r.data);
export const getContactInfo = () => getJson("/contact-info").then((r) => r.data);
export const getSettings = () => getJson("/settings").then((r) => r.data);

// List resources — always fetched fresh from MongoDB via the backend's
// generic CRUD endpoints. limit=200 is comfortably above any realistic
// portfolio's number of records; pagination controls live in the admin.
export const getSkills = () => getJson("/skills?limit=200&sort=category%20order").then((r) => r.data || []);
export const getServices = () => getJson("/services?limit=200").then((r) => r.data || []);
export const getProjects = () => getJson("/projects?limit=200").then((r) => r.data || []);
export const getProject = (id) => getJson(`/projects/${id}`).then((r) => r.data);
export const getExperience = () => getJson("/experience?limit=200").then((r) => r.data || []);
export const getEducation = () => getJson("/education?limit=200").then((r) => r.data || []);
export const getCertifications = () => getJson("/certifications?limit=200").then((r) => r.data || []);

// ---------- Portfolio Management module ----------
export const getEmployees = (qs = "") => getJson(`/employees${qs ? `?${qs}` : ""}`).then((r) => r.data || []);
export const getEmployee = (id) => getJson(`/employees/${id}`).then((r) => r.data);
export const getEmployeeProjects = (id) => getJson(`/employees/${id}/projects`).then((r) => r.data || []);
export const getEmployeeReviews = (id) => getJson(`/employees/${id}/reviews`).then((r) => r.data || []);
export const getReviewsFor = (targetType, targetId, qs = "") =>
  getJson(`/reviews/${targetType}/${targetId}${qs ? `?${qs}` : ""}`).then((r) => r.data || []);
export const getAverageRating = (targetType, targetId) =>
  getJson(`/ratings/${targetType}/${targetId}/average`).then((r) => r.data);

async function authedRequest(path, { method = "GET", body } = {}) {
  const token = window.localStorage.getItem("portfolio_user_token");
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return data;
}

export const registerUser = (payload) => authedRequest("/auth/register", { method: "POST", body: payload });
export const loginUser = (payload) => authedRequest("/auth/login", { method: "POST", body: payload });
export const submitRating = (payload) => authedRequest("/ratings", { method: "POST", body: payload });
export const submitReview = (payload) => authedRequest("/reviews", { method: "POST", body: payload });
export const updateReview = (id, payload) => authedRequest(`/reviews/${id}`, { method: "PUT", body: payload });
export const deleteReview = (id) => authedRequest(`/reviews/${id}`, { method: "DELETE" });
export const getMyReviews = () => authedRequest("/reviews/mine").then((r) => r.data || []);

export { API_BASE_URL };
