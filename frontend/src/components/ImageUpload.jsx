import React, { useState } from 'react';
import styled from 'styled-components';

const UploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border: 2px dashed #ccc;
  border-radius: 10px;
  margin: 20px;
  background-color: #f9f9f9;
  transition: all 0.3s ease;

  &:hover {
    border-color: #007bff;
    background-color: #f0f8ff;
  }
`;

const UploadButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  margin: 10px;

  &:hover {
    background-color: #0056b3;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const PreviewImage = styled.img`
  max-width: 300px;
  max-height: 300px;
  margin: 10px;
  border-radius: 5px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const StatusMessage = styled.div`
  margin: 10px;
  padding: 10px;
  border-radius: 5px;
  font-weight: bold;

  &.success {
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }

  &.error {
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }

  &.loading {
    background-color: #d1ecf1;
    color: #0c5460;
    border: 1px solid #bee5eb;
  }
`;

const ImageUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState('');

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // 미리보기 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      setStatus('이미지가 선택되었습니다. 업로드 버튼을 클릭하세요.');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setStatus('이미지를 먼저 선택해주세요.');
      return;
    }

    setIsUploading(true);
    setStatus('이미지를 분석 중입니다...');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setStatus('로그인이 필요합니다. 먼저 로그인해주세요.');
        return;
      }

      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('http://localhost:3001/api/menu/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setStatus('분석이 완료되었습니다!');
        console.log('분석 결과:', result);
      } else {
        setStatus(result.message || '업로드에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setStatus('서버 연결에 실패했습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <h2>메뉴판 이미지 업로드</h2>
      <p>카페 메뉴판 사진을 업로드하면 알레르기 정보를 분석해드립니다.</p>
      
      <UploadContainer>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          id="file-input"
        />
        <label htmlFor="file-input">
          <UploadButton as="span">
            이미지 선택
          </UploadButton>
        </label>
        
        {preview && (
          <div>
            <PreviewImage src={preview} alt="미리보기" />
            <UploadButton 
              onClick={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? '분석 중...' : '분석 시작'}
            </UploadButton>
          </div>
        )}
        
        {status && (
          <StatusMessage className={
            status.includes('완료') ? 'success' : 
            status.includes('실패') ? 'error' : 
            status.includes('중') ? 'loading' : ''
          }>
            {status}
          </StatusMessage>
        )}
      </UploadContainer>
    </div>
  );
};

export default ImageUpload; 