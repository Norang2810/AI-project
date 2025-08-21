# EC2 환경 HTTPS 설정 가이드

## 개요
현재 HTTP로 접속 가능한 EC2 환경에서 HTTPS 통신을 적용하는 방법을 설명합니다.

## 사전 요구사항
- EC2 인스턴스가 실행 중
- Docker 컨테이너가 실행 중
- 80번 포트가 열려있음
- 443번 포트가 열려있음 (HTTPS용)

## 1단계: EC2 보안 그룹 설정

### AWS 콘솔에서:
1. EC2 대시보드 → 보안 그룹
2. 현재 사용 중인 보안 그룹 선택
3. 인바운드 규칙 편집
4. 다음 규칙 추가:
   - 유형: HTTPS
   - 프로토콜: TCP
   - 포트: 443
   - 소스: 0.0.0.0/0 (또는 특정 IP 범위)

## 2단계: SSL 인증서 발급

### EC2 인스턴스에 SSH 접속 후:

```bash
# 프로젝트 디렉토리로 이동
cd /path/to/your/project

# SSL 설정 스크립트 실행
sudo ./docker/setup-ssl.sh
```

### 스크립트 실행 과정:
1. certbot 설치
2. 임시 nginx 설정 적용 (HTTP만)
3. Let's Encrypt SSL 인증서 발급
4. HTTPS 설정 적용
5. nginx 재시작

## 3단계: 자동 갱신 설정

### cron 작업 추가:
```bash
# crontab 편집
sudo crontab -e

# 다음 줄 추가 (매일 새벽 2시에 실행)
0 2 * * * /path/to/your/project/docker/renew-ssl.sh >> /var/log/ssl-renewal.log 2>&1
```

## 4단계: 테스트

### 브라우저에서:
- `https://52.86.168.253` 접속
- SSL 인증서 확인
- HTTP → HTTPS 자동 리다이렉트 확인

## 문제 해결

### 1. 인증서 발급 실패
```bash
# certbot 로그 확인
sudo tail -f /var/log/letsencrypt/letsencrypt.log

# 수동으로 인증서 발급 시도
sudo certbot certonly --standalone -d 52.86.168.253
```

### 2. nginx 설정 오류
```bash
# nginx 설정 문법 검사
docker exec nginx nginx -t

# nginx 로그 확인
docker logs nginx
```

### 3. 포트 충돌
```bash
# 443번 포트 사용 중인 프로세스 확인
sudo netstat -tlnp | grep :443

# 필요시 프로세스 종료
sudo kill -9 [PID]
```

## 보안 고려사항

### 1. SSL 설정 최적화
- TLS 1.2, 1.3만 사용
- 강력한 암호화 알고리즘 사용
- HSTS 헤더 추가 고려

### 2. 정기적인 업데이트
- certbot 자동 갱신 확인
- nginx 보안 패치 적용
- OS 보안 업데이트

## 추가 설정 옵션

### 1. HSTS 헤더 추가
nginx.conf에 다음 추가:
```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

### 2. 보안 헤더 추가
```nginx
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
```

## 모니터링

### 1. 인증서 만료일 확인
```bash
sudo certbot certificates
```

### 2. SSL 상태 확인
```bash
# SSL Labs 테스트
curl -I https://52.86.168.253

# 인증서 정보 확인
openssl s_client -connect 52.86.168.253:443 -servername 52.86.168.253
```

## 참고 자료
- [Let's Encrypt 공식 문서](https://letsencrypt.org/docs/)
- [Nginx SSL 설정 가이드](https://nginx.org/en/docs/http/configuring_https_servers.html)
- [SSL Labs SSL 테스트](https://www.ssllabs.com/ssltest/)
