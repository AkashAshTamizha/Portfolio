const API_BASE_URL = import.meta.env.VITE_API_URL;
const TOKEN_KEY = "portfolio_employee_token";

export function getToken() {
  return window.localStorage.getItem(TOKEN_KEY);
}
export function setToken(token) {
  window.localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

async function request(path, { method = "GET", body, isFormData = false } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!isFormData) headers["Content-Type"] = "application/json";

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    // non-JSON response — fall through with {}
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
  patch: (path, body) => request(path, { method: "PATCH", body }),
  delete: (path) => request(path, { method: "DELETE" }),
  upload: (path, file, fieldName = "file") => {
    const form = new FormData();
    form.append(fieldName, file);
    return request(path, { method: "POST", body: form, isFormData: true });
  },
};

export { API_BASE_URL };
