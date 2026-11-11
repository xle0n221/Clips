#!/usr/bin/env bash
# NVIDIA SkillSpector (Apache-2.0, https://github.com/NVIDIA/SkillSpector) – Sicherheits-Scanner für Agent-Skills.
# Eigene Umgebung .venv-skillspector, gepinnt auf einen geprüften Commit (Lieferketten-Schutz).
# Nutzung danach: Skill /skillspector (.claude/skills/skillspector/SKILL.md).
# Hinweis: installiert Fremdcode aus GitHub – nur mit Freigabe des Nutzers ausführen.
set -euo pipefail
cd "$(dirname "$0")/.."
REV="${SKILLSPECTOR_REV:-ece5dbcaabc4b41eb539a41fba285c4e7762e3d0}"  # Stand 11.11.2026, Version 2.12.0 (pyproject.toml)
python3 -m venv .venv-skillspector
.venv-skillspector/bin/pip install -q --upgrade pip
.venv-skillspector/bin/pip install -q "skillspector @ git+https://github.com/NVIDIA/skillspector.git@${REV}"
.venv-skillspector/bin/skillspector --help | head -3
echo "SkillSpector bereit: .venv-skillspector/bin/skillspector"
