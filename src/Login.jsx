import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/Login.css";

const Login = () => {
  const [role, setRole] = useState(null); // "candidate" or "admin"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!role) {
      alert("Please select Candidate or Admin login");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("✅ Login Successful");

        // ✅ store in localStorage for later use
        localStorage.setItem("user_id", data.user_id);
        localStorage.setItem("role", role);

        if (role === "candidate") {
          navigate(`/candidate/${data.user_id}`);
        } else {
          navigate("/admin");
        }
      } else {
        alert(`❌ ${data.error || "Invalid credentials"}`);
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("⚠️ Server error. Try again later.");
    }
  };

  const handleRegister = async () => {
    if (!role) {
      alert("Please select Candidate or Admin login");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("🎉 Registration Successful! You can now log in.");
      } else {
        alert(`❌ ${data.error || "Registration failed"}`);
      }
    } catch (err) {
      console.error("Register error:", err);
      alert("⚠️ Server error. Try again later.");
    }
  };

  return (
    <div className="login-container">
      <h1>Welcome to Internship Finder</h1>
      <h2>Login Portal</h2>

      {!role ? (
        <div className="role-selection">
          <button className="role-button" onClick={() => setRole("candidate")}>
            Candidate Login
          </button>
          <button className="role-button" onClick={() => setRole("admin")}>
            Admin Login
          </button>
        </div>
      ) : (
        <div>
          <h3>{role === "candidate" ? "Candidate Login" : "Admin Login"}</h3>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="login-input"
          />
          <br />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
          />
          <br />
          <div className="button-container">
            <button onClick={handleLogin} className="login-button">
              Login
            </button>
            <button onClick={handleRegister} className="register-button">
              Register
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
