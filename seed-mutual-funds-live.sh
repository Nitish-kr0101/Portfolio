#!/usr/bin/env bash
set -euo pipefail

docker cp ~/Portfolio/mutual-fund-seed.sql niveshtrack-mysql:/tmp/mutual-fund-seed.sql
docker exec niveshtrack-mysql sh -lc 'mysql -uroot -pNitish12345 < /tmp/mutual-fund-seed.sql'
docker exec niveshtrack-mysql mysql -N -uroot -pNitish12345 -e "use niveshtrack_db; select count(*) from mutual_funds;"
