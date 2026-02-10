import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// react-router-dom
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'

const Layout = () => {
  const location = useLocation();
  return (
    <>
      <h1>Welcome to SnapBulance!</h1>
    </>
  )
}

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Layout/>
  </BrowserRouter>,
)
