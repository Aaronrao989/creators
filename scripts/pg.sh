#!/usr/bin/env bash
# Local dev Postgres control (real PG binary via embedded-postgres).
# Starts a DETACHED daemon that survives shell/session exit — unlike a node
# babysitter process. Data lives in ./.pgdata (gitignored), port 5433.
#
#   ./scripts/pg.sh up      # start (idempotent)
#   ./scripts/pg.sh down    # stop
#   ./scripts/pg.sh status  # is it listening?
set -euo pipefail
cd "$(dirname "$0")/.."

PGBIN="node_modules/@embedded-postgres/darwin-arm64/native/bin"
DATADIR="./.pgdata"
PORT=5433

case "${1:-up}" in
  up)
    if nc -z localhost "$PORT" 2>/dev/null; then
      echo "Postgres already up on port $PORT"; exit 0
    fi
    if [ ! -f "$DATADIR/PG_VERSION" ]; then
      echo "No data dir — run 'npm run db:seed' after first start"; exit 1
    fi
    "$PGBIN/pg_ctl" -D "$DATADIR" -l "$DATADIR/server.log" -o "-p $PORT" start
    echo "Postgres up on postgresql://postgres:postgres@localhost:$PORT/creators"
    ;;
  down)
    "$PGBIN/pg_ctl" -D "$DATADIR" stop || true
    ;;
  status)
    nc -z localhost "$PORT" && echo "UP (port $PORT)" || echo "DOWN"
    ;;
  *)
    echo "usage: $0 {up|down|status}"; exit 1 ;;
esac
