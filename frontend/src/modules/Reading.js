import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./habitTracking.css";
import API from "../api";

export default function Reading({ user }) {
    const navigate = useNavigate();
    const [bookName, setBookName] = useState("");
    const [summary, setSummary] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!bookName.trim() || !summary.trim()) return;
        setLoading(true);
        try {
            await API.post("/habit/reading", {
                username: user || "guest",
                book_name: bookName,
                summary: summary
            });
            navigate("/dashboard");
        } catch (err) {
            console.error(err);
            alert("Failed to save reading activity");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="habit-activity-wrapper">
            <div className="habit-activity-card">
                <div className="habit-activity-header">
                    <h2>Reading Books 📚</h2>
                    <p className="habit-activity-subtitle">Track your daily habit</p>
                </div>
                
                <div className="habit-input-group">
                    <label>Which book did you read?</label>
                    <input 
                        type="text"
                        className="habit-input"
                        placeholder="Book Title"
                        value={bookName}
                        onChange={(e) => setBookName(e.target.value)}
                    />
                </div>

                <div className="habit-input-group">
                    <label>Write a short summary of the story</label>
                    <textarea 
                        className="habit-textarea"
                        placeholder="Summary..."
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                    />
                </div>

                <button 
                    className="habit-submit-btn" 
                    onClick={handleSubmit} 
                    disabled={loading || !bookName.trim() || !summary.trim()}
                >
                    {loading ? "Submitting..." : "Submit"}
                </button>
                <button className="dashboard-back-btn" onClick={() => navigate("/dashboard")} style={{marginTop: '15px', width: '100%'}}>
                    Return to Dashboard
                </button>
                <p className="habit-tip">Tip: Consistency builds strong habits 💪</p>
            </div>
        </div>
    );
}
