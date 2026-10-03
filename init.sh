echo "=== 1. Requesting Let's Encrypt Certificate ==="
certbot certonly --standalone -m ${email} --agree-tos --no-eff-email -d ${domain}

echo "=== 2. Starting Docker Compose ==="
su - ${user} -c "cd /opt/${app_name} && docker compose up -d"