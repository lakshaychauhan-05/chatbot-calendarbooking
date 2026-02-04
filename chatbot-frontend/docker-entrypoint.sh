#!/bin/sh
set -e

# Inject environment variables into the built JavaScript
# This allows runtime configuration without rebuilding

# Create env-config.js with runtime environment variables
cat <<EOF > /usr/share/nginx/html/env-config.js
window._env_ = {
  REACT_APP_CHATBOT_API_URL: "${REACT_APP_CHATBOT_API_URL:-http://localhost:8002}",
  REACT_APP_CALENDAR_API_URL: "${REACT_APP_CALENDAR_API_URL:-http://localhost:8000}"
};
EOF

# Update nginx port if PORT env var is set (Railway compatibility)
if [ -n "$PORT" ]; then
    sed -i "s/listen 80;/listen $PORT;/g" /etc/nginx/conf.d/default.conf
    sed -i "s/listen \[::\]:80;/listen [::]:$PORT;/g" /etc/nginx/conf.d/default.conf
fi

exec "$@"
