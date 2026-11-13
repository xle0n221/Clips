#!/usr/bin/env bash
# Render in Abschnitten (übersteht Container-Neustarts): fertige Abschnitte werden übersprungen.
# Aufruf: scripts/render_chunks.sh <Komposition> <Ausgabe.mp4> [Abschnittsgröße]
set -euo pipefail
cd "$(dirname "$0")/.."
comp=$1; out=$2; size=${3:-500}
dir="out/chunks-$(basename "$out" .mp4)"; mkdir -p "$dir"
B=(--browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell --gl=swangle)
total=$(npx remotion compositions src/index.ts "${B[@]}" 2>/dev/null | awk -v c="$comp" '$1==c{print $4}')
[ -n "$total" ] || { echo "Komposition $comp nicht gefunden"; exit 1; }
echo "Bilder gesamt: $total"
: > "$dir/list.txt"
for ((s=0; s<total; s+=size)); do
  e=$((s+size-1)); [ $e -ge $total ] && e=$((total-1))
  f="$dir/part-$(printf %05d $s).mp4"
  if [ ! -s "$f.done" ]; then
    npx remotion render "$comp" "$f" --frames=$s-$e --muted --crf=18 "${B[@]}" 2>&1 | tr '\r' '\n' | grep -E "Rendered|rror" | tail -1
    echo ok > "$f.done"
  fi
  echo "file '$(basename "$f")'" >> "$dir/list.txt"
  echo "ABSCHNITT $e/$((total-1)) fertig"
done
[ -s "$dir/audio.wav" ] || npx remotion render "$comp" "$dir/audio.wav" --codec=wav "${B[@]}" >/dev/null 2>&1
ffmpeg -hide_banner -y -f concat -safe 0 -i "$dir/list.txt" -i "$dir/audio.wav" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest "$out" 2>&1 | tail -1
echo "FERTIG $out"
