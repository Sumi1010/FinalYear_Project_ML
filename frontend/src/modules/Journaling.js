import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./habitTracking.css";
import API from "../api";

export default function Journaling({ user }) {
    const navigate = useNavigate();
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!content.trim()) return;
        setLoading(true);
        try {
            await API.post("/habit/journal", {
                username: user || "guest",
                content: content
            });
            navigate("/dashboard");
        } catch (err) {
            console.error(err);
            alert("Failed to save journal");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="habit-activity-wrapper">
            <div className="habit-activity-card">
                <div className="habit-activity-header">
                    <h2>Journaling 📓</h2>
                    <p className="habit-activity-subtitle">Track your daily habit</p>
                </div>
                <div className="habit-input-container">
                    <textarea 
                        className="habit-textarea"
                        placeholder="Write your thoughts today..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                </div>
                <button className="habit-submit-btn" onClick={handleSave} disabled={loading || !content.trim()}>
                    {loading ? "Saving..." : "Save Journal"}
                </button>
                <p className="habit-tip">Tip: Consistency builds strong habits 💪</p>
            </div>
        </div>
    );
}
