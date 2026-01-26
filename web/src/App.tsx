import { useEffect, useRef, useState } from 'react';
import { GameLayout } from './components/GameLayout';
import { useGameStore } from './store/gameStore';
import { MultiplayerMenu } from './components/MultiplayerMenu';
import { MultiplayerManager } from './components/MultiplayerManager';

function App() {
  const init = useGameStore((state) => state.init);
  const initCalled = useRef(false);
  const [showMultiplayer, setShowMultiplayer] = useState(false);

  useEffect(() => {
    // Prevent double initialization in StrictMode
    if (initCalled.current) {
      console.log('Init already called, skipping');
      return;
    }
    initCalled.current = true;

    init();
  }, [init]);

  return (
    <>
      <button
        onClick={() => setShowMultiplayer(true)}
        className="fixed top-2 left-2 z-40 bg-gray-800/80 text-white px-3 py-1 rounded text-xs hover:bg-gray-700 border border-gray-600"
      >
        Multiplayer
      </button>

      {showMultiplayer && <MultiplayerMenu onClose={() => setShowMultiplayer(false)} />}
      
      <MultiplayerManager />
      <GameLayout />
    </>
  );
}

export default App;
