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
# Ton ebenfalls in Abschnitten (ein Durchlauf über alle Bilder läuft bei schweren Szenen in Zeitgrenzen)
: > "$dir/alist.txt"
for ((s=0; s<total; s+=size)); do
  e=$((s+size-1)); [ $e -ge $total ] && e=$((total-1))
  a="$dir/audio-$(printf %05d $s).wav"
  if [ ! -s "$a.done" ]; then
    npx remotion render "$comp" "$a" --frames=$s-$e --codec=wav --timeout=180000 "${B[@]}" 2>&1 | tr '\r' '\n' | grep -E "rror" | tail -1 || true
    if [ ! -s "$a" ]; then  # Fallback (13.11.2026): Abschnitt halbieren, eine Seite gleichzeitig, längere Zeitgrenze
      m=$(((s+e)/2)); : > "$a.parts"
      for r in "$s-$m" "$((m+1))-$e"; do
        npx remotion render "$comp" "$dir/apart-$r.wav" --frames=$r --codec=wav --timeout=300000 --concurrency=1 "${B[@]}" >/dev/null 2>&1 || true
        echo "file 'apart-$r.wav'" >> "$a.parts"
      done
      ffmpeg -hide_banner -y -f concat -safe 0 -i "$a.parts" -c copy "$a" >/dev/null 2>&1 || true
    fi
    [ -s "$a" ] && echo ok > "$a.done" || { echo "TON-FEHLER $s-$e"; exit 1; }
  fi
  echo "file '$(basename "$a")'" >> "$dir/alist.txt"
  echo "TON $e/$((total-1)) fertig"
done
[ -s "$dir/audio.wav" ] || ffmpeg -hide_banner -y -f concat -safe 0 -i "$dir/alist.txt" -c copy "$dir/audio.wav" 2>&1 | tail -1
ffmpeg -hide_banner -y -f concat -safe 0 -i "$dir/list.txt" -i "$dir/audio.wav" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k "$out" 2>&1 | tail -1
echo "FERTIG $out"
