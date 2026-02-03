import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import { SandboxPage } from './components/SandboxPage.tsx';
import { MultiplayerPage } from './components/MultiplayerPage.tsx';
import { BlockchainPage } from './components/BlockchainPage.tsx';
import { CreateSetPage } from './components/CreateSetPage.tsx';
import { CreateCardPage } from './components/CreateCardPage.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/sandbox" element={<SandboxPage />} />
        <Route path="/multiplayer" element={<MultiplayerPage />} />
        <Route path="/blockchain" element={<BlockchainPage />} />
        <Route path="/blockchain/create-card" element={<CreateCardPage />} />
        <Route path="/blockchain/create-set" element={<CreateSetPage />} />
      </Routes>
    </HashRouter>
  </StrictMode>
);
