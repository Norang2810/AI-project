import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from '../../common/Button';
import Card from '../../common/Card/Card';

// 메인페이지 스타일에 맞춰 전체 컨테이너 수정
const UploadContainer = styled.div`
  max-width: 1200px; /* 메인페이지와 동일한 max-width */
  width: 100%;
  margin: 0 auto;
  padding: 0 2rem; /* 메인페이지와 동일한 패딩 */
`;

// 메인페이지의 SectionTitle과 동일한 스타일로 변경
const SectionTitle = styled.h2`
  font-size: 2.5rem;
  margin-bottom: 2rem;
  text-align: center;
  color: #333;
  font-family: 'Ownglyph_meetme-Rg', sans-serif; /* 메인페이지와 동일한 폰트 */
`;

// 메인페이지의 섹션 내용과 일치하도록 서브타이틀 추가
const SectionSubtitle = styled.p`
  font-family: 'Ownglyph_meetme-Rg', sans-serif;
  font-size: 1.2rem;
  text-align: center;
  color: #A2601E; /* 메인페이지와 동일한 색상으로 변경 */
  margin-bottom: 3rem;
  line-height: 1.6;
  opacity: 0.8;
`;

// 메인페이지의 FeatureCard와 비슷한 스타일로 업로드 영역 수정
const UploadArea = styled(Card)`
  border: 2px dashed #d1d5db;
  cursor: pointer;
  
  &:hover {
    border-color: #A2601E;
    background: #fef7ed;
    transform: translateY(-5px);
  }
  
  &.drag-over {
    border-color: #A2601E;
    background: #fff7ed;
    transform: translateY(-5px);
  }
`;

// 메인페이지의 FeatureIcon과 동일한 스타일로 수정
const UploadIcon = styled.div`
  font-size: 3rem; /* 메인페이지와 동일 */
  margin-bottom: 1rem; /* 메인페이지와 동일 */
  color: #A2601E; /* 메인페이지 컬러 */
`;

// 메인페이지의 FeatureTitle과 동일한 스타일로 수정
const UploadTitle = styled.h3`
  font-size: 1.5rem; /* 메인페이지와 동일 */
  margin-bottom: 1rem; /* 메인페이지와 동일 */
  color: #333; /* 메인페이지와 동일 */
  font-family: 'Ownglyph_meetme-Rg', sans-serif;
  font-weight: 700;
`;

// 메인페이지의 FeatureDescription과 동일한 스타일로 수정
const UploadDescription = styled.p`
  color: #A2601E; /* 메인페이지 컬러로 변경 */
  line-height: 1.6; /* 메인페이지와 동일 */
  margin-bottom: 2rem;
  font-family: 'Ownglyph_meetme-Rg', sans-serif;
  opacity: 0.8;
`;

// 메인페이지의 CTAButton과 비슷한 스타일로 버튼 수정
const UploadButton = styled(Button)`
  width: 300px;
  height: 60px;
  font-size: 18px;
  
  &:disabled {
    background: #f3f4f6;
    color: #9ca3af;
    border-color: #d1d5db;
    cursor: not-allowed;
    transform: none;
  }
`;

// 메인페이지와 일치하는 이미지 미리보기 스타일
const ImagePreview = styled(Card)`
  margin-top: 2rem;
  text-align: center;
`;

const PreviewImage = styled.img`
  max-width: 100%;
  max-height: 400px;
  border-radius: 10px; /* 메인페이지 스타일과 일치 */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

// 메인페이지 컬러 스킴에 맞춘 상태 메시지
const StatusMessage = styled.div`
  padding: 1rem 2rem;
  border-radius: 10px; /* 메인페이지와 일치 */
  margin-top: 2rem;
  text-align: center;
  font-weight: 500;
  font-family: 'Ownglyph_meetme-Rg', sans-serif;
  
  &.success {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    color: #059669;
  }
  
  &.error {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #dc2626;
  }
  
  &.loading {
    background: #fff7ed; /* 메인페이지 컬러와 조화 */
    border: 1px solid #fed7aa;
    color: #A2601E; /* 메인페이지 컬러 */
  }
`;

// 메인페이지 컬러에 맞춘 로딩 스피너
const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid #fed7aa; /* 메인페이지 컬러와 조화 */
  border-top: 3px solid #A2601E; /* 메인페이지 컬러 */
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// 분석 완료 메시지도 메인페이지 스타일로 수정
const CompletionCard = styled(Card)`
  text-align: center;
  margin-top: 2rem;
  border: 1px solid #fed7aa; /* 메인페이지 컬러와 조화 */
