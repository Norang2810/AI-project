import React from 'react';
import styled from 'styled-components';

const ErrorContainer = styled.div`
  padding: 20px;
  margin: 20px;
  border: 1px solid #ff6b6b;
  border-radius: 8px;
  background-color: #fff5f5;
  color: #c53030;
`;

const ErrorTitle = styled.h2`
  color: #c53030;
  margin-bottom: 10px;
`;

const ErrorMessage = styled.pre`
  background-color: #f7fafc;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 14px;
  border: 1px solid #e2e8f0;
`;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // 개발 환경에서 콘솔에 오류 로그 출력
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <ErrorTitle>🚨 오류가 발생했습니다</ErrorTitle>
          <p>애플리케이션에서 예상치 못한 오류가 발생했습니다.</p>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <div>
              <h3>오류 세부 정보:</h3>
              <ErrorMessage>
                {this.state.error.toString()}
              </ErrorMessage>
              {this.state.errorInfo && (
                <div>
                  <h4>스택 트레이스:</h4>
                  <ErrorMessage>
                    {this.state.errorInfo.componentStack}
                  </ErrorMessage>
                </div>
              )}
            </div>
          )}
          <button 
            onClick={() => window.location.reload()} 
            style={{
              padding: '10px 20px',
              backgroundColor: '#4299e1',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '15px'
            }}
          >
            페이지 새로고침
          </button>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
