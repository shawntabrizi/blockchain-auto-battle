import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GameLayout } from './GameLayout';
import { MultiplayerManager } from './MultiplayerManager';
import { useGameStore } from '../store/gameStore';
import { useMultiplayerStore } from '../store/multiplayerStore';

export function MultiplayerGame() {
  const navigate = useNavigate();
  const init = useGameStore((state) => state.init);
  const { status, conn } = useMultiplayerStore();
  const initCalled = useRef(false);

  // Redirect to lobby if not connected
  useEffect(() => {
    if (!conn || status === 'disconnected') {
      navigate('/multiplayer');
    }
  }, [conn, status, navigate]);

  // Initialize game engine (same pattern as App.tsx)
  useEffect(() => {
    if (initCalled.current) return;
    initCalled.current = true;
    init();
  }, [init]);

  if (!conn || status === 'disconnected') {
    return null;
  }

  return (
    <>
      <Toaster position="top-right" />
      <MultiplayerManager />
      <GameLayout />
    </>
  );
}
