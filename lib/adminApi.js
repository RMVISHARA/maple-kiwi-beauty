// Client-side helpers for the admin dashboard. They attach the stored JWT
// (set at login) as a Bearer token so the protected API routes accept them.

function authHeaders(json = false) {
  const headers = {};
  if (json) headers["Content-Type"] = "application/json";
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("maple_kiwi_token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export async function apiGet(path) {
  const res = await fetch(path, { headers: authHeaders(), cache: "no-store" });
  return handle(res);
}

export async function apiSend(path, method, body) {
  const res = await fetch(path, {
    method,
    headers: authHeaders(true),
    body: body ? JSON.stringify(body) : undefined,
  });
  return handle(res);
}

// Upload a File via multipart/form-data. Browser sets the multipart boundary,
// so we deliberately do NOT set Content-Type here.
export async function apiUpload(file) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: authHeaders(false),
    body: fd,
  });
  return handle(res);
}
