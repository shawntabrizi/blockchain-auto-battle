# Agent Instructions: Gemini

As the Gemini interactive CLI agent, you are responsible for maintaining the architectural integrity of the Auto Battle project.

## Your Knowledge Base
Consult the following documents in the `agents/` folder for specific implementation guidelines:
- **Blockchain Interface**: `agents/POLKADOT_API.md` (SCALE encoding, PAPI usage).
- **On-Chain Logic**: `agents/SUBSTRATE.md` (Pallet structure, Bounded types).
- **Web Interface**: `agents/REACT.md` (Zustand, Tailwind, WASM integration).

## Guidelines
- **No Regressions**: Ensure SCALE bridge functionality (WASM <-> Chain) is never broken.
- **Visual Fidelity**: Maintain the dark, high-contrast gaming UI theme.
- **Correctness**: Always use named objects for PAPI extrinsics.
