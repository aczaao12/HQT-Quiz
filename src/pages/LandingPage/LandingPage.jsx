import React from 'react';
import { motion } from 'framer-motion';
import useMediaQuery from '../../hooks/useMediaQuery'; // Import useMediaQuery
import './LandingPage.css';

function LandingPage() {
  const isMobile = useMediaQuery('(max-width: 768px)'); // Define mobile breakpoint

  const variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  // YouTube video IDs
  const desktopVideoId = "MZTbOMadKc8";
  const mobileVideoId = "Rhl8gUMWg5Q"; // New video ID for mobile

  const currentVideoId = isMobile ? mobileVideoId : desktopVideoId;
  const youtubeEmbedUrl = `https://www.youtube.com/embed/${currentVideoId}?autoplay=1&mute=1&loop=1&playlist=${currentVideoId}&controls=0&showinfo=0&modestbranding=1&rel=0`;

  return (
    <motion.div
      className="landing-page"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.6 }}
      variants={variants}
    >
      <div className="video-background">
        <iframe
          src={youtubeEmbedUrl}
          frameBorder="0"
          allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Hero Video Background"
          className="youtube-iframe"
        ></iframe>
      </div>
      <div className="landing-content">
        <motion.h1 variants={variants}>Ban Kỹ Thuật & Văn Nghệ Khoa Công nghệ hóa học & thực phẩm</motion.h1>
        <motion.p variants={variants}>Chào mừng đến với trang chính thức của chúng tôi!</motion.p>
        <motion.p variants={variants}>Khám phá các dự án và hoạt động của chúng tôi.</motion.p>
        <motion.a href="#tuyendung" className="cta-button" variants={variants}>
          Gia nhập đội ngũ của chúng tôi!
        </motion.a>
      </div>
    </motion.div>
  );
}

export default LandingPage;