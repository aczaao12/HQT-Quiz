import React, { useState, useEffect } from 'react';
import { animateScroll as scroll } from 'react-scroll';
import { motion } from 'framer-motion';
import './BackToTopButton.css';

function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled up to a certain amount
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) { // Show after scrolling 300px
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Scroll to top smoothly
  const scrollToTop = () => {
    scroll.scrollToTop({
      duration: 500,
      smooth: true,
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    hover: {
      scale: 1.1,
      boxShadow: "0 0 15px rgba(0, 198, 255, 0.6)",
      transition: { duration: 0.2 }
    }
  };

  return (
    <>
      {isVisible && (
        <motion.button
          className="back-to-top"
          onClick={scrollToTop}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          variants={buttonVariants}
        >
          ↑
        </motion.button>
      )}
    </>
  );
}

export default BackToTopButton;