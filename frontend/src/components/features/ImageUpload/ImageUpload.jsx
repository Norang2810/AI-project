import React, { useState } from 'react';
import {
  UploadContainer,
  SectionSubtitle,
  UploadArea,
  UploadIcon,
  UploadTitle,
  UploadDescription,
  UploadButton,
  ImagePreview,
  PreviewImage,
  StatusMessage,
  LoadingSpinner,
  CompletionCard,
  CompletionText,
  ResultButton
} from './ImageUpload.styles';

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
            <UploadTitle>메뉴판 사진 업로드드</UploadTitle>
            <UploadDescription>
              박스를 클릭하거나 이미지를 여기로 드래그하세요<br />
              JPG, PNG, JPEG 파일을 지원합니다
            </UploadDescription>
            <UploadButton>파일 선택하기</UploadButton>
          </div>
        ) : (
          <div>
            <UploadIcon>✅</UploadIcon>
            <UploadTitle>선택된 이미지</UploadTitle>
            <UploadDescription>
              '분석 시작하기'를 눌러 알레르기 성분을 확인하세요<br/>
              다른 사진을 업로드하려면 박스를 클릭하거나 이미지를 여기로 드래그하세요
              </UploadDescription>
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