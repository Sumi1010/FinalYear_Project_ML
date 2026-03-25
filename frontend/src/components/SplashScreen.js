import React, { useEffect, useState } from 'react';
import './SplashScreen.css';

const SplashScreen = ({ onComplete }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fading out slightly before 3s for a smooth transition
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 2500);

    // Call onComplete exactly at 3s to remove the splash screen from DOM
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className={`splash-container ${fadeOut ? 'fade-out' : ''}`}>
      <div className="splash-content">
        <svg 
          className="logo-icon" 
          width="80" 
          height="80" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        >
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
        </svg>
        <h1 className="logo-text">MyWellness</h1>
        <p className="tagline">Track &bull; Improve &bull; Balance Your Life</p>
      </div>
    </div>
  );
};

export default SplashScreen;
