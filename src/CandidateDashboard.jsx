import React, { useState, useEffect } from "react";
import "./styles/CandidateDashboard.css";

const CandidateDashboard = () => {
  const [formData, setFormData] = useState({
    name: "",
    skills: "",
    location: "",
    education: "",
    stream: "",
  });

  const [lastCandidateId, setLastCandidateId] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState(new Set()); // ✅ track applied jobs
  const userId = localStorage.getItem("user_id"); // ✅ retrieved from login response

  // Fetch candidate profile when component loads
  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;
      try {
        const res = await fetch(
          `http://localhost:5000/api/candidates/${userId}`
        );
        if (res.ok) {
          const profile = await res.json();
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
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApply = async (job) => {
    if (!userId || !formData.name) {
      alert("Please complete your profile before applying.");
      return;
    }

    if (appliedJobs.has(job._id)) return; // already applied

    const payload = {
      userId,
      userName: formData.name,
      jobId: job._id, // ✅ send jobId
      jobTitle: job.jobTitle,
      companyName: job.companyName,
      location: job.location,
      description: job.jobDescription || "N/A",
      deadline: job.deadline || null,
    };

    try {
      const res = await fetch("http://localhost:5000/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        // ✅ update UI instantly
        setAppliedJobs((prev) => new Set(prev).add(job._id));
      } else {
        const err = await res.json();
        console.error("Error saving application:", err);
        alert(err.error || "❌ Could not apply for job");
      }
    } catch (error) {
      console.error("Network error while applying:", error);
      alert("⚠️ Network error. Try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      user_id: userId,
      skills: formData.skills.split(",").map((s) => s.trim()),
    };
    try {
      const response = await fetch("http://localhost:5000/api/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const savedCandidate = await response.json();
        alert("✅ Candidate profile saved successfully!");
        setLastCandidateId(savedCandidate.id);
      } else {
        const errorData = await response.json();
        console.error("Backend error:", errorData);
        alert("❌ Error saving candidate profile");
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("⚠️ Network error. Try again.");
    }
  };

  const handleShowRecommendations = async () => {
    if (!lastCandidateId) {
      alert("Please save your profile first!");
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:5000/api/recommendations/${lastCandidateId}`
      );
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.slice(0, 4));
      } else {
        alert("Failed to fetch recommendations ❌");
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      alert("⚠️ Could not load recommendations");
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
              <td>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </td>
            </tr>
            <tr>
              <th>Skills</th>
              <td>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
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
              <th>Educational Qualification</th>
              <td>
                <input
                  type="text"
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  placeholder="e.g. B.Tech, BBA"
                  required
                />
              </td>
            </tr>
            <tr>
              <th>Stream</th>
              <td>
                <input
                  type="text"
                  name="stream"
                  value={formData.stream}
                  onChange={handleChange}
                  placeholder="e.g. Computer Science"
                  required
                />
              </td>
            </tr>
          </tbody>
        </table>

        <button type="submit">Save Profile</button>
      </form>

      <button type="button" onClick={handleShowRecommendations}>
        🔍 Show Recommendations
      </button>

      {recommendations.length > 0 ? (
        <div className="recommendations">
          <h2>✨ Top Recommended Jobs for You</h2>
          {recommendations.map((job, index) => {
            const isApplied = appliedJobs.has(job._id);
            return (
              <div
                className={`job-card ${
                  job.womenPreference ? "women-preference" : ""
                }`}
                key={index}
                style={{
                  backgroundColor: isApplied ? "#d4edda" : "white", // ✅ green bg if applied
                }}
              >
                {job.womenPreference && (
                  <div className="women-tag">Women Preference</div>
                )}
                <strong>{job.jobTitle}</strong> at {job.companyName}
                <div className="job-meta">📍 {job.location}</div>
                <div className="job-deadline">
                  ⏳ Apply within: {job.deadline || "N/A"} days
                </div>
                <div className="job-openings">👥 Openings: {job.openings}</div>
                <div className="match-score">
                  {job.score.toFixed(0)}% skills matched
                </div>
                {job.predictedSkill && (
                  <div className="animated-text">
                    If you learn <b>{job.predictedSkill}</b>, your match could
                    improve to {job.predictedScore.toFixed(0)}% 🚀
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
        <div className="no-jobs">
          ❌ No internship job opportunities found at this location
        </div>
      )}
    </div>
  );
};

export default CandidateDashboard;
