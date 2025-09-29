import React, { useState } from 'react';
import { Link as ScrollLink } from 'react-scroll';
import { useDarkMode } from '../../hooks/useDarkMode';
// import logoKhoa from '../../assets/logoKhoa.png'; // Old import
const logoKhoa = '/assets/logoKhoa.png'; // New direct reference from public directory
import './Navbar.css';

function Navbar() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <ScrollLink to="trangchu" smooth={true} duration={500} className="navbar-logo-link" onClick={closeMenu}>
          <img src={logoKhoa} alt="Logo Khoa" className="navbar-logo" />
        </ScrollLink>
      </div>

      <div className="menu-icon" onClick={toggleMenu}>
        <div className={menuOpen ? "bar bar1 open" : "bar bar1"}></div>
        <div className={menuOpen ? "bar bar2 open" : "bar bar2"}></div>
        <div className={menuOpen ? "bar bar3 open" : "bar bar3"}></div>
      </div>

      <ul className={menuOpen ? "navbar-nav open" : "navbar-nav"}>
        <li className="nav-item">
          <ScrollLink to="trangchu" smooth={true} duration={500} className="nav-link" onClick={closeMenu}>Trang chủ</ScrollLink>
        </li>
        <li className="nav-item">
          <ScrollLink to="gioithieu" smooth={true} duration={500} className="nav-link" onClick={closeMenu}>Giới thiệu</ScrollLink>
        </li>
        <li className="nav-item">
          <ScrollLink to="tuyendung" smooth={true} duration={500} className="nav-link" onClick={closeMenu}>Tuyển dụng</ScrollLink>
        </li>
        <li className="nav-item">
          <ScrollLink to="lienhe" smooth={true} duration={500} className="nav-link" onClick={closeMenu}>Liên hệ</ScrollLink>
        </li>
        <li className="nav-item">
          <button onClick={() => { toggleDarkMode(); closeMenu(); }} className="dark-mode-toggle">
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;