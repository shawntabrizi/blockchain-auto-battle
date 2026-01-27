import { create } from 'zustand';
import { createClient } from '@polkadot-api/client';
import { getInjectedExtensions, connectInjectedExtension } from '@polkadot-api/pjs-signer';
import { auto_battle } from '@polkadot-api/descriptors';
import { withPolkadotSdkCompat } from '@polkadot-api/polkadot-sdk-compat';
import { getWsProvider } from '@polkadot-api/ws-provider';
import { useGameStore } from './gameStore';

interface BlockchainStore {
  client: any;
  api: any;
  accounts: any[];
  selectedAccount: any | null;
  isConnected: boolean;
  isConnecting: boolean;
  chainState: any | null;
  
  connect: () => Promise<void>;
  selectAccount: (account: any) => void;
  startGame: () => Promise<void>;
  refreshGameState: () => Promise<void>;
  submitTurnOnChain: () => Promise<void>;
}

export const useBlockchainStore = create<BlockchainStore>((set, get) => ({
  client: null,
  api: null,
  accounts: [],
  selectedAccount: null,
  isConnected: false,
  isConnecting: false,
  chainState: null,

  connect: async () => {
    set({ isConnecting: true });
    try {
      const client = createClient(
        withPolkadotSdkCompat(
          getWsProvider('ws://127.0.0.1:9944')
        )
      );
      
      const api = client.getTypedApi(auto_battle as any);
      
      const extensions = getInjectedExtensions();
      if (!extensions || extensions.length === 0) {
        alert("Please install a Polkadot extension (e.g. Talisman, Polkadot.js)");
        set({ isConnecting: false });
        return;
      }
      
      const pjs = await connectInjectedExtension(extensions[0], {
        developerAccounts: true,
      });
      const accounts = pjs.getAccounts();

      set({ 
        client, 
        api, 
        accounts, 
        selectedAccount: accounts[0] || null,
        isConnected: true, 
        isConnecting: false 
      });
      
      if (accounts[0]) {
        await get().refreshGameState();
      }
    } catch (err) {
      console.error("Blockchain connection failed:", err);
      set({ isConnecting: false });
    }
  },

  selectAccount: (account) => {
    set({ selectedAccount: account });
    get().refreshGameState();
  },

  refreshGameState: async () => {
    const { api, selectedAccount } = get();
    if (!api || !selectedAccount) return;

    try {
      const game = await api.query.AutoBattle.ActiveGame.getValue(selectedAccount.address);
      set({ chainState: game });
      
      if (game) {
        // Sync local WASM engine with chain state
        const { engine } = useGameStore.getState();
        if (engine) {
          // Convert bounded state back to core state (this might need helper)
          // For now, we assume the engine can handle it if we pass it correctly
          // engine.set_state(game.state); 
        }
      }
    } catch (err) {
      console.error("Failed to fetch game state:", err);
    }
  },

  startGame: async () => {
    const { api, selectedAccount } = get();
    if (!api || !selectedAccount) return;

    try {
      // Use current time as seed or something similar
      const seed = BigInt(Math.floor(Date.now() / 1000));
      const tx = api.tx.AutoBattle.start_game({ seed });
      
      await tx.signAndSubmit(selectedAccount.polkadotSigner);
      await get().refreshGameState();
    } catch (err) {
      console.error("Start game failed:", err);
    }
  },

  submitTurnOnChain: async () => {
    const { api, selectedAccount } = get();
    const { engine } = useGameStore.getState();
    if (!api || !selectedAccount || !engine) return;

    try {
      const action = engine.get_commit_action();
      const tx = api.tx.AutoBattle.submit_shop_phase({ action });
      
      await tx.signAndSubmit(selectedAccount.polkadotSigner);
      await get().refreshGameState();
      
      // After submission, we might need to report battle outcome
      // For now, assume it's done or triggered manually
    } catch (err) {
      console.error("Submit turn failed:", err);
    }
  }
}));
