import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import { SandboxPage } from './components/SandboxPage.tsx';
import { MultiplayerPage } from './components/MultiplayerPage.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/sandbox" element={<SandboxPage />} />
        <Route path="/multiplayer" element={<MultiplayerPage />} />
      </Routes>
    </HashRouter>
  </StrictMode>
);
