#!/usr/bin/env bash
set -euo pipefail

docker cp ~/Portfolio/stock-seed.sql niveshtrack-mysql:/tmp/stock-seed.sql
docker exec niveshtrack-mysql sh -lc 'mysql -uroot -pNitish12345 < /tmp/stock-seed.sql'
docker exec niveshtrack-mysql mysql -N -uroot -pNitish12345 -e "use niveshtrack_db; select count(*) from stocks;"
