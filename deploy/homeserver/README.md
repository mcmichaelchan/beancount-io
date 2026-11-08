# Private family ledger

This target runs the complete stack behind an existing HTTPS reverse proxy on
one origin. It does not need a Beancount.io subscription. Authentication,
ledger permissions, validation and audit logging remain enforced.

`SELF_HOSTED=true` gives server-owned unlimited entitlements through the shared
tier resolver, including API-key creation. `VITE_SELF_HOSTED=true` hides billing
and upgrade UI. These are operator configuration, never request parameters.
Leave both off to preserve upstream hosted behavior. External AI, email and
banking providers are optional and require your own credentials.

## Configuration

Run from this directory. Copy `../docker/.env.example` to `.env`, replace all
placeholder secrets, and generate a production OAuth JWKS as documented there.
Also set:

```dotenv
APP_DOMAIN=ledger.example.com
API_DOMAIN=ledger.example.com
GIT_DOMAIN=ledger.example.com
PUBLIC_HOST=ledger.example.com:26543
LAN_ADDRESS=127.0.0.1
SERVICE_PORT=26543
```

Use the host's LAN address instead of loopback only when a separate trusted
reverse proxy must reach it. That proxy must terminate HTTPS and preserve the
public host and port. Keep this HTTP origin off the public network.

```sh
docker compose --env-file .env -f ../docker/docker-compose.yml -f compose.override.yml config --quiet
docker compose --env-file .env -f ../docker/docker-compose.yml -f compose.override.yml up -d --build
```

The application, API, OAuth discovery and authenticated Git proxy share
`https://<PUBLIC_HOST>`. Gitea and all databases remain internal. Do not expose
Gitea directly. Public Git uses `/git/<owner>/<ledger>.git` through backend-v2.

## Backup and recovery

Back up the four `family-ledger_*` data volumes together with the protected
`.env` before upgrades. Follow `../docker/README.md` for coordinated database,
repository and Redis backups. Test restoration before importing real history.
Record the deployed commit and local image IDs. Roll back application images
only when the deployed database schema is compatible; otherwise restore the
coordinated backup. Never run `down -v` against a ledger you want to retain.

`bash backup.sh` creates a coordinated offline archive under
`/data/backups/family-ledger`, including the protected environment, all four
volumes and the source/image revisions. It stops only this stack and restarts
it on exit. The archive contains secrets; retain its restrictive permissions.
TLS certificates stay on the existing reverse proxy and are backed up there.

## Verification

Check dashboard, `/healthz`, OAuth discovery, and authenticated API-key creation.
Create a synthetic ledger over 1,000 directives; verify balanced API writes and
refusal of an unbalanced write. Test two accounts on the same private ledger,
then remove the synthetic fixture. Test the HTTPS endpoint separately through
the LAN reverse proxy and the public relay.
