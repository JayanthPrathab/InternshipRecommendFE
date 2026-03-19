import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiRequest from "./API"; // ✅ Ensure this file exists in your src folder
import "./styles/CandidateDashboard.css";

const CandidateDashboard = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("user_id");

  const [formData, setFormData] = useState({
    name: "",
    skills: "",
    location: "",
    education: "",
    stream: "",
  });

  const [lastCandidateId, setLastCandidateId] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState(new Set());

  // ✅ Initial Load: Check Auth & Fetch Profile
  useEffect(() => {
    if (!userId) {
      navigate("/");
      return;
    }

    const fetchProfile = async () => {
      try {
        const profile = await apiRequest(`/candidates/${userId}`);
        if (profile && !profile.error) {
          setLastCandidateId(profile._id);
          setFormData({
            name: profile.name || "",
            skills: (profile.skills || []).join(", "),
            location: profile.location || "",
            education: profile.education || "",
            stream: profile.stream || "",
          });
        }
      } catch (err) {
        console.error("⚠️ Error fetching candidate profile:", err);
      }
    };

    fetchProfile();
  }, [userId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle Job Application
  const handleApply = async (job) => {
    if (!userId || !formData.name) {
      alert("Please complete your profile before applying.");
      return;
    }

    if (appliedJobs.has(job._id)) return;

    const payload = {
      userId,
      userName: formData.name,
      jobId: job._id,
      jobTitle: job.jobTitle,
      companyName: job.companyName,
      location: job.location,
      description: job.jobDescription || "N/A",
      deadline: job.deadline || null,
    };

    const res = await apiRequest("/applications", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (res && !res.error) {
      setAppliedJobs((prev) => new Set(prev).add(job._id));
      alert("✅ Application submitted successfully!");
    } else {
      alert(res?.error || "❌ Could not apply for job");
    }
  };

  // ✅ Handle Profile Save/Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      user_id: userId,
      skills: formData.skills.split(",").map((s) => s.trim()),
    };

    const result = await apiRequest("/candidates", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (result && !result.error) {
      alert("✅ Profile saved successfully!");
      setLastCandidateId(result.id);
    } else {
      alert(result?.error || "❌ Error saving candidate profile");
    }
  };

  // ✅ Fetch Recommendations
  const handleShowRecommendations = async () => {
    if (!lastCandidateId) {
      alert("Please save your profile first!");
      return;
    }
    
    const data = await apiRequest(`/recommendations/${lastCandidateId}`);
    
    if (data && !data.error) {
      setRecommendations(data.slice(0, 4));
    } else {
      alert("Failed to fetch recommendations ❌");
    }
  };

  return (
    <div className="candidate-container">
      <h1>🚀 Candidate Dashboard</h1>

      <form onSubmit={handleSubmit}>
        <table className="candidate-table">
          <tbody>
            <tr>
              <th>Full Name</th>
              <td><input type="text" name="name" value={formData.name} onChange={handleChange} required /></td>
            </tr>
            <tr>
              <th>Skills</th>
              <td><input type="text" name="skills" value={formData.skills} onChange={handleChange} placeholder="e.g. React, Node, MongoDB" required /></td>
            </tr>
            <tr>
              <th>Preferred Location</th>
              <td><input type="text" name="location" value={formData.location} onChange={handleChange} required /></td>
            </tr>
            <tr>
              <th>Educational Qualification</th>
              <td><input type="text" name="education" value={formData.education} onChange={handleChange} placeholder="e.g. B.Tech, BBA" required /></td>
            </tr>
            <tr>
              <th>Stream</th>
              <td><input type="text" name="stream" value={formData.stream} onChange={handleChange} placeholder="e.g. Computer Science" required /></td>
            </tr>
          </tbody>
        </table>
        <button type="submit" className="save-btn">Save Profile</button>
      </form>

      <button type="button" className="recommend-btn" onClick={handleShowRecommendations} style={{ marginTop: '20px' }}>
        🔍 Show Recommendations
      </button>

      {recommendations.length > 0 ? (
        <div className="recommendations">
          <h2>✨ Top Recommended Jobs for You</h2>
          {recommendations.map((job, index) => {
            const isApplied = appliedJobs.has(job._id);
            return (
              <div
                className={`job-card ${job.womenPreference ? "women-preference" : ""}`}
                key={index}
                style={{ backgroundColor: isApplied ? "#d4edda" : "white" }}
              >
                {job.womenPreference && <div className="women-tag">Women Preference</div>}
                <strong>{job.jobTitle}</strong> at {job.companyName}
                <div className="job-meta">📍 {job.location}</div>
                <div className="job-deadline">⏳ Apply within: {job.deadline || "N/A"} days</div>
                <div className="job-openings">👥 Openings: {job.openings}</div>
                <div className="match-score">{job.score.toFixed(0)}% skills matched</div>
                
                {job.predictedSkill && (
                  <div className="animated-text">
                    If you learn <b>{job.predictedSkill}</b>, your match could improve to {job.predictedScore.toFixed(0)}% 🚀
                  </div>
                )}
                
                <button
                  className="apply-btn"
                  onClick={() => handleApply(job)}
                  disabled={isApplied}
                  style={{
                    backgroundColor: isApplied ? "#28a745" : "#007bff",
                    cursor: isApplied ? "not-allowed" : "pointer",
                  }}
                >
                  {isApplied ? "✅ Applied" : "Apply"}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="no-jobs" style={{ marginTop: '20px', color: '#666' }}>
          No internship recommendations found yet. Save your profile and click "Show Recommendations".
        </div>
      )}
    </div>
  );
};

export default CandidateDashboard;