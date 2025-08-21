#!/bin/bash

# SSL 인증서 설정 스크립트
# 이 스크립트는 EC2 인스턴스에서 실행되어야 합니다.

echo "SSL 인증서 설정을 시작합니다..."

# 도메인/IP 주소 설정
DOMAIN="52.86.168.253"

# certbot 설치
echo "certbot을 설치합니다..."
sudo apt-get update
sudo apt-get install -y certbot

# nginx 컨테이너가 실행 중인지 확인
echo "nginx 컨테이너 상태를 확인합니다..."
if ! docker ps | grep -q nginx; then
    echo "nginx 컨테이너가 실행 중이지 않습니다. 먼저 컨테이너를 시작해주세요."
    exit 1
fi

# 임시로 HTTP만 사용하는 nginx 설정으로 변경
echo "임시 nginx 설정을 적용합니다..."
cat > temp_nginx.conf << EOF
events {
    worker_connections 1024;
}

http {
    client_max_body_size 20m;
    send_timeout 600s;
    proxy_read_timeout 600s;
    proxy_send_timeout 600s;
    proxy_connect_timeout 60s;

    upstream frontend {
        server frontend:80;
    }
    upstream backend {
        server backend:3001;
    }
    upstream ai-server {
        server ai-server:8000;
    }

    server {
        listen 80;
        server_name $DOMAIN;

        client_max_body_size 20m;

        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_read_timeout 600s;
            proxy_send_timeout 600s;
        }

        location /ai/ {
            proxy_pass http://ai-server;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_read_timeout 600s;
            proxy_send_timeout 600s;
        }

        location / {
            proxy_pass http://frontend;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_read_timeout 600s;
            proxy_send_timeout 600s;
        }

        # Let's Encrypt 인증을 위한 경로
        location /.well-known/acme-challenge/ {
            root /var/www/html;
        }
    }
}
EOF

# 임시 설정을 nginx 컨테이너에 복사
docker cp temp_nginx.conf nginx:/etc/nginx/nginx.conf

# nginx 재시작
echo "nginx를 재시작합니다..."
docker exec nginx nginx -s reload

# SSL 인증서 발급
echo "SSL 인증서를 발급받습니다..."
sudo certbot certonly --standalone -d $DOMAIN --non-interactive --agree-tos --email admin@example.com

# 인증서 발급 성공 여부 확인
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo "SSL 인증서 발급이 완료되었습니다!"
    
    # 인증서를 nginx 컨테이너에 복사
    echo "인증서를 nginx 컨테이너에 복사합니다..."
    docker exec nginx mkdir -p /etc/letsencrypt/live/$DOMAIN
    docker cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem nginx:/etc/letsencrypt/live/$DOMAIN/
    docker cp /etc/letsencrypt/live/$DOMAIN/privkey.pem nginx:/etc/letsencrypt/live/$DOMAIN/
    
    # 원래 HTTPS 설정으로 복원
    echo "HTTPS 설정을 적용합니다..."
    docker cp nginx/nginx.conf nginx:/etc/nginx/nginx.conf
    
    # nginx 재시작
    echo "nginx를 재시작합니다..."
    docker exec nginx nginx -s reload
    
    echo "HTTPS 설정이 완료되었습니다!"
    echo "이제 https://$DOMAIN 으로 접속할 수 있습니다."
else
    echo "SSL 인증서 발급에 실패했습니다."
    exit 1
fi

# 임시 파일 정리
rm -f temp_nginx.conf

echo "SSL 설정이 완료되었습니다!"
