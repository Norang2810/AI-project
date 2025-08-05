import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import AnalysisResult from './AnalysisResult';

const UploadContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  border: 2px dashed #ccc;
  border-radius: 10px;
  margin: 20px;
  background: #ffecd5ff; 
  transition: all 0.3s ease;



const UploadArea = styled.div`
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  background: #f9fafb;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    border-color: #3b82f6;
    background: #f0f9ff;
  }
  
  &.drag-over {
    border-color: #3b82f6;
    background: #eff6ff;
  }
`;

const UploadButton = styled.button`
  background-color: #fddbb2ff; 

  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
  
  &:hover {
    background-color: #fafafaff;

  }
  
  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

const ImagePreview = styled.div`
  margin-top: 20px;
  text-align: center;
`;

const PreviewImage = styled.img`
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const StatusMessage = styled.div`
  padding: 16px;
  border-radius: 8px;
  margin-top: 20px;
  text-align: center;
  font-weight: 500;
  
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
    background: #f0f9ff;
    border: 1px solid #bae6fd;
    color: #0369a1;
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;



const ImageUpload = ({ onAnalysisComplete }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const resultTabRef = useRef(null);

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
      <h1 style={{ textAlign: 'center', marginBottom: '20px', color: '#1f2937' }}>
        메뉴판 업로드
      </h1>
      
      <p style={{ textAlign: 'center', marginBottom: '30px', color: '#6b7280' }}>
        카페 메뉴판 사진을 업로드하면 알레르기 정보를 분석해드립니다.
      </p>

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
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📷</div>
            <p style={{ fontSize: '18px', marginBottom: '8px', color: '#374151' }}>
              이미지 선택
            </p>
            <p style={{ color: '#6b7280', marginBottom: '20px' }}>
              클릭하거나 이미지를 여기에 드래그하세요
            </p>
            <UploadButton>이미지 선택</UploadButton>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: '18px', marginBottom: '16px', color: '#374151' }}>
              선택된 이미지
            </p>
            <UploadButton 
              onClick={(e) => {
                e.stopPropagation();
                handleUpload();
              }}
              disabled={isUploading}
            >
              {isUploading ? '분석 중...' : '분석 시작'}
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

      {/* 분석 결과가 있으면 분석 결과 섹션으로 스크롤 */}
      {analysisResult && (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p style={{ color: '#059669', fontWeight: '600' }}>
            ✅ 분석이 완료되었습니다! 분석 결과 섹션을 확인해주세요.
          </p>
          <button 
            onClick={() => {
              const analysisSection = document.getElementById('analysis');
              if (analysisSection) {
                analysisSection.scrollIntoView({ 
                  behavior: 'smooth', 
                  block: 'start' 
                });
              }
            }}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            분석 결과 보기
          </button>
        </div>
      )}
    </UploadContainer>
  );
};

export default ImageUpload; 