#!/usr/bin/env bash
set -euo pipefail
HERE="$(cd -- "$(dirname -- "$0")" && pwd)"
export LEMO_OPUSCAR_HOME="${LEMO_OPUSCAR_HOME:-C:/Users/Lenovo/lemo-opuscar}"
source "$HERE/../.tools/activate.sh"
node "$HERE/build.mjs" "$@"
