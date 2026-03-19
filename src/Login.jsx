import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = ({ closeModal }) => {
  const [role, setRole] = useState(null); 
  const [view, setView] = useState("login"); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); 
  
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ STORE THE TOKEN
        localStorage.setItem("token", data.token); 
        localStorage.setItem("user_id", data.user_id);
        localStorage.setItem("role", role);
        
        closeModal();
        
        // Navigation logic for InternIntel
        if (role === "candidate") {
          navigate(`/candidate/${data.user_id}`);
        } else {
          navigate("/admin");
        }
      } else if (response.status === 404) {
        alert("Account not found. Let's get you registered!");
        setView("signup");
      } else {
        alert(data.error || "Invalid credentials");
      }
    } catch (err) {
      alert("⚠️ Server error. Try again later.");
    }
  };

  const handleRegister = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role, name }),
      });
      
      const data = await response.json();

      if (response.ok) {
        // ✅ AUTO-LOGIN: Store token from registration response
        localStorage.setItem("token", data.token);
        localStorage.setItem("user_id", data.user_id);
        localStorage.setItem("role", role);

        alert("🎉 Registration Successful!");
        closeModal();
        
        role === "candidate" ? navigate(`/candidate/${data.user_id}`) : navigate("/admin");
      } else {
        alert(data.error || "Registration failed");
      }
    } catch (err) {
      alert("⚠️ Server error during registration.");
    }
  };

  return (
    <div className="login-modal-internal">
      {!role ? (
        <div className="role-selection">
          <h3>Select your Role</h3>
          <button onClick={() => setRole("candidate")}>Candidate</button>
          <button onClick={() => setRole("admin")}>Admin</button>
        </div>
      ) : (
        <div className="form-container">
          <h3>{view === "login" ? `Login as ${role}` : `Sign Up as ${role}`}</h3>
          
          {view === "signup" && (
            <input 
              type="text" 
              placeholder="Full Name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />
          )}

          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />

          <button onClick={view === "login" ? handleLogin : handleRegister}>
            {view === "login" ? "Login" : "Register & Join"}
          </button>

          <button className="text-link" onClick={() => setRole(null)}>
            ← Back to Role Selection
          </button>
        </div>
      )}
    </div>
  );
};

export default Login;