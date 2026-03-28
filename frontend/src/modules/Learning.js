import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./habitTracking.css";
import API from "../api";

const SKILLS = ["Java", "Python", "React", "UI/UX", "C++"];
const QUIZZES = {
    "Java": [
        "What is OOP?",
        "What is a class?"
    ],
    "Python": [
        "What is a variable?",
        "What does print() do?"
    ],
    "React": [
        "What is a component?",
        "What is useState?"
    ],
    "UI/UX": [
        "What is user experience?",
        "Why is UI important?"
    ],
    "C++": [
        "What is a function?",
        "What is an array?"
    ]
};

export default function Learning({ user }) {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    
    // Step 1
    const [selectedSkill, setSelectedSkill] = useState("");
    
    // Step 2
    const [studyTime, setStudyTime] = useState("");
    const [timerActive, setTimerActive] = useState(false);
    
    // Step 3
    const [answers, setAnswers] = useState(["", ""]);
    
    const [loading, setLoading] = useState(false);

    const handleSkillSelect = (skill) => {
        setSelectedSkill(skill);
        setStep(2);
    };

    const handleStartTimer = () => {
        setTimerActive(true);
    };

    const handleTimerComplete = () => {
        setTimerActive(false);
        setStep(3);
    };

    const handleAnswerChange = (index, val) => {
        const newAns = [...answers];
        newAns[index] = val;
        setAnswers(newAns);
    };

    const handleSubmit = async () => {
        if (!answers[0].trim() || !answers[1].trim()) return;
        setLoading(true);
        try {
            await API.post("/habit/learning", {
                username: user || "guest",
                skill: selectedSkill,
                study_time: studyTime,
                answers: `Q1: ${answers[0]} | Q2: ${answers[1]}`
            });
            navigate("/dashboard");
        } catch (err) {
            console.error(err);
            alert("Failed to save learning activity");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="habit-activity-wrapper">
            <div className="habit-activity-card">
                <div className="habit-activity-header">
                    <h2>Learn New Skills 💻</h2>
                    <p className="habit-activity-subtitle">Track your daily habit</p>
                </div>

                {step === 1 && (
                    <div className="skill-selection">
                        <h3>Select a skill to learn:</h3>
                        <div className="skill-buttons">
                            {SKILLS.map(s => (
                                <button key={s} className="skill-btn" onClick={() => handleSkillSelect(s)}>
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="study-timer">
                        <h3>Study Timer: {selectedSkill}</h3>
                        {!timerActive ? (
                            <div className="timer-setup">
                                <label>Select time:</label>
                                <select className="time-select" value={studyTime} onChange={e => setStudyTime(e.target.value)}>
                                    <option value="">-- Choose --</option>
                                    <option value="15 min">15 min</option>
                                    <option value="30 min">30 min</option>
                                    <option value="45 min">45 min</option>
                                </select>
                                <button 
                                    className="start-timer-btn"
                                    onClick={handleStartTimer}
                                    disabled={!studyTime}
                                >
                                    Start Timer
                                </button>
                            </div>
                        ) : (
                            <div className="timer-active">
                                <p className="timer-display">Timer is running for {studyTime}...</p>
                                <button className="complete-timer-btn" onClick={handleTimerComplete}>
                                    Mark as Completed
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {step === 3 && (
                    <div className="quiz-section">
                        <h3>Quiz: {selectedSkill}</h3>
                        <div className="quiz-question">
                            <label>Q1: {QUIZZES[selectedSkill][0]}</label>
                            <input 
                                type="text" 
                                className="habit-input"
                                value={answers[0]}
                                onChange={e => handleAnswerChange(0, e.target.value)}
                            />
                        </div>
                        <div className="quiz-question">
                            <label>Q2: {QUIZZES[selectedSkill][1]}</label>
                            <input 
                                type="text" 
                                className="habit-input"
                                value={answers[1]}
                                onChange={e => handleAnswerChange(1, e.target.value)}
                            />
                        </div>
                        <button 
                            className="habit-submit-btn"
                            onClick={handleSubmit}
                            disabled={loading || !answers[0].trim() || !answers[1].trim()}
                        >
                            {loading ? "Submitting..." : "Submit Learning"}
                        </button>
                    </div>
                )}

                <button className="dashboard-back-btn" onClick={() => navigate("/dashboard")} style={{marginTop: '25px', width: '100%'}}>
                    Return to Dashboard
                </button>
                <p className="habit-tip">Tip: Consistency builds strong habits 💪</p>
            </div>
        </div>
    );
}
