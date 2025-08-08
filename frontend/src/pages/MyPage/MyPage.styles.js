import styled from 'styled-components';

export const MyPageContainer = styled.div`
  display: flex;
  min-height: calc(100vh - 80px); // 헤더 높이를 제외한 전체 높이
  background-color: #fafafa;
`;

export const NavigationPanel = styled.div`
  width: 300px;
  background-color: #f5f5f5;
  padding: 2rem 0;
  border-radius: 8px 0 0 8px;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
`;

export const NavItem = styled.div`
  margin-bottom: 0.5rem;
`;

export const NavButton = styled.button`
  width: 100%;
  padding: 1rem 2rem;
  background-color: ${props => props.active ? '#ff6b35' : 'transparent'};
  color: ${props => props.active ? 'white' : '#333'};
  border: none;
  text-align: left;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 0 25px 25px 0;
  margin-left: 1rem;

  &:hover {
    background-color: ${props => props.active ? '#ff6b35' : '#ffe8e0'};
    color: ${props => props.active ? 'white' : '#ff6b35'};
  }

  &:focus {
    outline: none;
  }
`;

export const ContentPanel = styled.div`
  flex: 1;
  background-color: #ffffff;
  padding: 2rem;
  border-radius: 0 8px 8px 0;
  box-shadow: -2px 0 4px rgba(0, 0, 0, 0.1);
`;

export const ContentArea = styled.div`
  h2 {
    color: #333;
    margin-bottom: 1rem;
    font-size: 1.8rem;
    font-weight: 600;
  }

  p {
    color: #666;
    line-height: 1.6;
    font-size: 1rem;
  }
`;
