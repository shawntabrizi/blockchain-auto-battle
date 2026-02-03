# Agent Instructions: Claude

As an AI assistant working on the Auto Battle project, you must adhere to the standards defined in the `agents/` directory.

## Core Directives
1. **Context First**: Before suggesting changes, read `CONTEXT.md` and `ARCHITECTURE.md`.
2. **Technical Standards**:
   - Refer to `agents/POLKADOT_API.md` for all frontend-to-chain interactions.
   - Refer to `agents/SUBSTRATE.md` for any pallet modifications.
   - Refer to `agents/REACT.md` for frontend components and state management.
3. **Idiomatic Code**: Follow the established Rust (core/pallet) and TypeScript (web) patterns.
4. **Safety**: Ensure all on-chain types are bounded and extrinsic arguments are correctly formatted.

## Workflow
- Always verify WASM compatibility when changing `core/`.
- Maintain the visual style established in `web/src/index.css`.
