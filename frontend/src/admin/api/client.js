const API_BASE_URL = import.meta.env.VITE_API_URL ;
const TOKEN_KEY = "portfolio_admin_token";

export function getToken() {
  return window.localStorage.getItem(TOKEN_KEY);
}
export function setToken(token) {
  window.localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

// Core request helper: attaches JSON headers + auth token, normalizes
// error handling so every caller gets a `.message` it can show the user.
async function request(path, { method = "GET", body, isFormData = false } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!isFormData) headers["Content-Type"] = "application/json";

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    });
  } catch (networkErr) {
    // fetch() itself throws for network failures, DNS errors, and CORS
    // rejections (the browser gives no detail beyond "Failed to fetch" in
    // that last case — check the Network tab for the real reason, or the
    // backend's console for a "[cors] rejected origin ..." log line).
    console.error(`[api] network error calling ${method} ${API_BASE_URL}${path}:`, networkErr);
    const error = new Error(
      `Could not reach the server at ${API_BASE_URL}. Check that the backend is running and VITE_API_URL is correct, or that this origin is allowed in CLIENT_ORIGIN (CORS).`
    );
    error.cause = networkErr;
    throw error;
  }

  let data = {};
  try {
    data = await response.json();
  } catch {
    // non-JSON response (e.g. network error page) — fall through with {}
  }

  if (!response.ok) {
    const error = new Error(data.message || `Request failed (${response.status})`);
    error.status = response.status;
    error.errors = data.errors;
    throw error;
  }

  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body }),
  put: (path, body) => request(path, { method: "PUT", body }),
  delete: (path) => request(path, { method: "DELETE" }),
  upload: (path, file, type) => {
    const form = new FormData();
    form.append("file", file);
    const query = type ? `?type=${encodeURIComponent(type)}` : "";
    return request(`${path}${query}`, { method: "POST", body: form, isFormData: true });
  },
};

// Generic REST CRUD helpers for the list-type resources (skills, services,
// experience, education, certifications, projects) which all share the
// same shape of endpoints on the backend (crudFactory / buildCrudRouter).
export function resourceApi(basePath) {
  return {
    list: (queryString = "") => api.get(`${basePath}${queryString ? `?${queryString}` : ""}`),
    getOne: (id) => api.get(`${basePath}/${id}`),
    create: (payload) => api.post(basePath, payload),
    update: (id, payload) => api.put(`${basePath}/${id}`, payload),
    remove: (id) => api.delete(`${basePath}/${id}`),
  };
}

export { API_BASE_URL };
