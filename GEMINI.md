# Project Overview

This repository (`kt-vh`) contains a React.js project named "quiz", initialized with Vite. The "quiz" project is a minimalistic setup, primarily demonstrating a default Vite + React template with a simple counter.

Additionally, this repository includes configuration files for a development environment within the `.idx/` directory, suggesting it's intended to be run using Google IDX.

# Building and Running the 'quiz' Project

The primary project within this repository is located in the `quiz/` subdirectory.

*   **Install dependencies:** Navigate to the `quiz/` directory and run:
    ```bash
    cd quiz
    npm install
    ```
*   **Run in development mode:** (From within `quiz/` directory)
    ```bash
    npm run dev
    ```
*   **Build for production:** (From within `quiz/` directory)
    ```bash
    npm run build
    ```
*   **Start production server (after build):** (From within `quiz/` directory)
    ```bash
    npm run preview
    ```

# Development Conventions (for the 'quiz' Project)

*   **Frameworks:** React.js, Vite
*   **State Management:** React's `useState` hook.
*   **Styling:** Plain CSS (`App.css`, `index.css`).
*   **Tooling:** ESLint for linting.
*   **Code Structure:** Components are organized in the `quiz/src/` directory, with `App.jsx` as the main component and `main.jsx` as the entry point.
*   **Development Environment:** Configured for Google IDX, as indicated by `dev.nix` in the `.idx/` directory.
