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
- **Drag and Drop**: Uses `@dnd-kit/core` for placing cards on the board.
- **Asset Handling**: Centralize emoji mappings in `utils/emoji.ts` for consistent unit representation.

## IMPORTANT: DndContext autoScroll Must Be Disabled

All `<DndContext>` components MUST include `autoScroll={false}` to prevent scroll issues on mobile and touch devices. Without this, dragging cards causes unwanted page scrolling.

```tsx
<DndContext
  sensors={sensors}
  modifiers={[restrictToGameLayout]}
  onDragStart={handleDragStart}
  onDragEnd={handleDragEnd}
  autoScroll={false}  // REQUIRED - prevents scroll issues
>
```

**Components using DndContext:**
- `GameLayout.tsx` - main game UI
- `BlockchainPage.tsx` - blockchain game mode

**Rule:** Every `<DndContext>` MUST have `autoScroll={false}`.

## CRITICAL: Preventing WASM Memory Issues with useRef Guards

React's StrictMode (enabled in development) intentionally double-invokes effects to help detect side effects. This causes serious problems with WASM initialization because:

1. The WASM module allocates memory on each call
2. Double-execution leads to memory leaks and corruption
3. These bugs are hard to debug and may only appear intermittently

**Always use `useRef` guards when calling WASM functions in `useEffect`:**

```tsx
import { useEffect, useRef } from 'react';

function MyComponent() {
  const initCalled = useRef(false);

  useEffect(() => {
    if (initCalled.current) return;  // Guard against double-execution
    initCalled.current = true;

    // Now safe to call WASM functions
    startGame();
    initEngine();
  }, [dependencies]);
}
```

**Examples in codebase:**
- `App.tsx` - guards `init()` call
- `SandboxPage.tsx` - guards `init()` call
- `MultiplayerGame.tsx` - guards `init()` call
- `MultiplayerManager.tsx` - guards `startMultiplayerGame()` calls
- `BlockchainPage.tsx` - guards `init()` and `refresh()` calls

**Rule:** Any `useEffect` that calls into the WASM engine (`gameStore` actions like `init`, `startMultiplayerGame`, etc.) MUST have a `useRef` guard to prevent double-execution.
