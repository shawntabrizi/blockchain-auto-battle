#!/bin/bash
set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Building WASM client..."
cd "$SCRIPT_DIR/client"
wasm-pack build --target web
echo "Copying WASM to web/src/wasm..."
rm -rf "$SCRIPT_DIR/web/src/wasm"
cp -r pkg "$SCRIPT_DIR/web/src/wasm"
echo "WASM build complete!"