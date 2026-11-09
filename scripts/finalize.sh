#!/usr/bin/env bash
# Upload-fertige Datei für YouTube Shorts / TikTok: Lautheit normalisieren und Bild nach BT.709
# (begrenzter Bereich, yuv420p) umwandeln – Remotion liefert yuvj420p/BT.470 (Vollbereich),
# was Plattformen leicht farbverschoben zeigen können. +faststart für schnelles Abspielen.
#   scripts/finalize.sh out/solar-system-raw.mp4 out/solar-system.mp4
# Ziel: -14 LUFS integriert, True Peak max. -1 dBTP (zweistufiges loudnorm von ffmpeg).
set -euo pipefail
in="$1"; out="$2"
stats=$(ffmpeg -hide_banner -i "$in" -af loudnorm=I=-14:TP=-1:LRA=11:print_format=json -vn -f null - 2>&1 | sed -n '/^{/,/^}/p')
get() { echo "$stats" | grep "\"$1\"" | sed -E 's/.*: "([^"]+)".*/\1/'; }
ffmpeg -hide_banner -loglevel error -y -i "$in" -vf "scale=in_range=full:out_range=tv:out_color_matrix=bt709,format=yuv420p" \
  -c:v libx264 -profile:v high -level 4.2 -preset slow -crf 17 -r 30 -g 60 \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 -color_range tv -movflags +faststart \
  -c:a aac -b:a 192k -ar 48000 \
  -af "loudnorm=I=-14:TP=-1:LRA=11:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true" \
  "$out"
echo "Fertig: $out"
