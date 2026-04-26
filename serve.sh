#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/web"
PORT="${PORT:-5173}"
echo "Tramo PM dev server: http://localhost:${PORT}"
exec python3 -m http.server "${PORT}"
