// apiFetch.js
let refreshingPromise = null;
let didForceLogout = false;

/** 안전한 토큰 getter: 과도기 호환(accessToken|token 모두 지원) */
function readToken() {
  return localStorage.getItem('token') || localStorage.getItem('accessToken');
}

/** 안전한 토큰 setter: 과도기 동안 둘 다 저장(추후 'token'만 남겨도 됨) */
function writeToken(newToken) {
  if (!newToken) return;
  localStorage.setItem('token', newToken);
  localStorage.setItem('accessToken', newToken);
}

export async function apiFetch(url, options = {}) {
  const token = readToken();

  // 1) 원 요청
  let res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
  });

  // 2) 액세스 토큰 '만료/부재'에만 리프레시 시도: 401 한정 (403은 권한문제일 수 있음)
  if (res.status === 401 && !options.__retried) {
    try {
      if (!refreshingPromise) {
        refreshingPromise = fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        })
          .then(r => {
            if (!r.ok) {
              // refresh 자체 실패(쿠키 만료/위조 등) → 여기서만 강제 로그아웃 대상
              if (r.status === 401 || r.status === 403) {
                throw new Error('REFRESH_TOKEN_EXPIRED');
              }
              throw new Error('REFRESH_FAILED');
            }
            return r.json();
          })
          .then(({ accessToken }) => {
            if (!accessToken) throw new Error('NO_ACCESS_FROM_REFRESH');
            writeToken(accessToken);
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
    } catch (e) {
      // ❗️리프레시 실패일 때만 로그아웃
      if (!didForceLogout) {
        didForceLogout = true;
        clearTokens();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      return res; // 호출부가 메시지 처리할 수 있게 원 응답 반환
    }
  }

  // 403은 그대로 반환 (권한 없음 등). 여기서 로그아웃하지 않음.
  return res;
}

// 토큰 저장/제거/조회 유틸
export const setTokens = (accessToken) => writeToken(accessToken);

export const clearTokens = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
};

export const getAccessToken = () => readToken();
