#!/usr/bin/env bash
set -euo pipefail

docker exec niveshtrack-mysql mysql -uroot -pNitish12345 -e "
USE niveshtrack_db;
INSERT INTO mutual_funds (symbol, name, category, nav, last_updated)
SELECT 'ICICIPRUVALUE', 'ICICI Prudential Value Discovery Fund', 'Value', 356.80, NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM mutual_funds WHERE symbol = 'ICICIPRUVALUE'
);
SELECT count(*) FROM mutual_funds;
"
