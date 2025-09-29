import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './CustomCursor.css';

function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({
    x: 0,
    y: 0
  });

  useEffect(() => {
    const mouseMove = e => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY
      });
    };

    window.addEventListener('mousemove', mouseMove);

    return () => {
      window.removeEventListener('mousemove', mouseMove);
    };
  }, []);

  const variants = {
    default: {
      x: mousePosition.x - 16, // Adjust for half width of cursor
      y: mousePosition.y - 16, // Adjust for half height of cursor
      transition: { type: "spring", mass: 0.1, damping: 10, stiffness: 100 }
    }
  };

  return (
    <motion.div
      className="custom-cursor"
      variants={variants}
      animate="default"
    />
  );
}

export default CustomCursor;