`;

const CompletionText = styled.p`
  color: #A2601E; /* 메인페이지 컬러 */
  font-weight: 600;
  font-size: 1.2rem;
  margin-bottom: 1rem;
  font-family: 'Ownglyph_meetme-Rg', sans-serif;
`;

const ResultButton = styled.button`
  width: 250px;
  height: 50px;
  background: rgba(255, 122, 0, 0.1); /* 메인페이지와 동일 */
  border: 1px solid #99632E; /* 메인페이지와 동일 */
  border-radius: 20px;
  color: #A47148; /* 메인페이지와 동일 */
  font-family: 'Ownglyph_meetme-Rg', sans-serif;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 122, 0, 0.2); /* 메인페이지와 동일 */
    transform: translateY(-2px);
  }
`;

const ImageUpload = ({ onAnalysisComplete }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setStatus({ type: '', message: '' });
      setAnalysisResult(null);
    } else {
      setStatus({ type: 'error', message: '이미지 파일만 업로드 가능합니다.' });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setStatus({ type: 'error', message: '이미지를 선택해주세요.' });
      return;
    }

    setIsUploading(true);
    setStatus({ type: 'loading', message: '이미지를 분석하고 있습니다...' });

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/menu/analyze', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        setStatus({ type: 'success', message: '분석이 완료되었습니다!' });
        setAnalysisResult(result.analysis);
        
        // 부모 컴포넌트에 분석 결과 전달
        if (onAnalysisComplete) {
          onAnalysisComplete(result.analysis);
        }
        
        // 분석 완료 후 분석 결과 섹션으로 스크롤
        setTimeout(() => {
          const analysisSection = document.getElementById('analysis');
          if (analysisSection) {
            analysisSection.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start' 
            });
          }
        }, 500);
      } else {
        setStatus({ type: 'error', message: result.message || '분석 중 오류가 발생했습니다.' });
      }
    } catch (error) {
      console.error('업로드 오류:', error);
      setStatus({ type: 'error', message: '서버 연결 오류가 발생했습니다.' });
    } finally {
      setIsUploading(false);
    }
  };

  const renderStatusMessage = () => {
    if (!status.message) return null;

    return (
      <StatusMessage className={status.type}>
        {status.type === 'loading' && <LoadingSpinner />}
        {status.message}
      </StatusMessage>
    );
  };

  return (
    <UploadContainer>
      {/* 메인페이지 스타일에 맞춰 제목과 설명 추가 */}
      <SectionSubtitle>
        카페 메뉴판 사진을 업로드하면 AI가 알레르기 정보를 자동으로 분석해드립니다
      </SectionSubtitle>

      <UploadArea
        className={isDragOver ? 'drag-over' : ''}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input').click()}
      >
        <input
          id="file-input"
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />
        
        {!previewUrl ? (
          <div>
            <UploadIcon>📸</UploadIcon>
            <UploadTitle>이미지 업로드</UploadTitle>
            <UploadDescription>
              클릭하거나 이미지를 여기에 드래그하세요<br />
              JPG, PNG, JPEG 파일을 지원합니다
            </UploadDescription>
            <UploadButton>파일 선택하기</UploadButton>
          </div>
        ) : (
          <div>
            <UploadIcon>✅</UploadIcon>
            <UploadTitle>선택된 이미지</UploadTitle>
            <UploadDescription>분석을 시작하려면 버튼을 클릭하세요</UploadDescription>
            <UploadButton 
              onClick={(e) => {
                e.stopPropagation();
                handleUpload();
              }}
              disabled={isUploading}
            >
              {isUploading ? '분석 중...' : '분석 시작하기'}
            </UploadButton>
          </div>
        )}
      </UploadArea>

      {previewUrl && (
        <ImagePreview>
          <PreviewImage src={previewUrl} alt="업로드된 이미지" />
        </ImagePreview>
      )}

      {renderStatusMessage()}

      {/* 메인페이지 스타일에 맞춘 완료 메시지 */}
      {analysisResult && (
        <CompletionCard>
          <CompletionText>
            ✨ 분석이 완료되었습니다! 분석 결과를 확인해보세요 ✨
          </CompletionText>
          <ResultButton 
            onClick={() => {
              const analysisSection = document.getElementById('analysis');
              if (analysisSection) {
                analysisSection.scrollIntoView({ 
                  behavior: 'smooth', 
                  block: 'start' 
                });
              }
            }}
          >
            📊 분석 결과 보기
          </ResultButton>
        </CompletionCard>
      )}
    </UploadContainer>
  );
};

export default ImageUpload;