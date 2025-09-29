# Project Blueprint

## Overview

This project is a React application initialized with Vite. The goal is to create a single-page application with scroll-based navigation, featuring the text "Ban Kỹ Thuật & Văn Nghệ Khoa Công nghệ hóa học & thực phẩm". The application has been styled with a "technology and art" aesthetic, includes modern UX interactions, and is fully responsive.

## Current Features

- React application with Vite.
- **Scalable Architecture:** The `src` directory has been refactored into `components`, `pages`, `contexts`, `hooks`, and `assets` for better organization and scalability.
- **Single-Page Application (SPA) Architecture:** All content (`LandingPage`, `AboutPage`, `RecruitmentPage`, `ContactForm`) is rendered on a single page.
- **Scroll-based Navigation:** Implemented using `react-scroll` for smooth scrolling to different sections via Navbar links.
- `LandingPage.jsx` component created with main content, an interactive Call-to-Action (CTA) button, and a **responsive hero section YouTube video background** (using `<iframe>`), which now **conditionally uses a different YouTube Shorts video for mobile UI**.
- `AboutPage.jsx` component created as a section, localized to Vietnamese.
- `RecruitmentPage.jsx` component created to display detailed information about the "Ban Kỹ thuật - Văn nghệ" with a diverse design, with team headings localized to Vietnamese.
- `ContactForm.jsx` component added for user feedback, integrated with Formspree (requires user to provide Formspree ID), and localized to Vietnamese.
- `Footer.jsx` component added for copyright, links, and social media, styled to match the theme.
- `Navbar.jsx` component created for navigation, including links to all sections, all localized to Vietnamese. The faculty logo (`logoKhoa.png`) has been integrated into the Navbar as the brand representation, with its size adjusted. Includes a responsive hamburger menu for mobile.
- `App.jsx` configured to render all sections and includes scroll-triggered animations, now also rendering the `Footer`.
- `main.jsx` updated to remove `BrowserRouter`.
- Styling applied across `index.css`, `App.css`, `Navbar.css`, `LandingPage.css`, `AboutPage.css`, `RecruitmentPage.css`, `ContactForm.css`, and `Footer.css` to achieve a "technology and art" aesthetic, with adjusted font sizes for mobile UI. Enhanced glowing/neon effects and an animated grid background overlay have been added to increase the visual impact and modern feel. Global `box-sizing: border-box;` and `overflow-x: hidden;` on `body` have been added to improve layout consistency and prevent horizontal scrolling issues.
- Google Fonts (Roboto, Montserrat) linked in `index.html`.
- **Dark Mode Toggle:** Implemented using React Context, `localStorage` for persistence, and CSS variables for dynamic styling. This enhances modern UX interaction. Refactored `DarkModeContext` and `useDarkMode` into separate files to resolve linting issues.
- **Scroll-Triggered Animations:** Implemented using `framer-motion` (`whileInView`) for smooth, engaging animations as sections enter the viewport.
- **Parallax Scrolling Effect:** Implemented using `framer-motion`'s `useScroll` and `useTransform` hooks to create a subtle parallax effect on the main content of each section, enhancing visual depth and dynamism.
- **Full Responsiveness:** Ensured through media queries in CSS and a mobile-friendly Navbar.
- **Open Graph Image:** Added `og:image` meta tag to `index.html` pointing to `/assets/Og.jpg`, along with `og:title`, `og:description`, `og:url`, and `og:type` for improved social media sharing.

## Plan for Current Request

### Add Email-based Authentication with Admin Approval

**Goal:** Implement user registration and login functionality using email and password, with an additional step where an administrator must approve new user accounts before they can log in.

**Steps:**

1.  **Install Firebase SDK**: Ensure `@firebase/app`, `@firebase/auth`, and `@firebase/firestore` are installed.
2.  **Configure Firebase**: Create `src/firebase.js` to initialize Firebase with project credentials.
3.  **Create Authentication Context (`src/contexts/AuthContext.jsx`)**:
    *   Provide `currentUser`, `signup`, `login`, `logout` functions.
    *   Manage Firebase authentication state.
4.  **Create Registration Component (`src/components/Auth/Register.jsx`)**:
    *   Form for email, password, confirm password.
    *   Call `signup` from `AuthContext`.
    *   Upon successful registration, create a user document in Firestore with `approved: false`.
    *   Display a message indicating that the account needs admin approval.
5.  **Create Login Component (`src/components/Auth/Login.jsx`)**:
    *   Form for email, password.
    *   Call `login` from `AuthContext`.
    *   Before allowing login, check the user's `approved` status in Firestore. If `false`, prevent login and show an appropriate message.
6.  **Create Auth Page (`src/pages/AuthPage/AuthPage.jsx`)**:
    *   A page to host both `Register` and `Login` components, allowing users to switch between them.
7.  **Integrate into `App.jsx`**:
    *   Wrap the application with `AuthContext.Provider`.
    *   Conditionally render `AuthPage` or the main application content based on `currentUser` and `approved` status.
8.  **Admin Approval Mechanism (Conceptual)**:
    *   Admin can view unapproved users in Firebase Console (Firestore).
    *   Admin manually updates `approved` field to `true` for new users.

### Troubleshooting

- **Issue:** `Uncaught SyntaxError: The requested module '/src/DarkModeContext.jsx' does not provide an export named 'useDarkMode'`
- **Resolution:** This error is likely due to a stale cache or lingering build artifacts. The code has been verified to be correct. Please restart the development server to clear the cache and rebuild the application.
- **Issue:** ESLint reports "'motion' is defined but never used" in `App.jsx`, `LandingPage.jsx`, `AboutPage.jsx`, `RecruitmentPage.jsx`, `ContactForm.jsx`, and `Footer.jsx`.
- **Resolution:** This is a known false positive with ESLint and `framer-motion` when `motion` is used directly in JSX. The functionality is not affected. It does not impact the application's runtime.
- **Issue:** ESLint reports "'error' is defined but never used" in `ContactForm.jsx`.
- **Resolution:** This is a linter-specific issue. The `error` variable is used within the `catch` block for debugging/logging purposes. It does not impact the application's runtime.
- **Issue:** `504 Gateway Timeout` for `react-scroll.js`.
- **Resolution:** This is typically a development server or network issue. Please restart your development server to clear any temporary problems and force a fresh build.