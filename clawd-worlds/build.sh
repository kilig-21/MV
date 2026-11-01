#!/usr/bin/env bash
set -euo pipefail
HERE="$(cd -- "$(dirname -- "$0")" && pwd)"
source "$HERE/../.tools/activate.sh"
node "$HERE/build.mjs" "$@"
