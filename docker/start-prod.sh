#!/usr/bin/env bash
set -e

# 스크립트 위치 기준으로 실행
cd "$(dirname "$0")"

# 혹시 개발 스택이 떠 있으면 정리(포트 충돌 방지)
docker rm -f docker_frontend_1 docker_backend_1 docker_mysql_1 docker_ai-server_1 2>/dev/null || true

# 배포 스택 올리기
docker-compose -f docker-compose.prod.yml --env-file ./env.prod up -d --build --remove-orphans

# 상태 확인
docker ps
docker-compose -f docker-compose.prod.yml logs nginx --tail 50

# 로컬 루프백 체크
curl -I http://localhost || true
curl -s http://localhost/api/health || true
