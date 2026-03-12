#!/usr/bin/env bash
set -euo pipefail

docker cp ~/Portfolio/Portfolio/nginx.conf niveshtrack-frontend:/etc/nginx/conf.d/default.conf

docker exec niveshtrack-frontend sh -lc '
for f in /usr/share/nginx/html/index.html /usr/share/nginx/html/assets/*.js; do
  if [ -f "$f" ]; then
    sed -i "s#http://localhost:8081##g; s#http://localhost:8082##g" "$f"
  fi
done
'

docker exec niveshtrack-frontend sh -lc '
sed -i "s#/assets/index-D-b1RDAX.js#/assets/index-D-b1RDAX.js?v=hotfix-20260312#g; s#/assets/index-DKg840ns.css#/assets/index-DKg840ns.css?v=hotfix-20260312#g" /usr/share/nginx/html/index.html
'

docker exec niveshtrack-frontend nginx -s reload

curl -I --max-time 15 http://localhost/
