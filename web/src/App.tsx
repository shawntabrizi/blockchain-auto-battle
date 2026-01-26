import { useEffect, useRef } from 'react';
import { GameLayout } from './components/GameLayout';
import { useGameStore } from './store/gameStore';
import { MultiplayerManager } from './components/MultiplayerManager';

function App() {
  const init = useGameStore((state) => state.init);
  const initCalled = useRef(false);

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
      <MultiplayerManager />
      <GameLayout />
    </>
  );
}

export default App;
