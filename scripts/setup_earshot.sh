#!/usr/bin/env bash
# Einmalig: earshot (https://github.com/Leonxlnx/earshot, MIT) – lässt Claude Audio „hören“ (beschreiben, messen,
# Sync zum Bild, Kritik). Eigene venv; PyTorch aus PyPI (download.pytorch.org ist gesperrt). Version fest auf Commit
# 4ac3d2a (geprüft mit SkillSpector am 12.11.2026, Kern-Skill 0 Befunde). Modelle (CLAP, AST) lädt earshot beim ersten
# Lauf von huggingface.co.
set -euo pipefail
cd "$(dirname "$0")/.."
python3 -m venv .venv-earshot
# Speicher sparen: PyTorch/transformers aus .venv-cb (Chatterbox) mitbenutzen statt ein zweites Mal (~5 GB) zu laden
if [ -d .venv-cb ]; then
  SP=$(ls -d .venv-earshot/lib/python3*/site-packages); CB=$(cd .venv-cb/lib/python3*/site-packages && pwd)
  echo "$CB" > "$SP/zz-venv-cb.pth"
fi
.venv-earshot/bin/pip install -q --no-cache-dir "earshot[mcp] @ git+https://github.com/Leonxlnx/earshot@4ac3d2ac2b151e1c23376f9ce7f3047a17050013"
.venv-earshot/bin/python -m earshot doctor || true
echo "earshot bereit: .venv-earshot/bin/python -m earshot"
