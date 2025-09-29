import React from 'react';
import './ParticleBackground.css';

function ParticleBackground() {
  const particles = Array.from({ length: 50 }, (_, i) => i);

  return (
    <div className="particle-background">
      {particles.map((p) => (
        <div key={p} className="particle"></div>
      ))}
    </div>
  );
}

export default ParticleBackground;
