import React, { useState, useEffect } from "react";
import "./MotivationPopup.css";
import API from "../api";

export default function MotivationPopup({ user }) {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchMotivation = async () => {
      try {
        const username = user || "guest";
        const response = await API.get(`/daily-motivation/${username}`);
        if (response.data && response.data.message) {
          setMessage(response.data.message);
          setShow(true);
        }
      } catch (error) {
        console.error("Error fetching daily motivation:", error);
      }
    };
    
    // Slight delay for smooth animation
    setTimeout(fetchMotivation, 500);
  }, [user]);

  if (!show) return null;

  return (
    <div className="motivation-popup-overlay">
      <div className="motivation-popup-card">
        <button className="close-popup" onClick={() => setShow(false)}>×</button>
        <div className="motivation-icon">✨</div>
        <h3 className="motivation-title">Daily Motivation</h3>
        <p className="motivation-text">{message}</p>
      </div>
    </div>
  );
}
