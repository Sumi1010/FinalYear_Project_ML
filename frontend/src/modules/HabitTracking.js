import React from "react";
import { useNavigate } from "react-router-dom";
import "./habitTracking.css";

const HABITS = [
    { id: "journaling", name: "Journaling 📓", path: "/journaling", description: "Write your thoughts and reflect on your day." },
    { id: "reading", name: "Reading Books 📚", path: "/reading", description: "Log your reading progress and summarize chapters." },
    { id: "learning", name: "Learn New Skills 💻", path: "/learning", description: "Focus, study, and test your knowledge." }
];

export default function HabitTracking({ user }) {
    const navigate = useNavigate();

    const handleHabitSelect = (habit) => {
        navigate(habit.path);
    };

    const handleReturnDashboard = () => {
        navigate("/dashboard");
    };

    return (
        <div className="habit-tracking-container">
            <div className="habit-header">
                <h1>Habit Tracking 🌟</h1>
                <p>Build good habits with interactive activities.</p>
            </div>

            <div className="habit-grid">
                {HABITS.map(habit => (
                    <div key={habit.id} className="habit-card interactive-habit-card" onClick={() => handleHabitSelect(habit)}>
                        <h3>{habit.name}</h3>
                        <p className="habit-description">{habit.description}</p>
                    </div>
                ))}
            </div>

            <button className="dashboard-back-btn" onClick={handleReturnDashboard}>
                Return to Dashboard
            </button>
        </div>
    );
}
