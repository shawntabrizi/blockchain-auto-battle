import { useEffect, useRef } from 'react';
import { useMultiplayerStore } from '../store/multiplayerStore';
import { useGameStore } from '../store/gameStore';

export function MultiplayerManager() {
  const { 
      conn, 
      isHost, 
      status,
      sendMessage, 
      addLog, 
      setOpponentReady, 
      setOpponentBoard, 
      isReady, 
      opponentReady, 
      opponentBoard,
      gameSeed,
      setGameSeed,
      setStatus,
      setIsReady
  } = useMultiplayerStore();
  
  const { startMultiplayerGame, resolveMultiplayerBattle, view, engine } = useGameStore();

  // Guards to prevent double-execution in React StrictMode
  const hostGameStarted = useRef(false);
  const guestGameStarted = useRef(false);

  // Handle incoming messages
  useEffect(() => {
    if (!conn) return;

    const handleData = (data: any) => {
        if (!data || typeof data !== 'object') return;
        
        switch (data.type) {
            case 'HANDSHAKE':
                addLog(`Handshake: v${data.version}`);
                break;
                
            case 'START_GAME':
                // Seed and status are now handled by the store's data handler
                // The useEffect below will call startMultiplayerGame when engine is ready
                break;
                
            case 'END_TURN_READY':
                addLog(`Opponent is ready`);
                setOpponentReady(true);
                setOpponentBoard(data.board);
                break;
        }
    };

    conn.on('data', handleData);
    
    // Initial handshake
    sendMessage({ type: 'HANDSHAKE', version: '0.1.0' });

    return () => {
      conn.off('data', handleData);
    };
  }, [conn]);

  // Host starts game when connected and engine is ready
  useEffect(() => {
      if (hostGameStarted.current) return;
      if (isHost && status === 'connected' && !gameSeed && engine) {
          hostGameStarted.current = true;
          addLog("Host: Starting game session...");
          const seed = Math.floor(Math.random() * 1000000);
          setGameSeed(seed);
          startMultiplayerGame(seed);
          sendMessage({ type: 'START_GAME', seed });
          setStatus('in-game');
      }
  }, [isHost, status, gameSeed, engine]);

  // Guest starts game when they have a seed (possibly received while on /multiplayer) and engine is ready
  useEffect(() => {
      if (guestGameStarted.current) return;
      if (!isHost && gameSeed !== null && engine && status === 'in-game') {
          guestGameStarted.current = true;
          addLog("Guest: Starting game with received seed...");
          startMultiplayerGame(gameSeed);
      }
  }, [isHost, gameSeed, engine, status]);

  // Trigger battle when both ready
  useEffect(() => {
      if (isReady && opponentReady && opponentBoard && gameSeed !== null && view) {
          addLog("Both players ready! Resolving battle...");
          
          // Round-specific seed
          const roundSeed = gameSeed + (view.round * 100);
          
          resolveMultiplayerBattle(opponentBoard, roundSeed);
          
          // Reset ready states for next round transition
          setIsReady(false);
          setOpponentReady(false);
          setOpponentBoard(null);
      }
  }, [isReady, opponentReady, opponentBoard, gameSeed, view]);

  return null;
}
