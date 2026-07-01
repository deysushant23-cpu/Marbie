"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [passKey, setPassKey] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Forcefully clear any stale sessions when arriving at the login page
  useEffect(() => {
    fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" })
    }).catch(() => {});
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Trim inputs to prevent accidental spaces
    const cleanPassKey = passKey.trim();
    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "brutal_login", passKey: cleanPassKey, username: cleanUsername, password: cleanPassword }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Refresh the current route so the Server Layout sees the new cookie
        router.refresh();
      } else {
        setError(data.error || "ACCESS DENIED");
      }
    } catch (err) {
      setError("SYSTEM ERROR");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#fff",
      color: "#000",
      fontFamily: "'Courier New', Courier, monospace",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "480px",
        border: "4px solid #000",
        boxShadow: "12px 12px 0px #000",
        padding: "48px 32px",
        backgroundColor: "#fff"
      }}>
        <h1 style={{
          fontSize: "36px",
          fontWeight: "900",
          textTransform: "uppercase",
          margin: "0 0 8px 0",
          letterSpacing: "-1px"
        }}>
          RESTRICTED AREA
        </h1>
        <p style={{
          fontSize: "14px",
          fontWeight: "bold",
          marginBottom: "32px",
          borderBottom: "2px solid #000",
          paddingBottom: "16px"
        }}>
          UNAUTHORIZED ACCESS IS PROHIBITED. ENTER CREDENTIALS TO PROCEED.
        </p>

        {error && (
          <div style={{
            backgroundColor: "#000",
            color: "#fff",
            padding: "16px",
            fontWeight: "bold",
            marginBottom: "24px",
            textTransform: "uppercase"
          }}>
            ERROR: {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontWeight: "bold", fontSize: "14px", textTransform: "uppercase" }}>[1] Secret Pass Key</label>
            <input 
              type="password"
              value={passKey}
              onChange={(e) => setPassKey(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "2px solid #000",
                fontSize: "16px",
                fontFamily: "inherit",
                backgroundColor: "#f4f4f4",
                outline: "none"
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontWeight: "bold", fontSize: "14px", textTransform: "uppercase" }}>[2] Manager Username</label>
            <input 
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="e.g. Baisakhi_kanthariya"
              style={{
                width: "100%",
                padding: "12px",
                border: "2px solid #000",
                fontSize: "16px",
                fontFamily: "inherit",
                backgroundColor: "#f4f4f4",
                outline: "none"
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontWeight: "bold", fontSize: "14px", textTransform: "uppercase" }}>[3] Password</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "2px solid #000",
                fontSize: "16px",
                fontFamily: "inherit",
                backgroundColor: "#f4f4f4",
                outline: "none"
              }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              marginTop: "16px",
              padding: "16px",
              backgroundColor: loading ? "#ccc" : "#000",
              color: "#fff",
              border: "none",
              fontSize: "18px",
              fontWeight: "bold",
              textTransform: "uppercase",
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              transition: "transform 0.1s"
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = "translate(4px, 4px)"}
            onMouseUp={(e) => e.currentTarget.style.transform = "translate(0px, 0px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translate(0px, 0px)"}
          >
            {loading ? "VERIFYING..." : "ENTER SYSTEM"}
          </button>

        </form>
      </div>
    </div>
  );
}
