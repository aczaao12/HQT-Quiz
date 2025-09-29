import React from 'react';
import { motion } from 'framer-motion';
import './RecruitmentPage.css';

function RecruitmentPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2, duration: 0.8 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const teamCardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    hover: {
      scale: 1.03,
      rotateY: 5, // Subtle 3D tilt
      boxShadow: "0 15px 30px rgba(0, 198, 255, 0.4)", // Enhanced glow on hover
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      className="recruitment-page"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
    >
      <motion.div className="recruitment-header" variants={itemVariants}>
        <h1>Ban Kỹ thuật - Văn nghệ</h1>
        <h2>Tìm kiếm những gương mặt mới mẻ đầy nhiệt huyết và tài năng!</h2>
      </motion.div>

      <motion.p className="intro-text" variants={itemVariants}>
        Bạn có đam mê với âm nhạc, nghệ thuật, hay muốn học hỏi kỹ năng tổ chức các chương trình lớn? Bạn muốn tạo nên những khoảnh khắc đáng nhớ cho các sự kiện của khoa? Ban Kỹ thuật - Văn nghệ của chúng mình chính thức mở casting, tìm kiếm những gương mặt mới mẻ đầy nhiệt huyết và tài năng để cùng nhau tạo nên những khoảnh khắc bùng nổ!
      </motion.p>

      <motion.div className="team-sections" variants={containerVariants}>
        <motion.div className="team-card tech-team" variants={teamCardVariants} whileHover="hover"> {/* Corrected variants usage */}
          <div className="icon">⚙️</div>
          <h3>ĐỘI KỸ THUẬT</h3>
          <p>Bạn yêu thích công việc hậu trường, muốn tìm hiểu về âm thanh, ánh sáng, dựng sân khấu, đây chính là nơi dành cho bạn!</p>
        </motion.div>

        <motion.div className="team-card art-team" variants={teamCardVariants} whileHover="hover"> {/* Corrected variants usage */}
          <div className="icon">🎤</div>
          <h3>ĐỘI VĂN NGHỆ</h3>
          <p>Bạn có tài năng ca hát, nhảy múa, hoặc tự tin với vai trò MC, hãy tỏa sáng trên sân khấu của chính mình!</p>
        </motion.div>
      </motion.div>

      <motion.p className="motivation-text" variants={itemVariants}>
        ❤️‍🔥 Không cần là một người hoàn hảo, chỉ cần bạn có đam mê và khát khao học hỏi. Chúng mình tin rằng, mỗi người đều có một "sân khấu" cho riêng mình để tỏa sáng.
      </motion.p>

      <motion.div className="benefits-section" variants={containerVariants}>
        <motion.h3 variants={itemVariants}>🏡Ngôi nhà mang tên “Ban Kỹ thuật - Văn nghệ” chúng mình đang tìm kiếm những chiến binh tài năng, có niềm đam mê với âm nhạc để cùng nhau tạo đến những tiết mục thật đặc sắc. Nhưng nếu bạn đang lưỡng lượng thì nhớ… đọc hết phần bên dưới nha!👇👇</motion.h3>
        <motion.h4 variants={itemVariants}>🌟Đến với chúng mình các bạn sẽ được:</motion.h4>
        <motion.ul variants={containerVariants}>
          <motion.li variants={itemVariants}>🌟Học hỏi, trau dồi thêm các kỹ năng về âm nhạc cũng như các kỹ năng mềm khác</motion.li>
          <motion.li variants={itemVariants}>🌟Kết nối với những người bạn có chung niềm đam mê</motion.li>
          <motion.li variants={itemVariants}>🌟Trở thành một phần không thể thiếu của các chương trình do Khoa tổ chức</motion.li>
        </motion.ul>
        <motion.p className="love-text" variants={itemVariants}>
          💓Và hơn thế nữa, bạn sẽ không bao giờ phải lo lắng về việc vụn vỡ trái tim cả, vì ở đây ai cũng yêu thương và hỗ trợ nhau hết mình!
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

export default RecruitmentPage;
