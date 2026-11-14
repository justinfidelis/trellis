#!/usr/bin/env bash
set -e

echo "Wiping local D1 state..."
rm -rf .wrangler/state

echo "Applying migrations..."
npx wrangler d1 execute trellis-db --local --file=migrations/0001_initial.sql
npx wrangler d1 execute trellis-db --local --file=migrations/0002_seed_admin.sql

echo "Done."
