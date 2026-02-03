# React & Web Frontend Best Practices

The frontend is a React application built with Vite and Tailwind CSS.

## State Management
- **Zustand**: Primary state management.
  - `gameStore.ts`: Local game state, WASM engine instance, and UI states (modals, selections).
  - `blockchainStore.ts`: Wallet connection, account management, and on-chain syncing.
- **WASM Bridge**: The `gameStore` initializes the `GameEngine`. All heavy game logic is delegated to the WASM module.

## UI/UX
- **Tailwind CSS**: Use utility classes for styling. Follow the "monospace/retro-tech" aesthetic established in the `BlockchainPage` and `Arena` components.
- **Component Structure**:
  - `Arena.tsx`: Main game board rendering.
  - `Shop.tsx`: Card purchasing and turn preparation.
  - `UnitCard.tsx`: Reusable card component with drag-and-drop support.
- **Feedback**: Use `react-hot-toast` for transaction feedback and validation errors.

## Patterns
- **Drag and Drop**: Native HTML5 DnD is used for placing cards on the board.
- **Asset Handling**: Centralize emoji mappings in `utils/emoji.ts` for consistent unit representation.
