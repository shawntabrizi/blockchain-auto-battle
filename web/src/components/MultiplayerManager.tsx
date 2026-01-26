import { useEffect } from 'react';
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
  
  const { startMultiplayerGame, resolveMultiplayerBattle, view } = useGameStore();

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
                addLog(`Starting game with seed ${data.seed}`);
                setGameSeed(data.seed);
                startMultiplayerGame(data.seed);
                setStatus('in-game');
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

  // Host starts game when connected
  useEffect(() => {
      if (isHost && status === 'connected' && !gameSeed) {
          addLog("Host: Starting game session...");
          const seed = Math.floor(Math.random() * 1000000);
          setGameSeed(seed);
          startMultiplayerGame(seed);
          sendMessage({ type: 'START_GAME', seed });
          setStatus('in-game');
      }
  }, [isHost, status, gameSeed]);

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
