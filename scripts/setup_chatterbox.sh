#!/usr/bin/env bash
# Einmalig: eigene Python-Umgebung für Chatterbox (scripts/tts_chatterbox.py).
# PyTorch kommt aus PyPI (download.pytorch.org ist in der Cloud-Umgebung gesperrt); Modell beim ersten Lauf
# von huggingface.co (ResembleAI/chatterbox, ca. 3 GB). setuptools<81: resemble-perth importiert pkg_resources.
set -euo pipefail
cd "$(dirname "$0")/.."
python3 -m venv .venv-cb
.venv-cb/bin/pip install -q "chatterbox-tts==0.1.7" "setuptools<81"
.venv-cb/bin/python -W ignore -c "import chatterbox, perth; perth.PerthImplicitWatermarker; print('Chatterbox bereit')"
