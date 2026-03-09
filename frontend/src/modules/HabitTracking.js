import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./habitTracking.css";

const HABITS = [
    { id: "morning_sunshine", name: "Morning Sunshine ☀️", activity: "Step outside or stand near a window and enjoy sunlight for 5 minutes." },
    { id: "calm_mind", name: "Calm Mind 🧘", activity: "Take 5 slow deep breaths and relax your mind." },
    { id: "learn_something_new", name: "Learn Something New 📚", activity: "Read or watch something educational for 5 minutes." },
    { id: "smart_eating", name: "Smart Eating 🍎", activity: "Eat one fruit or healthy snack today." },
    { id: "digital_detox", name: "Digital Detox 📵", activity: "Take a 5 minute break from your phone or computer." }
];

export default function HabitTracking({ user }) {
    const navigate = useNavigate();
    const [selectedHabit, setSelectedHabit] = useState(null);
    const [activityStarted, setActivityStarted] = useState(false);
    const [activityCompleted, setActivityCompleted] = useState(false);

    const handleHabitSelect = (habit) => {
        setSelectedHabit(habit);
        setActivityStarted(false);
        setActivityCompleted(false);
    };

    const handleStartActivity = () => {
        setActivityStarted(true);
    };

    const handleCompleteActivity = () => {
        setActivityCompleted(true);
    };

    const handleReturnDashboard = () => {
        navigate("/dashboard");
    };

    if (activityCompleted) {
        return (
            <div className="habit-tracking-container">
                <div className="completion-card">
                    <h2>Great job! You completed today's habit activity. 🎉</h2>
                    <button className="return-btn" onClick={handleReturnDashboard}>
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (selectedHabit) {
        return (
            <div className="habit-tracking-container">
                <div className="activity-card">
                    <h2>{selectedHabit.name}</h2>
                    <p className="instruction">{selectedHabit.activity}</p>

                    <div className="activity-actions">
                        {!activityStarted ? (
                            <button className="start-btn" onClick={handleStartActivity}>
                                Start Activity
                            </button>
                        ) : (
                            <button className="complete-btn" onClick={handleCompleteActivity}>
                                Completed
                            </button>
                        )}

                        <button className="back-btn" onClick={() => setSelectedHabit(null)}>
                            Choose Another Habit
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="habit-tracking-container">
            <div className="habit-header">
                <h1>Habit Tracking 🌟</h1>
                <p>Build good habits, one day at a time.</p>
            </div>

            <div className="habit-grid">
                {HABITS.map(habit => (
                    <div key={habit.id} className="habit-card" onClick={() => handleHabitSelect(habit)}>
                        <h3>{habit.name}</h3>
                    </div>
                ))}
            </div>

            <button className="dashboard-back-btn" onClick={handleReturnDashboard}>
                Return to Dashboard
            </button>
        </div>
    );
}
