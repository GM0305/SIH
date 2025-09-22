const API_BASE = "http://localhost:8000"; // FastAPI backend

export const apiRequest = async (url, method, body = null) => {
  const res = await fetch(`${API_BASE}${url}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : null,
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Something went wrong");
  }
  return res.json();
};
