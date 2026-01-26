import { useEffect, useRef } from 'react';
import { GameLayout } from './components/GameLayout';
import { useGameStore } from './store/gameStore';
import { MultiplayerMenu } from './components/MultiplayerMenu';
import { MultiplayerManager } from './components/MultiplayerManager';
import { useMultiplayerStore } from './store/multiplayerStore';

function App() {
  const init = useGameStore((state) => state.init);
  const initCalled = useRef(false);
  const showMultiplayer = useMultiplayerStore((state) => state.showMenu);

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
      {showMultiplayer && <MultiplayerMenu />}
      
      <MultiplayerManager />
      <GameLayout />
    </>
  );
}

export default App;
