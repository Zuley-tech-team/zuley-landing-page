import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ToastProvider } from './contexts/ToastContext.tsx'
import { AdminProvider } from './contexts/AdminContext.tsx'
import { CartProvider } from './contexts/CartContext.tsx'
import { ToastContainer } from './components/common'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AdminProvider>
      <ToastProvider>
        <CartProvider>
          <App />
          <ToastContainer />
        </CartProvider>
      </ToastProvider>
    </AdminProvider>
  </StrictMode>,
)
