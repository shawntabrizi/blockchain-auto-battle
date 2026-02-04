import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMultiplayerStore } from '../store/multiplayerStore';
import { RotatePrompt } from './RotatePrompt';

export function MultiplayerPage() {
  const navigate = useNavigate();
  const { 
    peer, 
    initializePeer, 
    myPeerId, 
    opponentPeerId, 
    status, 
    connectToPeer, 
    logs 
  } = useMultiplayerStore();
  
  const [targetId, setTargetId] = useState('');
  const [showLogs, setShowLogs] = useState(false);

  const handleHost = async () => {
    await initializePeer();
  };

  const handleJoin = async () => {
      if (!peer) {
          try {
             await initializePeer();
          } catch (e) {
              console.error(e);
              return;
          }
      }
      connectToPeer(targetId);
  };
  
  const handleGoToGame = () => {
      navigate('/');
  };

  return (
    <div className="min-h-screen bg-board-bg flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-2">⚔️ Multiplayer Mode</h1>
        <p className="text-gray-400">P2P Battle Synchronization via WebRTC</p>
      </div>

      <div className="bg-gray-800 p-8 rounded-lg max-w-md w-full text-white relative border-2 border-gray-700 shadow-2xl">
        <button 
            onClick={() => navigate('/')}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
            title="Back to Game"
        >
            ✕
        </button>
        
        {status === 'connected' || status === 'in-game' ? (
             <div className="text-center">
                 <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-green-500">
                    <span className="text-4xl">🔗</span>
                 </div>
                 <h2 className="text-2xl font-bold text-green-400 mb-2">Connected!</h2>
                 <p className="mb-6 text-gray-300">
                    Ready to battle against: <br/>
                    <span className="font-mono text-yellow-300">{opponentPeerId}</span>
                 </p>
                 <div className="space-y-3">
                    <button 
                        onClick={handleGoToGame}
                        className="w-full bg-blue-600 px-6 py-3 rounded font-bold hover:bg-blue-500 transition-colors"
                    >
                        Return to Board
                    </button>
                    <p className="text-xs text-gray-500">
                        The game is synced. Go back to the board to build your team.
                    </p>
                 </div>
             </div>
        ) : (
            <>
                <h2 className="text-xl font-bold mb-6 text-center text-yellow-400">Network Setup</h2>
                
                {!peer ? (
                    <div className="space-y-4">
                        <button 
                            onClick={handleHost}
                            className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold text-lg transition-all active:scale-95"
                        >
                            Initialize Network
                        </button>
                        <p className="text-sm text-gray-400 text-center px-4">
                            Click to generate your Peer ID so others can join you, or so you can join them.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-gray-900 p-5 rounded-xl border border-gray-700 text-center">
                            <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Your Unique ID</div>
                            <div className="text-2xl font-mono text-yellow-400 select-all break-all leading-tight">{myPeerId}</div>
                            <div className="text-xs text-gray-500 mt-2 italic">Share this with your opponent</div>
                        </div>

                        <div className="border-t border-gray-700 pt-6">
                            <label className="block text-sm font-medium mb-3 text-gray-300">Join an Existing Match</label>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={targetId}
                                    onChange={(e) => setTargetId(e.target.value)}
                                    placeholder="Enter Opponent ID"
                                    className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <button 
                                    onClick={handleJoin}
                                    disabled={!targetId || status === 'connecting'}
                                    className="bg-green-600 hover:bg-green-500 px-6 rounded-lg font-bold disabled:opacity-50 transition-colors"
                                >
                                    Join
                                </button>
                            </div>
                        </div>
                        
                        {status === 'connecting' && (
                            <div className="text-center text-yellow-400 animate-pulse font-medium">Establishing connection...</div>
                        )}
                    </div>
                )}
            </>
        )}
        
        <div className="mt-8 border-t border-gray-700 pt-4">
             <button 
                onClick={() => setShowLogs(!showLogs)}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1"
             >
                 {showLogs ? '▼' : '▶'} {showLogs ? 'Hide Connection Logs' : 'View Connection Logs'}
             </button>
             {showLogs && (
                 <div className="mt-2 h-40 overflow-y-auto bg-black/50 p-3 text-[10px] font-mono text-gray-400 rounded-lg border border-gray-800">
                     {logs.map((l, i) => (
                         <div key={i} className="mb-1 border-b border-gray-900 pb-1 last:border-0">
                            <span className="text-gray-600">[{new Date(l.timestamp).toLocaleTimeString()}]</span> {l.message}
                         </div>
                     ))}
                 </div>
             )}
        </div>
      </div>

      <button
        onClick={() => navigate('/')}
        className="mt-8 text-gray-500 hover:text-white underline text-sm"
      >
        ← Back to Main Game
      </button>

      <RotatePrompt />
    </div>
  );
}
