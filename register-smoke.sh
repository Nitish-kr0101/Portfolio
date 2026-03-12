#!/usr/bin/env bash
set -euo pipefail

email="codex-test-$(date +%s)@example.com"
payload="{\"name\":\"Codex Test\",\"email\":\"${email}\",\"password\":\"Test@123456\"}"

echo "Testing registration with ${email}"
curl -sS -X POST \
  -H "Content-Type: application/json" \
  -d "$payload" \
  http://localhost/api/auth/register
echo
echo "---LOGS---"
docker logs --tail 120 niveshtrack-backend
