let refreshingPromise = null;

export async function apiFetch(url, options = {}) {
  const token = localStorage.getItem('accessToken');

  // 1) 원 요청
  let res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
  });

  // 2) 토큰 만료 시(401/403), refresh 호출 및 Access 재발급
  if ((res.status === 401 || res.status === 403) && !options.__retried) {
    try {
      if (!refreshingPromise) {
        refreshingPromise = fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        })
          .then(r => {
            if (!r.ok) {
              if (r.status === 403) {
                // refresh token이 만료되었거나 유효하지 않음
                throw new Error('REFRESH_TOKEN_EXPIRED');
              }
              throw new Error('refresh failed');
            }
            return r.json();
          })
          .then(({ accessToken }) => {
            if (!accessToken) {
              throw new Error('No access token received');
            }
            localStorage.setItem('accessToken', accessToken);
            return accessToken;
          })
          .finally(() => {
            refreshingPromise = null;
          });
      }
      
      const newToken = await refreshingPromise;

      // 3) 새 토큰으로 한 번만 재시도
      return fetch(url, {
        ...options,
        __retried: true,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${newToken}`,
        },
        credentials: 'include',
      });
    } catch (error) {
      // refresh token 만료 시 강제 로그아웃
      if (error.message === 'REFRESH_TOKEN_EXPIRED') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        // 로그인 페이지로 리다이렉트
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      } else {
        // 기타 에러 시에도 토큰 제거
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      return res;
    }
  }

  return res;
}

// 토큰 저장 함수
export const setTokens = (accessToken) => {
  localStorage.setItem('accessToken', accessToken);
};

// 토큰 제거 함수
export const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
};

// 현재 토큰 가져오기
export const getAccessToken = () => {
  return localStorage.getItem('accessToken');
};
