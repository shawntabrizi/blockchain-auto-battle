import { useGameStore } from '../store/gameStore';
import { useMultiplayerStore } from '../store/multiplayerStore';

export function HUD() {
  const { view, endTurn, engine } = useGameStore();
  const { status, setIsReady, sendMessage, isReady, opponentReady } = useMultiplayerStore();

  if (!view) return null;

  const handleEndTurn = () => {
    if (status === 'in-game') {
        const board = engine?.get_board();
        setIsReady(true);
        sendMessage({ type: 'END_TURN_READY', board });
    } else {
        endTurn();
    }
  };

  const isWaiting = status === 'in-game' && isReady && !opponentReady;

  return (
    <div className="h-16 bg-gray-900/80 border-b border-gray-700 flex items-center justify-between px-6">
      {/* Left: Lives */}
      <div className="flex items-center gap-2">
        <span className="text-gray-400">Lives:</span>
        <div className="flex gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <span
              key={i}
              className={`text-2xl ${i < view.lives ? 'text-red-500' : 'text-gray-600'}`}
            >
              ♥
            </span>
          ))}
        </div>
      </div>

      {/* Center: Round & End Turn */}
      <div className="flex items-center gap-4">
        <div className="text-center">
          <div className="text-sm text-gray-400">Round</div>
          <div className="text-2xl font-bold text-gold">{view.round}</div>
        </div>

        {view.phase === 'shop' && (
          <button 
            onClick={handleEndTurn} 
            disabled={isWaiting}
            className={`btn btn-primary text-lg px-6 py-3 transition-all ${isWaiting ? 'bg-gray-600 scale-95 opacity-80 cursor-not-allowed' : ''}`}
          >
            {isWaiting ? 'Waiting...' : 'Battle!'}
          </button>
        )}
      </div>

      {/* Right: Wins */}
      <div className="flex items-center gap-2">
        <span className="text-gray-400">Wins:</span>
        <div className="flex gap-1">
          {Array.from({ length: 10 }).map((_, i) => (
            <span key={i} className={`text-lg ${i < view.wins ? 'text-gold' : 'text-gray-600'}`}>
              ★
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
