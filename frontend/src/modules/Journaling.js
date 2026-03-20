import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./habitTracking.css";

export default function Journaling({ user }) {
    const navigate = useNavigate();
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!content.trim()) return;
        setLoading(true);
        try {
            const resp = await fetch("http://localhost:8000/habit/journal", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: user || "guest",
                    content: content
                })
            });
            if (resp.ok) {
                navigate("/dashboard");
            } else {
                alert("Failed to save journal");
            }
        } catch (err) {
            console.error(err);
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
