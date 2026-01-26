import { useState } from 'react';
import { useMultiplayerStore } from '../store/multiplayerStore';

export function MultiplayerMenu() {
  const { 
    peer, 
    initializePeer, 
    myPeerId, 
    opponentPeerId, 
    status, 
    connectToPeer, 
    logs,
    setShowMenu
  } = useMultiplayerStore();
  
  const [targetId, setTargetId] = useState('');
  const [showLogs, setShowLogs] = useState(false);

  const handleHost = async () => {
    await initializePeer();
  };

  const handleJoin = async () => {
      // If we don't have a peer yet, init one first
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
  
  if (status === 'connected' || status === 'in-game') {
      return (
          <div className="fixed top-0 left-0 w-full h-full bg-black/80 flex items-center justify-center z-50">
             <div className="bg-gray-800 p-8 rounded text-white text-center">
                 <h2 className="text-2xl font-bold text-green-400 mb-4">Connected!</h2>
                 <p className="mb-6">Playing against: <span className="font-mono text-yellow-300">{opponentPeerId}</span></p>
                 <button 
                    onClick={() => setShowMenu(false)}
                    className="bg-blue-600 px-6 py-2 rounded hover:bg-blue-500"
                 >
                     Go to Game
                 </button>
             </div>
          </div>
      )
  }

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black/90 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg max-w-md w-full text-white relative">
        <button 
            onClick={() => setShowMenu(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
            ✕
        </button>
        
        <h2 className="text-2xl font-bold mb-6 text-center">Multiplayer Setup</h2>
        
        {!peer ? (
             <div className="space-y-4">
                 <button 
                    onClick={handleHost}
                    className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded font-bold"
                 >
                     Initialize Network
                 </button>
                 <p className="text-xs text-gray-400 text-center">
                     Click to generate your Peer ID so others can join you, or so you can join them.
                 </p>
             </div>
        ) : (
            <div className="space-y-6">
                <div className="bg-gray-900 p-4 rounded text-center">
                    <div className="text-sm text-gray-400 mb-1">Your ID</div>
                    <div className="text-xl font-mono text-yellow-400 select-all break-all">{myPeerId}</div>
                    <div className="text-xs text-gray-500 mt-1">Share this with your friend</div>
                </div>

                <div className="border-t border-gray-700 pt-6">
                    <label className="block text-sm font-medium mb-2">Join Friend</label>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={targetId}
                            onChange={(e) => setTargetId(e.target.value)}
                            placeholder="Enter their ID"
                            className="flex-1 bg-gray-700 rounded px-3 py-2 font-mono text-sm"
                        />
                        <button 
                            onClick={handleJoin}
                            disabled={!targetId}
                            className="bg-green-600 hover:bg-green-500 px-4 rounded font-bold disabled:opacity-50"
                        >
                            Join
                        </button>
                    </div>
                </div>
                
                 {status === 'connecting' && (
                    <div className="text-center text-yellow-400 animate-pulse">Connecting...</div>
                )}
            </div>
        )}
        
        <div className="mt-8 border-t border-gray-700 pt-4">
             <button 
                onClick={() => setShowLogs(!showLogs)}
                className="text-xs text-gray-400 underline"
             >
                 {showLogs ? 'Hide Logs' : 'Show Logs'}
             </button>
             {showLogs && (
                 <div className="mt-2 h-32 overflow-y-auto bg-black p-2 text-xs font-mono text-gray-300 rounded">
                     {logs.map((l, i) => (
                         <div key={i}>[{new Date(l.timestamp).toLocaleTimeString()}] {l.message}</div>
                     ))}
                 </div>
             )}
        </div>
      </div>
    </div>
  );
}
