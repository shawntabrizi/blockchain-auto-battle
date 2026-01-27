#!/bin/bash
set -e

# Build WASM
echo "--- Building WASM ---"
./build-wasm.sh

# Function to cleanup background processes on exit
cleanup() {
    echo "--- Stopping processes ---"
    kill $BLOCKCHAIN_PID $WEB_PID 2>/dev/null
}
trap cleanup EXIT

# Start Blockchain
echo "--- Starting Blockchain ---"
cd blockchain
./start_chain.sh &
BLOCKCHAIN_PID=$!
cd ..

# Start Web App
echo "--- Starting Web App ---"
cd web
npm run dev &
WEB_PID=$!
cd ..

# Wait for background processes
wait $BLOCKCHAIN_PID $WEB_PID
