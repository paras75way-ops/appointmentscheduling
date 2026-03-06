const env = import.meta.env as Record<string, string | undefined>;
const API_URL =
  env.VITE_BACKEND_URL ||
  env.Backend_url ||
  "http://localhost:5000/api/auth";

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.message || "Login failed");

  return data;
}

export interface SignupPayload {
  role: "user" | "admin";
  name: string;
  email: string;
  password: string;
  organizationName?: string;
  organizationType?: string;
}

export async function signup(payload: SignupPayload) {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.message || "Signup failed");

  return data;
}

export async function logouts() {
  await fetch(`${API_URL}/logout`, {
    method: "POST",
    credentials: "include",
  });
  localStorage.removeItem("accessToken");
}

export async function verifyOtp(email: string, otp: string) {
  const res = await fetch(`${API_URL}/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.message);

  return data;
}

export async function resendOtp(email: string) {
  const res = await fetch(`${API_URL}/resend-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.message);

  return data;
}

export async function getUser() {
  const token = localStorage.getItem("accessToken");

  let res = await fetch(`${API_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    const refreshRes = await fetch(`${API_URL}/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!refreshRes.ok) {
      return null;
    }

    const data = await refreshRes.json();

    localStorage.setItem("accessToken", data.accessToken);

    res = await fetch(`${API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${data.accessToken}`,
      },
    });
  }

  if (!res.ok) return null;

  return res.json();
}

export function isAuthenticated() {
  return !!localStorage.getItem("accessToken");
}
