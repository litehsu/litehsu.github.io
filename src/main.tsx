import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import BuyListDisplay from './BuyListDisplay.tsx'

const isDisplay = window.location.pathname === '/display'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isDisplay ? <BuyListDisplay /> : <App />}
  </StrictMode>,
)
