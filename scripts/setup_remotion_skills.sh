#!/usr/bin/env bash
# Offizielle Remotion-Agent-Skills (github.com/remotion-dev/skills) lokal nach .claude/skills laden.
# Geprüft mit /skillspector am 13.11.2026 (Commit 7e541aa): captions/multimedia/render SAFE (≤ 12/100);
# best-practices 100/100 nur durch Fehlalarme (Mapbox-Token-Erwähnung in Doku, abgeschnittene Verweise) – reine Doku, keine Skripte.
# Keine Lizenzdatei im Repo → nicht ins eigene Repo kopieren (siehe .gitignore), nur lokal nutzen.
set -euo pipefail
cd "$(dirname "$0")/.."
tmp=$(mktemp -d)
GIT_LFS_SKIP_SMUDGE=1 git clone -q --depth 1 https://github.com/remotion-dev/skills "$tmp/skills"
for d in remotion-best-practices remotion-captions remotion-multimedia remotion-render; do
  rm -rf ".claude/skills/$d"; cp -r "$tmp/skills/skills/$d" ".claude/skills/$d"; rm -rf ".claude/skills/$d/agents"
done
rm -rf "$tmp"; echo "Remotion-Skills bereit"
