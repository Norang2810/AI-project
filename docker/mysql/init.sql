-- MySQL 초기화 스크립트
-- myweb_user에게 모든 권한 부여

GRANT ALL PRIVILEGES ON myweb.* TO 'myweb_user'@'%';
FLUSH PRIVILEGES; 