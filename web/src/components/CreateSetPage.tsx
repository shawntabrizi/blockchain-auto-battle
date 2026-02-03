import React, { useEffect, useState } from 'react';
import { useBlockchainStore } from '../store/blockchainStore';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export const CreateSetPage: React.FC = () => {
  const {
    isConnected,
    connect,
    allCards,
    fetchCards,
    createCardSet
  } = useBlockchainStore();

  const [selectedCards, setSelectedCards] = useState<{ card_id: number, rarity: number }[]>([]);
  const [isCreatingSet, setIsCreatingSet] = useState(false);

  useEffect(() => {
    if (isConnected) {
      fetchCards();
    }
  }, [isConnected, fetchCards]);

  const toggleCardSelection = (cardId: number) => {
    setSelectedCards(prev => {
      const exists = prev.find(c => c.card_id === cardId);
      if (exists) {
        return prev.filter(c => c.card_id !== cardId);
      } else {
        return [...prev, { card_id: cardId, rarity: 100 }]; // Default rarity 100
      }
    });
  };

  const handleCreateSet = async () => {
    if (selectedCards.length === 0) {
      toast.error('Select at least one card');
      return;
    }

    setIsCreatingSet(true);
    try {
      await createCardSet(selectedCards);
      toast.success('Card set created successfully!');
      setSelectedCards([]);
    } catch (err) {
      toast.error('Failed to create card set');
    } finally {
      setIsCreatingSet(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-white">
        <h1 className="text-4xl font-black mb-8 italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-600 uppercase">
          Set Creator
        </h1>
        <button
          onClick={connect}
          className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold py-4 px-8 rounded-full transition-all transform hover:scale-105"
        >
          CONNECT WALLET TO START
        </button>
        <Link to="/blockchain" className="mt-8 text-slate-400 hover:text-white underline">Back to Blockchain</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter text-yellow-500 uppercase">
              Blockchain Set Creator
            </h1>
            <p className="text-slate-500 text-sm">Bundle cards into playable sets</p>
          </div>
          <div className="flex gap-4">
            <Link to="/blockchain/create-card" className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 px-4 py-2 rounded-lg transition-colors font-bold flex items-center gap-2">
              <span className="text-xl">+</span> MINT NEW CARDS
            </Link>
            <Link to="/blockchain" className="text-slate-400 hover:text-white border border-slate-800 px-4 py-2 rounded-lg transition-colors flex items-center">
              Exit to Dashboard
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-12">
          {/* Main Area: Build Set */}
          <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-8 backdrop-blur-sm flex flex-col">
            <h2 className="text-xl font-bold mb-6 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="text-yellow-500">01</span> Assemble Set
              </span>
              <span className="text-xs bg-yellow-500/10 text-yellow-500 px-3 py-1.5 rounded-full font-bold">
                {selectedCards.length} CARDS SELECTED
              </span>
            </h2>

            <div className="flex-1 overflow-y-auto max-h-[600px] mb-8 pr-2 custom-scrollbar">
              <div className="space-y-8">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {allCards.map(card => {
                    const isSelected = selectedCards.some(c => c.card_id === card.id);
                    return (
                      <div
                        key={card.id}
                        onClick={() => toggleCardSelection(card.id)}
                        className={`
                          relative group cursor-pointer p-4 rounded-xl border-2 transition-all
                          ${isSelected ? 'bg-yellow-500/10 border-yellow-500 scale-[1.02]' : 'bg-slate-800 border-white/5 hover:border-white/20'}
                        `}
                      >
                        <div className="text-3xl mb-2 text-center">{card.metadata.emoji}</div>
                        <div className="text-xs font-bold text-center truncate uppercase opacity-90">{card.metadata.name}</div>
                        <div className="flex justify-between mt-3 text-xs font-mono opacity-60">
                          <span>{card.data.stats.attack}⚔️</span>
                          <span>{card.data.stats.health}❤️</span>
                        </div>

                        {isSelected && (
                          <div className="absolute -top-2 -right-2 bg-yellow-500 text-slate-950 rounded-full p-1 shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {allCards.length === 0 && (
                    <div className="col-span-full py-20 text-center text-slate-600 italic">
                      No cards found on-chain. Go create some first!
                    </div>
                  )}
                </div>

                {selectedCards.length > 0 && (
                  <div className="mt-8 border-t border-white/5 pt-8">
                    <h3 className="text-sm font-bold text-slate-400 uppercase mb-6 tracking-widest">Configure Rarity Weights</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {selectedCards.map(sc => {
                        const card = allCards.find(c => c.id === sc.card_id);
                        if (!card) return null;
                        return (
                          <div key={sc.card_id} className="flex items-center justify-between bg-slate-800/50 p-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{card.metadata.emoji}</span>
                              <span className="text-xs font-bold truncate max-w-[120px]">{card.metadata.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <label className="text-[10px] text-slate-500 uppercase font-black">Weight</label>
                              <input
                                type="number"
                                value={sc.rarity}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  setSelectedCards(prev => prev.map(c => c.card_id === sc.card_id ? { ...c, rarity: val } : c));
                                }}
                                className="w-16 bg-slate-900 border border-white/10 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-yellow-500/50 text-center font-bold"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleCreateSet}
                disabled={isCreatingSet || selectedCards.length === 0}
                className="w-full max-w-md bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black py-4 rounded-2xl transition-all disabled:opacity-50 shadow-xl shadow-yellow-500/10 uppercase tracking-widest text-lg"
              >
                {isCreatingSet ? 'CREATING SET...' : 'FINALIZE & DEPLOY SET'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};
