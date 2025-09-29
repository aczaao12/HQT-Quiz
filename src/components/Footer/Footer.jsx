import React from 'react';
import { motion } from 'framer-motion';
import './Footer.css';

function Footer() {
  const footerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  return (
    <motion.footer
      className="footer"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
      variants={footerVariants}
    >
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} Ban Kỹ thuật & Văn nghệ Khoa Công nghệ hóa học & thực phẩm. All rights reserved.</p>
        <div className="footer-links">
          <a href="#trangchu">Trang chủ</a>
          <a href="#gioithieu">Giới thiệu</a>
          <a href="#tuyendung">Tuyển dụng</a>
        </div>
        <div className="social-links">
          <a href="#" target="_blank" rel="noopener noreferrer">Facebook</a>
          <a href="#" target="_blank" rel="noopener noreferrer">Instagram</a>
        </div>
      </div>
    </motion.footer>
  );
}

export default Footer;
