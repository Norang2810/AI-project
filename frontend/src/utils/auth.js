// 로그인 상태 확인
export const isLoggedIn = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

// 로그인 필요 알림
export const showLoginAlert = () => {
  alert('로그인 후 이용해주세요.');
  return false;
};