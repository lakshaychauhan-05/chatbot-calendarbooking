#!/bin/sh
set -e

# Inject environment variables into the built JavaScript
# This allows runtime configuration without rebuilding

# Create env-config.js with runtime environment variables
cat <<EOF > /usr/share/nginx/html/env-config.js
window._env_ = {
  VITE_API_BASE_URL: "${VITE_API_BASE_URL:-http://localhost:5050}",
  VITE_CORE_API_BASE: "${VITE_CORE_API_BASE:-http://localhost:8000}",
  VITE_PORTAL_API_BASE: "${VITE_PORTAL_API_BASE:-http://localhost:5000/portal}"
};
EOF

# Update nginx port if PORT env var is set (Railway compatibility)
if [ -n "$PORT" ]; then
    sed -i "s/listen 80;/listen $PORT;/g" /etc/nginx/conf.d/default.conf
    sed -i "s/listen \[::\]:80;/listen [::]:$PORT;/g" /etc/nginx/conf.d/default.conf
fi

exec "$@"
