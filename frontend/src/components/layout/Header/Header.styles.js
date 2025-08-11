import styled from 'styled-components';

export const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 100px;
  background: #FFFFFF;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.25);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between; /* 좌-중앙-우 배치로 변경 */
  padding: 8 2rem; /* 좌우 여백 통일 */
`;

export const Logo = styled.div`
  width: 184px;
  height: 100px;
  background-image: url('/aljualju.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  cursor: pointer;
  flex-shrink: 0; /* 로고 크기 고정 */
  margin-right: 2rem; /* 로고와 메뉴 사이 간격 */
`;

export const NavMenuContainer = styled.div`
  display: flex;
  align-items: center;
  font-size: 25px; /* 폰트 크기 더 줄임 */
  line-height: 28px;
  color: #000000;
  flex: 1; /* 가운데 공간을 차지 */
  justify-content: center; /* 중앙 정렬 */
`;

export const NavMenu = styled.ul`
  display: flex;
  list-style: none;
  margin: 0;
  gap: 2rem; /* 메뉴 간격 줄임 */
  align-items: center;
`;

export const NavItem = styled.li`
  position: relative;
`;

export const NavLink = styled.a`
  text-decoration: none;
  color: #000000;
  font-style: normal;
  font-weight: 400; 
  font-size: 25px; /* 폰트 크기 더 줄임 */
  line-height: 28px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap; /* 텍스트 줄바꿈 방지 */

  &:hover {
    color: rgba(255, 122, 0, 0.2);
  }

  &.active {
    color: rgba(255, 122, 0, 0.2);
    font-weight: 500;
  }
`;

export const AuthMenuContainer = styled.div`
  display: flex;
  align-items: center;
  font-size: 25px; /* 폰트 크기 더 줄임 */
  line-height: 28px;
  color: #000000;
  flex-shrink: 0; /* 크기 고정 */
  margin-left: 1rem; /* 메뉴와 로그인 사이 간격 통일 */
`;

export const AuthMenu = styled.ul`
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 2rem; /* 메뉴 간격 줄임 */
  align-items: center;
`;

export const AuthLink = styled.a`
  text-decoration: none;
  color: #000000;
  font-style: normal;
  font-weight: 400;
  font-size: 25px; /* 폰트 크기 더 줄임 */
  line-height: 28px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap; /* 텍스트 줄바꿈 방지 */
  margin: 0; 
  padding: 0.5rem; /* 좌우 여백 통일 */

  &:hover {
    color: rgba(255, 122, 0, 0.2);
  }
`;

export const AuthButton = styled.button`
  background: none;
  border: none;
  color: #333;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  transition: all 0.3s ease;
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    color: #007bff;
    background-color: #f8f9fa;
  }

  &.logout {
    color: #dc3545;
    font-size: 1.5rem;
    
    &:hover {
      color: #c82333;
      background-color: #f8d7da;
    }
  }
`;
