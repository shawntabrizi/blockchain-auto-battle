# Polkadot API (PAPI) Best Practices

This project uses the modern `polkadot-api` (PAPI) library for blockchain interactions.

## Core Principles
- **Typed Descriptors**: Always use `@polkadot-api/descriptors` for type-safe interactions.
- **Binary Data**: Use the `Binary` utility for all `BoundedVec<u8>` or `Vec<u8>` fields.
  - `Binary.fromText("string")` for readable text.
  - `Binary.fromHex("0x...")` for hex data.
- **Extrinsic Arguments**:
  - Always pass arguments as a single named object: `api.tx.PalletName.call_name({ arg1, arg2 })`.
- **SCALE Encoding Formatting**:
  - **Variants (Enums)**: Rust enums with data must be formatted as `{ type: 'VariantName', value: { ...data } }`.
  - **Simple Variants**: Enums without data should be `{ type: 'VariantName' }`.
  - **Option Types**: Use `undefined` for `None` and the raw value for `Some`.

## Store Integration (Zustand)
- Connection logic resides in `blockchainStore.ts`.
- Use `getTypedCodecs` for manual SCALE decoding when syncing with WASM.
- Throttle chain state refreshes to avoid UI lag.
