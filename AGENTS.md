# Agent Instructions: ChatGPT Codex

When assisting with the Auto Battle codebase, follow these specialized instructions to ensure compatibility with our complex tech stack.

## Technical Framework
Detailed best practices are located in the `agents/` directory:
- **Polkadot API**: See `agents/POLKADOT_API.md` for variant formatting and Binary data rules.
- **Substrate**: See `agents/SUBSTRATE.md` for pallet patterns and storage best practices.
- **React**: See `agents/REACT.md` for Zustand store patterns and component styles.

## Key Requirements
- **WASM Bridge**: The project relies on a SCALE-encoded bridge between the Substrate chain and the browser WASM engine. Any changes to data structures must be reflected in both `core/` and the frontend formatting logic.
- **Named Arguments**: Never use positional arguments for extrinsics.
- **Bounded Complexity**: Respect the limits defined in the Pallet's `Config`.
