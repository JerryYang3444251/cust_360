import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import CUS360Demo from './CUS360Demo'

const root = document.getElementById('root')
createRoot(root).render(
  <React.StrictMode>
    <CUS360Demo />
  </React.StrictMode>
)
