import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './ContactForm.css';

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Đang gửi...');

    // Replace with your actual Formspree endpoint
    const formEndpoint = "https://formspree.io/f/YOUR_FORMSPREE_ID"; // IMPORTANT: User needs to replace this

    try {
      const response = await fetch(formEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus('Gửi thành công! Cảm ơn bạn đã liên hệ.');
        setFormData({ name: '', email: '', message: '' });
      } else {
        const data = await response.json();
        if (data.errors) {
          setStatus(data.errors.map(error => error.message).join(', '));
        } else {
          setStatus('Đã xảy ra lỗi. Vui lòng thử lại.');
        }
      }
    } catch (error) {
      setStatus('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  return (
    <motion.div
      className="contact-form-section"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={formVariants}
    >
      <h2>Liên hệ với chúng tôi</h2>
      <form onSubmit={handleSubmit} className="contact-form">
        <div className="form-group">
          <label htmlFor="name">Tên của bạn:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email của bạn:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="message">Tin nhắn:</label>
          <textarea
            id="message"
            name="message"
            rows="5"
            value={formData.message}
            onChange={handleChange}
            required
          ></textarea>
        </div>
        <button type="submit" className="submit-button">Gửi tin nhắn</button>
        {status && <p className="form-status">{status}</p>}
      </form>
    </motion.div>
  );
}

export default ContactForm;
