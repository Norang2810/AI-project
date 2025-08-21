#!/bin/bash

# SSL 인증서 자동 갱신 스크립트
# 이 스크립트는 cron으로 정기적으로 실행되어야 합니다.

echo "SSL 인증서 갱신을 시작합니다..."

# 도메인/IP 주소 설정
DOMAIN="52.86.168.253"

# 인증서 갱신
echo "인증서를 갱신합니다..."
sudo certbot renew --quiet

# 갱신된 인증서를 nginx 컨테이너에 복사
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo "갱신된 인증서를 nginx 컨테이너에 복사합니다..."
    docker exec nginx mkdir -p /etc/letsencrypt/live/$DOMAIN
    docker cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem nginx:/etc/letsencrypt/live/$DOMAIN/
    docker cp /etc/letsencrypt/live/$DOMAIN/privkey.pem nginx:/etc/letsencrypt/live/$DOMAIN/
    
    # nginx 재시작
    echo "nginx를 재시작합니다..."
    docker exec nginx nginx -s reload
    
    echo "SSL 인증서 갱신이 완료되었습니다!"
else
    echo "SSL 인증서 갱신에 실패했습니다."
    exit 1
fi
