import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiRequest from "./API"; // ✅ Using the central API utility
import "./styles/AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const companyId = localStorage.getItem("user_id");

  const [formData, setFormData] = useState({
    companyName: "",
    jobTitle: "",
    jobDescription: "",
    skillsRequired: "",
    location: "",
    womenPreference: false,
    openings: 0,
    deadline: 30,
  });

  const [appliedCandidates, setAppliedCandidates] = useState([]); 
  const [showCandidates, setShowCandidates] = useState(false);

  // Security check: Redirect if not logged in
  if (!companyId) {
    navigate("/");
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!companyId) {
      alert("⚠️ Please login as a company first");
      return;
    }

    const payload = {
      ...formData,
      companyId, 
      skillsRequired: formData.skillsRequired
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s),
    };

    // ✅ Using apiRequest (POST automatically handles headers and token)
    const result = await apiRequest("/internships", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (result && !result.error) {
      alert("✅ Internship posted successfully!");
      setFormData({
        companyName: "",
        jobTitle: "",
        jobDescription: "",
        skillsRequired: "",
        location: "",
        womenPreference: false,
        openings: 0,
        deadline: 30,
      });
    } else {
      alert(result?.error || "❌ Error posting internship");
    }
  };

  // ✅ Fetch applied candidates using apiRequest
  const fetchAppliedCandidates = async () => {
    if (!companyId) return alert("⚠️ Company ID not found");

    const data = await apiRequest(`/applications/company/${companyId}`);
    
    if (data && !data.error) {
      setAppliedCandidates(data);
      setShowCandidates(true);
    } else {
      alert(data?.error || "❌ Error fetching candidates");
    }
  };

  return (
    <div className="admin-container">
      <h1>📌 Admin Dashboard</h1>

      <form onSubmit={handleSubmit}>
        <table className="admin-table">
          <tbody>
            <tr>
              <th>Company Name</th>
              <td>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                />
              </td>
            </tr>
            <tr>
              <th>Job Title</th>
              <td>
                <input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  required
                />
              </td>
            </tr>
            <tr>
              <th>Job Description</th>
              <td>
                <textarea
                  name="jobDescription"
                  value={formData.jobDescription}
                  onChange={handleChange}
                  rows="4"
                  required
                />
              </td>
            </tr>
            <tr>
              <th>Skills Required</th>
              <td>
                <input
                  type="text"
                  name="skillsRequired"
                  value={formData.skillsRequired}
                  onChange={handleChange}
                  placeholder="e.g. React, Node, MongoDB"
                  required
                />
              </td>
            </tr>
            <tr>
              <th>Preferred Location</th>
              <td>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </td>
            </tr>
            <tr>
              <th>Women Preference</th>
              <td>
                <input
                  type="checkbox"
                  name="womenPreference"
                  checked={formData.womenPreference}
                  onChange={handleChange}
                />{" "}
                Enable to highlight job as women-preferred
              </td>
            </tr>
            <tr>
              <th>Openings</th>
              <td>
                <input
                  type="number"
                  name="openings"
                  value={formData.openings}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </td>
            </tr>
            <tr>
              <th>Application Deadline (Days)</th>
              <td>
                <input
                  type="number"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                />
              </td>
            </tr>
          </tbody>
        </table>

        <button type="submit" className="post-btn">Post Internship</button>
      </form>

      <hr />

      <button onClick={fetchAppliedCandidates} className="view-btn">
        👥 View Applied Candidates
      </button>

      {showCandidates && (
        <div className="candidates-list">
          <h2>📋 Applied Candidates</h2>
          {appliedCandidates.length > 0 ? (
            <table className="results-table">
              <thead>
                <tr>
                  <th>Application #</th>
                  <th>Candidate Name</th>
                  <th>Job Title</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appliedCandidates.map((c) => (
                  <tr key={c._id}>
                    <td>{c.applicationNumber}</td>
                    <td>{c.userName}</td>
                    <td>{c.jobTitle}</td>
                    <td><span className={`status-tag ${c.status.toLowerCase()}`}>{c.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-data">No candidates have applied yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;