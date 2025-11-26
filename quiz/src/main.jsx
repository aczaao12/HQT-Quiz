import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css' // Import Bootstrap CSS
import './index.css'
import App from './App.jsx'
import { UserProvider } from './context/UserContext.jsx' // Import UserProvider

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserProvider> {/* Wrap App with UserProvider */}
      <App />
    </UserProvider>
  </StrictMode>,
)
