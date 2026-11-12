import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles/index.css';
// Precisa carregar antes de tudo: o Chrome dispara `beforeinstallprompt` uma
// única vez, então o listener tem que existir desde o primeiro tick.
import './services/installPrompt.js';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
