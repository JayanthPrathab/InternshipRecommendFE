import React, { useState } from "react";
import "./styles/AdminDashboard.css";

const AdminDashboard = ({ companyId }) => {
  // ✅ Pass logged-in companyId as prop
  const [formData, setFormData] = useState({
    companyName: "",
    jobTitle: "",
    jobDescription: "",
    skillsRequired: "",
    location: "",
    womenPreference: false,
    openings: 0,
  });

  const [appliedCandidates, setAppliedCandidates] = useState([]); // ✅ Store applications
  const [showCandidates, setShowCandidates] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const companyId = localStorage.getItem("user_id"); // ✅ companyId from login
    if (!companyId) {
      alert("⚠️ Please login as a company first");
      return;
    }

    const payload = {
      ...formData,
      companyId, // ✅ attach companyId
      skillsRequired: formData.skillsRequired
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s),
    };

    try {
      const response = await fetch("http://localhost:5000/api/internships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("✅ Internship posted successfully!");
        setFormData({
          companyName: "",
          jobTitle: "",
          jobDescription: "",
          skillsRequired: "",
          location: "",
          womenPreference: false,
        });
      } else {
        const errorData = await response.json();
        console.error("Backend error:", JSON.stringify(errorData, null, 2));
        alert("❌ Error posting internship");
      }
    } catch (error) {
      console.error("Network or server error:", error);
      alert("⚠️ Network or server error");
    }
  };

  // ✅ Fetch applied candidates for this company
  const fetchAppliedCandidates = async () => {
  const companyId = localStorage.getItem("user_id"); // get correct companyId
  if (!companyId) return alert("⚠️ Company ID not found");

  try {
    const response = await fetch(
      `http://localhost:5000/api/applications/company/${companyId}`
    );
    if (response.ok) {
      const data = await response.json();
      setAppliedCandidates(data);
      setShowCandidates(true);
    } else {
      const errorData = await response.json();
      console.error("Error fetching candidates:", errorData);
      alert("❌ Error fetching candidates");
    }
  } catch (error) {
    console.error("Error fetching candidates:", error);
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
              <th>Application Deadline</th>
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

        <button type="submit">Post Internship</button>
      </form>

      <hr />

      {/* ✅ Button to fetch applied candidates */}
      <button onClick={fetchAppliedCandidates}>
        👥 View Applied Candidates
      </button>

      {showCandidates && (
        <div className="candidates-list">
          <h2>📋 Applied Candidates</h2>
          {appliedCandidates.length > 0 ? (
            <table className="admin-table">
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
                    <td>{c.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No candidates have applied yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
