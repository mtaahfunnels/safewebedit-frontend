"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface UserInfo {
  name: string;
  email: string;
  organizationId: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: ""
  });

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      // Get user info from token
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser({
        name: payload.name || "User",
        email: payload.email || payload.username || "",
        organizationId: payload.organizationId || ""
      });
      setFormData({ name: payload.name || "" });
    } catch (err) {
      console.error("Failed to load user info:", err);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }

    setMessage("Profile updated");
    setTimeout(() => setMessage(""), 3000);
  };

  if (loading) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <div style={{ fontSize: "16px", color: "#666" }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "600", marginBottom: "8px" }}>Settings</h1>
        <p style={{ color: "#666", fontSize: "14px" }}>Manage your account settings</p>
      </div>

      {message && (
        <div style={{
          padding: "12px 16px",
          backgroundColor: "#d4edda",
          border: "1px solid #c3e6cb",
          borderRadius: "4px",
          color: "#155724",
          marginBottom: "20px"
        }}>
          {message}
        </div>
      )}

      {error && (
        <div style={{
          padding: "12px 16px",
          backgroundColor: "#f8d7da",
          border: "1px solid #f5c6cb",
          borderRadius: "4px",
          color: "#721c24",
          marginBottom: "20px"
        }}>
          {error}
        </div>
      )}

      <div style={{
        backgroundColor: "white",
        border: "1px solid #e0e0e0",
        borderRadius: "8px",
        padding: "24px"
      }}>
        <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>Account Information</h2>
        
        <form onSubmit={handleUpdateProfile}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "8px" }}>
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ name: e.target.value })}
              style={{
                width: "100%",
                padding: "10px 12px",
                fontSize: "14px",
                border: "1px solid #ddd",
                borderRadius: "4px"
              }}
              placeholder="Your name"
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "8px" }}>
              Email
            </label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              style={{
                width: "100%",
                padding: "10px 12px",
                fontSize: "14px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                backgroundColor: "#f5f5f5",
                color: "#666"
              }}
            />
            <p style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
              Email cannot be changed
            </p>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "8px" }}>
              Organization ID
            </label>
            <input
              type="text"
              value={user?.organizationId || ""}
              disabled
              style={{
                width: "100%",
                padding: "10px 12px",
                fontSize: "14px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                backgroundColor: "#f5f5f5",
                color: "#666",
                fontFamily: "monospace"
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer"
            }}
          >
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
}
