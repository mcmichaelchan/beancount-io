#!/usr/bin/env bash
set -euo pipefail
umask 077
cd "$(dirname "$0")"
compose=(docker compose --env-file .env -f ../docker/docker-compose.yml -f compose.override.yml)
destination="${1:-/data/backups/family-ledger}"
mkdir -p "$destination"
mapfile -t volumes < <(docker volume ls -q --filter label=com.docker.compose.project=family-ledger)
if ((${#volumes[@]} == 0)); then
  echo "No family-ledger volumes found" >&2
  exit 1
fi
snapshot="$(mktemp -d "$destination/.snapshot.XXXXXX")"
trap '"${compose[@]}" up -d >/dev/null 2>&1' EXIT
"${compose[@]}" stop >/dev/null 2>&1
cp .env "$snapshot/environment.env"
git -C ../.. rev-parse HEAD > "$snapshot/source-revision.txt"
for volume in "${volumes[@]}"; do
  mountpoint="$(docker volume inspect "$volume" --format '{{.Mountpoint}}')"
  tar -czf "$snapshot/$volume.tgz" -C "$mountpoint" .
done
"${compose[@]}" images --format json > "$snapshot/images.json"
archive="$destination/family-ledger-$(date -u +%Y%m%dT%H%M%SZ).tgz"
tar -czf "$archive" -C "$snapshot" .
tar -tzf "$archive" >/dev/null
rm -rf "$snapshot"
printf 'Coordinated backup created: %s\n' "$archive"
