#!/usr/bin/env python3
"""Find Instagram accounts you follow that don't follow you back.

Uses your official Instagram data export (JSON). No login or scraping.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any, Iterable


def _usernames_from_entries(entries: Iterable[Any]) -> dict[str, str]:
    """Map lowercase username -> display username from relationship entries."""
    result: dict[str, str] = {}
    for entry in entries:
        if not isinstance(entry, dict):
            continue
        string_list = entry.get("string_list_data") or []
        if not string_list:
            continue
        first = string_list[0]
        if not isinstance(first, dict):
            continue
        value = first.get("value") or ""
        if not value and first.get("href"):
            href = str(first["href"]).rstrip("/")
            value = href.rsplit("/", 1)[-1]
        if not value:
            continue
        username = str(value).lstrip("@")
        key = username.lower()
        result.setdefault(key, username)
    return result


def _extract_relationship_list(data: Any, preferred_keys: tuple[str, ...]) -> list[Any]:
    if isinstance(data, list):
        return data
    if isinstance(data, dict):
        for key in preferred_keys:
            if key in data and isinstance(data[key], list):
                return data[key]
        for value in data.values():
            if isinstance(value, list):
                return value
    raise ValueError("Unrecognized Instagram export JSON structure")


def load_usernames(path: Path, preferred_keys: tuple[str, ...]) -> dict[str, str]:
    try:
        with path.open(encoding="utf-8") as f:
            data = json.load(f)
    except json.JSONDecodeError as exc:
        raise ValueError(
            f"{path.name} is not valid JSON. Re-download your Instagram data "
            "and choose JSON (not HTML)."
        ) from exc
    entries = _extract_relationship_list(data, preferred_keys)
    return _usernames_from_entries(entries)


def find_followers_and_following_dir(export_path: Path) -> Path:
    export_path = export_path.expanduser().resolve()
    if not export_path.exists():
        raise FileNotFoundError(f"Path not found: {export_path}")

    if export_path.is_file():
        raise ValueError(
            f"Expected a folder, got a file: {export_path}. "
            "Point to your unzipped Instagram export (or the "
            "followers_and_following folder inside it)."
        )

    if (export_path / "following.json").exists():
        return export_path

    candidates = [
        export_path / "connections" / "followers_and_following",
        export_path / "followers_and_following",
    ]
    for candidate in candidates:
        if (candidate / "following.json").exists():
            return candidate

    matches = list(export_path.rglob("following.json"))
    if len(matches) == 1:
        return matches[0].parent
    if len(matches) > 1:
        raise ValueError(
            "Found multiple following.json files. Pass the path to the "
            "followers_and_following folder specifically."
        )

    html_hint = ""
    if list(export_path.rglob("followers*.html")) or list(
        export_path.rglob("following.html")
    ):
        html_hint = (
            " This looks like an HTML export — request a new download in JSON format."
        )
    raise FileNotFoundError(
        "Could not find following.json under "
        f"{export_path}.{html_hint} Unzip your Instagram data export and try again."
    )


def load_following(directory: Path) -> dict[str, str]:
    path = directory / "following.json"
    if not path.exists():
        raise FileNotFoundError(f"Missing {path}")
    return load_usernames(path, ("relationships_following",))


def load_followers(directory: Path) -> dict[str, str]:
    paths = sorted(directory.glob("followers*.json"))
    if not paths:
        raise FileNotFoundError(
            f"No followers*.json files found in {directory}. "
            "Make sure Followers and following was included in your export."
        )
    combined: dict[str, str] = {}
    for path in paths:
        combined.update(
            load_usernames(path, ("relationships_followers", "relationships_follower"))
        )
    return combined


def not_following_back(
    following: dict[str, str], followers: dict[str, str]
) -> list[str]:
    missing = [following[k] for k in following if k not in followers]
    return sorted(missing, key=str.lower)


def prompt(text: str) -> str:
    try:
        return input(text).strip()
    except EOFError as exc:
        raise SystemExit("Cancelled.") from exc


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description=(
            "List Instagram users you follow who don't follow you back, "
            "using your official Instagram data export (JSON)."
        )
    )
    parser.add_argument(
        "--handle",
        help="Your Instagram username (for labels / default output filename)",
    )
    parser.add_argument(
        "--export",
        help="Path to unzipped Instagram export or followers_and_following folder",
    )
    parser.add_argument(
        "--out",
        help="Write results to this file (one username per line)",
    )
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)

    handle = (args.handle or prompt("Instagram handle: ")).lstrip("@")
    if not handle:
        print("Handle is required.", file=sys.stderr)
        return 1

    export = args.export or prompt(
        "Path to unzipped Instagram data export: "
    )
    if not export:
        print("Export path is required.", file=sys.stderr)
        return 1

    try:
        directory = find_followers_and_following_dir(Path(export))
        following = load_following(directory)
        followers = load_followers(directory)
    except (OSError, ValueError) as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1

    if not following:
        print("No following entries found in the export.", file=sys.stderr)
        return 1

    results = not_following_back(following, followers)

    print(f"@{handle}: {len(results)} account(s) you follow who don't follow back")
    print(f"(following={len(following)}, followers={len(followers)})")
    print()
    for username in results:
        print(username)

    out_path = args.out
    if out_path is None and sys.stdin.isatty():
        answer = prompt("\nSave results to a file? [y/N] ").lower()
        if answer in {"y", "yes"}:
            out_path = f"@{handle}-not-following-back.txt"

    if out_path:
        path = Path(out_path).expanduser()
        path.write_text("\n".join(results) + ("\n" if results else ""), encoding="utf-8")
        print(f"\nWrote {len(results)} handle(s) to {path}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
