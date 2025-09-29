import React from 'react';
import { motion } from 'framer-motion';
import './AboutPage.css';

function AboutPage() {
  const variants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  return (
    <motion.div
      className="about-page"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.6 }}
      variants={variants}
    >
      <motion.h1 variants={variants}>Về chúng tôi</motion.h1>
      <motion.p variants={variants}>Đây là trang giới thiệu mẫu cho tổ chức "Ban Kỹ Thuật & Văn Nghệ Khoa Công nghệ hóa học & thực phẩm".</motion.p>
      <motion.p variants={variants}>Nội dung sẽ được cập nhật sau.</motion.p>
    </motion.div>
  );
}

export default AboutPage;
