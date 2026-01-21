# Manalimit Build Guide

## Prerequisites

- **Rust** (latest stable): https://rustup.rs/
- **wasm-pack**: `cargo install wasm-pack`
- **Node.js** (v18+): https://nodejs.org/
- **npm** (comes with Node.js)

## Project Structure

```
/auto-battle
├── core/                    # Rust WASM core (game logic)
│   ├── Cargo.toml
│   ├── src/
│   │   ├── lib.rs          # WASM entry point
│   │   ├── types.rs        # Card and unit types
│   │   ├── state.rs        # Game state
│   │   ├── engine.rs       # Game engine (wasm_bindgen)
│   │   ├── view.rs         # Serialization for React
│   │   ├── battle.rs       # Combat simulation
│   │   ├── opponents.rs    # Pre-made AI opponents
│   │   └── tests.rs        # Unit tests
│   └── pkg/                # Built WASM package (generated)
│
├── web/                    # React frontend
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── src/
│   │   ├── wasm/           # WASM package (copied from core/pkg)
│   │   ├── store/          # Zustand state management
│   │   └── components/     # React components
│   └── public/
│
└── BUILD.md                # This file
```

## Initial Setup

### 1. Install Rust Dependencies

```bash
# Install wasm-pack if not already installed
cargo install wasm-pack
```

### 2. Build WASM Core

```bash
cd core
wasm-pack build --target web
```

This generates the `core/pkg/` folder with:
- `manalimit_core.js` - JavaScript bindings
- `manalimit_core_bg.wasm` - WebAssembly binary
- `manalimit_core.d.ts` - TypeScript definitions

### 3. Copy WASM to Web

```bash
cd ../web
cp -r ../core/pkg src/wasm
```

### 4. Install Node Dependencies

```bash
npm install
```

## Development

### Running the Dev Server

```bash
cd web
npm run dev
```

Open http://localhost:5173 in your browser.

### Rebuilding WASM After Rust Changes

After modifying any Rust code in `core/src/`:

```bash
# From project root
cd core
wasm-pack build --target web
cp -r pkg ../web/src/wasm
```

Or as a one-liner from project root:

```bash
cd core && wasm-pack build --target web && cp -r pkg ../web/src/wasm
```

### Running Rust Tests

```bash
cd core
cargo test
```

### TypeScript Type Checking

```bash
cd web
npx tsc --noEmit
```

## Production Build

### 1. Build Optimized WASM

```bash
cd core
wasm-pack build --target web --release
cp -r pkg ../web/src/wasm
```

### 2. Build React App

```bash
cd web
npm run build
```

The production build will be in `web/dist/`.

### 3. Preview Production Build

```bash
cd web
npm run preview
```

## Troubleshooting

### WASM MIME Type Error

If you see `Response has unsupported MIME type '' expected 'application/wasm'`:

- Ensure WASM files are in `web/src/wasm/` (not just public folder)
- The JS bindings and WASM binary must be in the same directory

### Memory Corruption / "unreachable executed"

This usually means the JS bindings and WASM binary are mismatched:

```bash
# Re-copy the entire pkg folder
cp -r ../core/pkg src/wasm
```

### TypeScript Errors with WASM Imports

The type definitions are in `web/src/vite-env.d.ts`. Update them if you add new WASM exports.

## Architecture Notes

### WASM-First Design

- **Rust** handles all game logic, state, and validation
- **React** is purely a view layer - it renders state and sends actions
- State flows: `User Action → React → WASM → New State → React Render`

### State Management

- `GameEngine` (Rust) holds the authoritative game state
- `useGameStore` (Zustand) bridges WASM to React
- React components never calculate game logic directly

### Deterministic Combat

- Combat is fully deterministic (seeded RNG for tie-breakers)
- Same inputs always produce same outputs
- Enables replay and debugging

## Key Files

| File | Purpose |
|------|---------|
| `core/src/engine.rs` | Main game engine with all actions |
| `core/src/battle.rs` | Combat simulation |
| `core/src/state.rs` | Game state structure |
| `web/src/store/gameStore.ts` | WASM-React bridge |
| `web/src/components/GameLayout.tsx` | Main UI layout |
| `web/vite.config.ts` | Vite + WASM configuration |
