// API 호출 안정성을 위한 유틸리티 함수들

/**
 * 재시도 로직이 포함된 fetch 함수
 * @param {string} url - API 엔드포인트
 * @param {Object} options - fetch 옵션
 * @param {number} maxRetries - 최대 재시도 횟수 (기본값: 3)
 * @param {number} baseDelay - 기본 재시도 간격 (기본값: 1000ms)
 * @returns {Promise} fetch 응답
 */
export const fetchWithRetry = async (url, options = {}, maxRetries = 3, baseDelay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`API 호출 시도 ${attempt}/${maxRetries}: ${url}`);
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      console.log(`API 호출 성공 (${attempt}/${maxRetries})`);
      return response;
      
    } catch (error) {
      lastError = error;
      console.error(`API 호출 실패 (${attempt}/${maxRetries}):`, error.message);
      
      if (attempt === maxRetries) {
        console.error('최대 재시도 횟수 도달, 실패로 처리');
        throw lastError;
      }
      
      // 지수 백오프로 재시도 간격 증가
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`${delay}ms 후 재시도...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

/**
 * Gemini API 호출을 위한 전용 함수
 * @param {string} prompt - AI 프롬프트
 * @param {string} text - 분석할 텍스트
 * @param {number} maxTokens - 최대 토큰 수
 * @returns {Promise} API 응답
 */
export const callGeminiAPI = async (prompt, text, maxTokens = 500) => {
  try {
    const response = await fetchWithRetry('/api/gemini/enhance', {
      method: 'POST',
      body: JSON.stringify({ prompt, text, maxTokens }),
    }, 3, 2000); // Gemini API는 더 긴 재시도 간격
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Gemini API 호출 실패');
    }
    
    return data;
    
  } catch (error) {
    console.error('Gemini API 호출 오류:', error);
    throw error;
  }
};

/**
 * 이미지 업로드 및 분석을 위한 함수
 * @param {File} imageFile - 업로드할 이미지 파일
 * @param {Object} options - 추가 옵션
 * @returns {Promise} 분석 결과
 */
export const uploadAndAnalyzeImage = async (imageFile, options = {}) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    // 추가 옵션이 있다면 FormData에 추가
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    
    const response = await fetchWithRetry('/api/menu/analyze', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        // Content-Type은 FormData가 자동으로 설정
      },
    }, 2, 3000); // 이미지 분석은 더 긴 타임아웃
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || '이미지 분석 실패');
    }
    
    return data;
    
  } catch (error) {
    console.error('이미지 업로드 및 분석 오류:', error);
    throw error;
  }
};

/**
 * API 상태 확인 함수
 * @returns {Promise} API 상태
 */
export const checkAPIStatus = async () => {
  try {
    const response = await fetchWithRetry('/api/health', {}, 2, 1000);
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('API 상태 확인 실패:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Gemini API 상태 확인 함수
 * @returns {Promise} Gemini API 상태
 */
export const checkGeminiStatus = async () => {
  try {
    const response = await fetchWithRetry('/api/gemini/status', {}, 2, 1000);
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Gemini API 상태 확인 실패:', error);
    return { success: false, error: error.message };
  }
};
