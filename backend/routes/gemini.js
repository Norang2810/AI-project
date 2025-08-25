const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();

// Gemini API 초기화
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyBPReCZhgjhBC5THxIqpbhrIjpiSRQ__Hw');

// Gemini API를 사용한 텍스트 보완 (재시도 로직 포함)
router.post('/enhance', async (req, res) => {
  try {
    const { prompt, text, maxTokens = 500 } = req.body;
    
    // 입력 검증
    if (!prompt || !text) {
      return res.status(400).json({ 
        error: 'prompt와 text는 필수입니다.' 
      });
    }
    
    // API 키 확인
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: 'Gemini API 키가 설정되지 않았습니다.' 
      });
    }

    console.log('=== 🤖 Gemini API 요청 ===');
    console.log('Prompt length:', prompt.length);
    console.log('Text:', text);
    console.log('Max tokens:', maxTokens);

    // 재시도 로직 설정
    let retryCount = 0;
    const maxRetries = 3;
    const baseDelay = 1000; // 1초
    
    let enhancedText;
    
    while (retryCount < maxRetries) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        
        const generationConfig = {
          maxOutputTokens: maxTokens,
          temperature: 0.0, // 완전히 일관된 응답을 위해 0으로 설정
          topP: 0.1, // 더 정확한 응답을 위해 낮춤
          topK: 1, // 가장 확실한 응답만 선택
          candidateCount: 1,
        };

        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig,
        });

        const response = await result.response;
        enhancedText = response.text();
        
        // 응답 검증
        if (enhancedText && enhancedText.trim().length > 0) {
          console.log('=== 🤖 Gemini API 응답 성공 ===');
          console.log('Raw response length:', enhancedText.length);
          console.log('Raw response:', enhancedText);
          break; // 성공하면 루프 종료
        } else {
          throw new Error('빈 응답');
        }
        
      } catch (error) {
        retryCount++;
        console.error(`Gemini API 호출 실패 (${retryCount}/${maxRetries}):`, error.message);
        
        if (retryCount >= maxRetries) {
          throw new Error(`Gemini API 호출 실패 (${maxRetries}회 시도): ${error.message}`);
        }
        
        // 지수 백오프로 재시도 간격 증가
        const delay = baseDelay * Math.pow(2, retryCount - 1);
        console.log(`${delay}ms 후 재시도...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // 응답 검증 및 체계적 정리
    let cleanedText = enhancedText.trim();
    let transformationMethod = 'none';
    
    // 1단계: JSON 배열 형태 확인
    if (cleanedText.startsWith('[') && cleanedText.endsWith(']')) {
      try {
        const parsed = JSON.parse(cleanedText);
        if (Array.isArray(parsed) && parsed.length > 0) {
          transformationMethod = 'json_array';
          console.log('✅ JSON 배열 형태로 응답 성공:', parsed);
        }
      } catch (parseError) {
        console.log('❌ JSON 파싱 실패, 다른 방법 시도');
      }
    }
    
    // 2단계: JSON이 아닌 경우 텍스트 정리
    if (transformationMethod === 'none') {
      // 줄바꿈으로 구분된 텍스트를 배열로 변환
      const lines = cleanedText
        .split('\n')
        .map(line => line.trim())
        .filter(line => 
          line.length > 0 && 
          line.length <= 50 &&
          !line.includes('```') &&
          !line.includes('---') &&
          !line.includes('⚠️')
        );
      
      if (lines.length > 0) {
        cleanedText = JSON.stringify(lines);
        transformationMethod = 'line_separated';
        console.log('✅ 줄바꿈으로 JSON 변환 성공:', cleanedText);
      } else {
        // 3단계: 마지막 수단 - 원본 텍스트에서 의미 있는 단어 추출
        const meaningfulWords = cleanedText
          .match(/[가-힣a-zA-Z0-9]{2,}/g)
          ?.filter(word => 
            word.length >= 2 && 
            word.length <= 20 && 
            !['OCR', '텍스트', '메뉴', '음료', '카페', '변환', '완성', '분석', '결과'].includes(word)
          ) || [];
        
        if (meaningfulWords.length > 0) {
          cleanedText = JSON.stringify(meaningfulWords.slice(0, 10));
          transformationMethod = 'meaningful_words';
          console.log('✅ 의미 있는 단어로 JSON 변환 성공:', cleanedText);
        }
      }
    }
    
    // JSON 배열 형태 확인
    if (cleanedText.startsWith('[') && cleanedText.endsWith(']')) {
      transformationMethod = 'perfect_json';
      console.log('✅ 완벽한 JSON 배열 형태');
    } else {
      console.log('⚠️ JSON 배열 형태가 아님, 체계적 변환 시도...');
      
      // 2단계: 따옴표로 둘러싸인 텍스트들 찾기
      const quotedMatches = cleanedText.match(/[""]([^""]+)[""]/g);
      if (quotedMatches && quotedMatches.length > 0) {
        const menuNames = quotedMatches
          .map(match => match.replace(/[""]/g, '').trim())
          .filter(name => name && name.length > 0 && name.length < 50);
        
        cleanedText = JSON.stringify(menuNames);
        transformationMethod = 'quoted_texts';
        console.log('✅ 따옿표 매칭으로 JSON 변환 성공:', cleanedText);
      } else {
        // 3단계: 대괄호로 둘러싸인 텍스트들 찾기
        const bracketMatches = cleanedText.match(/\[([^\]]+)\]/g);
        if (bracketMatches && bracketMatches.length > 0) {
          const menuNames = bracketMatches
            .map(match => match.replace(/[\[\]]/g, '').trim())
            .filter(name => name && name.length > 0 && name.length < 50);
          
          cleanedText = JSON.stringify(menuNames);
          transformationMethod = 'bracket_texts';
          console.log('✅ 대괄호 매칭으로 JSON 변환 성공:', cleanedText);
        } else {
          // 4단계: 줄바꿈으로 구분된 텍스트 처리
          const lines = cleanedText
            .split('\n')
            .map(line => line.trim())
            .filter(line => {
              // 의미 있는 텍스트만 필터링
              return line && 
                     line.length > 0 && 
                     line.length < 50 && 
                     !line.startsWith('#') && 
                     !line.startsWith('-') &&
                     !line.startsWith('*') &&
                     !line.includes('===') &&
                     !line.includes('📋') &&
                     !line.includes('🎯') &&
                     !line.includes('🔍') &&
                     !line.includes('📝') &&
                     !line.includes('🎨') &&
                     !line.includes('📤') &&
                     !line.includes('⚠️');
            });
          
          if (lines.length > 0) {
            cleanedText = JSON.stringify(lines);
            transformationMethod = 'line_separated';
            console.log('✅ 줄바꿈으로 JSON 변환 성공:', cleanedText);
          } else {
            // 5단계: 마지막 수단 - 원본 텍스트에서 의미 있는 단어 추출
            const meaningfulWords = cleanedText
              .match(/[가-힣a-zA-Z]{2,}/g)
              ?.filter(word => 
                word.length >= 2 && 
                word.length <= 20 && 
                !['OCR', '텍스트', '메뉴', '음료', '카페', '변환', '완성'].includes(word)
              ) || [];
            
            if (meaningfulWords.length > 0) {
              cleanedText = JSON.stringify(meaningfulWords.slice(0, 10));
              transformationMethod = 'meaningful_words';
              console.log('✅ 의미 있는 단어로 JSON 변환 성공:', cleanedText);
            }
          }
        }
      }
    }

    // 변환 결과 검증
    try {
      const testParse = JSON.parse(cleanedText);
      if (!Array.isArray(testParse) || testParse.length === 0) {
        throw new Error('빈 배열 또는 배열이 아님');
      }
      console.log('✅ 최종 JSON 검증 성공:', testParse);
    } catch (validationError) {
      console.log('❌ 최종 JSON 검증 실패, 원본 응답 사용');
      cleanedText = JSON.stringify([text]); // 원본 텍스트를 배열로 감싸기
      transformationMethod = 'fallback_original';
    }

    res.json({ 
      enhancedText: cleanedText,
      originalResponse: enhancedText,
      transformationMethod,
      success: true
    });

  } catch (error) {
    console.error('Gemini API 오류:', error);
    
    // 구체적인 오류 메시지 제공
    let errorMessage = 'Gemini API 호출 중 오류가 발생했습니다.';
    
    if (error.message.includes('quota')) {
      errorMessage = 'API 할당량이 초과되었습니다.';
    } else if (error.message.includes('content')) {
      errorMessage = '부적절한 콘텐츠로 인해 차단되었습니다.';
    } else if (error.message.includes('key')) {
      errorMessage = 'API 키가 유효하지 않습니다.';
    } else if (error.message.includes('model')) {
      errorMessage = '모델을 찾을 수 없습니다.';
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: error.message 
    });
  }
});

// Gemini API 상태 확인
router.get('/status', async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        success: false,
        status: 'API_KEY_MISSING',
        message: 'Gemini API 키가 설정되지 않았습니다.'
      });
    }

    // 간단한 테스트 호출로 API 상태 확인
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: 'Hello' }] }],
      generationConfig: { maxOutputTokens: 10 }
    });

    res.json({
      success: true,
      status: 'ACTIVE',
      message: 'Gemini API가 정상적으로 작동 중입니다.',
      model: 'gemini-1.5-flash',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Gemini API 상태 확인 실패:', error);
    res.status(500).json({
      success: false,
      status: 'ERROR',
      message: 'Gemini API 상태 확인에 실패했습니다.',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
