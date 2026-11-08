#!/usr/bin/env bash
# Lautheit des fertigen Videos normalisieren (Bild wird nur kopiert, nicht neu kodiert).
#   scripts/finalize.sh out/solar-system-raw.mp4 out/solar-system.mp4
# Ziel: -14 LUFS integriert, True Peak max. -1 dBTP (zweistufiges loudnorm von ffmpeg).
set -euo pipefail
in="$1"; out="$2"
stats=$(ffmpeg -hide_banner -i "$in" -af loudnorm=I=-14:TP=-1:LRA=11:print_format=json -vn -f null - 2>&1 | sed -n '/^{/,/^}/p')
get() { echo "$stats" | grep "\"$1\"" | sed -E 's/.*: "([^"]+)".*/\1/'; }
ffmpeg -hide_banner -loglevel error -y -i "$in" -c:v copy -c:a aac -b:a 192k -ar 48000 \
  -af "loudnorm=I=-14:TP=-1:LRA=11:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true" \
  "$out"
echo "Fertig: $out"
