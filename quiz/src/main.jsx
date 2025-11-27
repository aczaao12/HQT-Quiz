import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import 'bootstrap/dist/css/bootstrap.min.css' // Removed Bootstrap CSS
import './index.css'
import App from './App.jsx'
import { UserProvider } from './context/UserContext.jsx' // Import UserProvider
import { BrowserRouter } from 'react-router-dom' // Import BrowserRouter

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> {/* Wrap App with BrowserRouter */}
      <UserProvider> {/* Wrap App with UserProvider */}
        <App />
      </UserProvider>
    </BrowserRouter>
  </StrictMode>,
)
