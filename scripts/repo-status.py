"""Erzeugt den Repo-Stand für das Dashboard (Dokument meta/repo).

  python3 scripts/repo-status.py > out/repo-status.json

Danach schreibt die Sitzung die Datei per ArtifactData (`set`, collection "meta", doc_id "repo",
file_path out/repo-status.json, if_version = zuletzt gelesene Version). Ablauf: docs/agenten-team.md.
Inhalt: letzter Commit, Branch, Zeit und die letzten Commit-Betreffzeilen als „Verbesserungen“.
"""

from __future__ import annotations

import json
import subprocess
from datetime import datetime, timezone


def git(*args: str) -> str:
    return subprocess.run(["git", *args], check=True, capture_output=True, text=True).stdout.strip()


def main() -> None:
    log = git("log", "-15", "--no-merges", "--format=%h%x1f%cI%x1f%s")
    changes = []
    for line in log.splitlines():
        sha, date, subject = line.split("\x1f")
        changes.append({"commit": sha, "date": date, "text": subject})
    status = {
        "commit": git("rev-parse", "HEAD"),
        "branch": git("rev-parse", "--abbrev-ref", "HEAD"),
        "updatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "dashboardFileCommit": git("log", "-1", "--format=%H", "--", "dashboard/index.html"),
        "summary": "Wird nach jedem Push automatisch aktualisiert (Sitzung CLIPS).",
        "changes": changes,
    }
    print(json.dumps(status, indent=1, ensure_ascii=False))


if __name__ == "__main__":
    main()
