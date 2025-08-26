import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 80px;
  background: #FFFFFF;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.25);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between; /* 좌-중앙-우 배치로 변경 */
  padding: 0 2rem; /* 좌우 여백 통일 */

  /* 모바일 */
  @media (max-width: 768px) {
    height: 60px;
    padding: 0 1rem;
  }
`;

export const Logo = styled.div`
  width: 130px;
  height: 60px;
  background-image: url('/logo.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  cursor: pointer;
  flex-shrink: 0; /* 로고 크기 고정 */
  margin-right: 2rem; /* 로고와 메뉴 사이 간격 */

  /* 모바일 */
  @media (max-width: 768px) {
    width: 100px;
    height: 45px;
    margin-right: 0;
  }
`;

export const NavMenuContainer = styled.div`
  display: flex;
  align-items: center;
  font-size: 25px; /* 폰트 크기 더 줄임 */
  line-height: 28px;
  color: #000000;
  flex: 1; /* 가운데 공간을 차지 */
  justify-content: center; /* 중앙 정렬 */

  /* 모바일에서 숨김 */
  @media (max-width: 768px) {
    display: none;
  }
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
    color: #A2601E;
  }

  &.active {
    color: #A2601E;
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

  /* 모바일에서 숨김 */
  @media (max-width: 768px) {
    display: none;
  }
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
    color: #A2601E;
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

/* 모바일 햄버거 메뉴 버튼 */
export const MobileMenuButton = styled.button`
  display: none;
  flex-direction: column;
  justify-content: space-around;
  width: 30px;
  height: 30px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 1001;

  span {
    width: 100%;
    height: 3px;
    background: #333;
    border-radius: 2px;
    transition: all 0.3s ease;
    transform-origin: center;
  }

  /* 모바일에서만 표시 */
  @media (max-width: 768px) {
    display: flex;
  }
`;

/* 모바일 메뉴 */
export const MobileMenu = styled.div`
  position: fixed;
  top: 0;
  right: ${({ isOpen }) => (isOpen ? '0' : '-100%')};
  width: 280px;
  height: 100vh;
  background: #FFFFFF;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  transition: right 0.3s ease;
  z-index: 1000;
  padding: 80px 2rem 2rem 2rem;
  overflow-y: auto;

  /* 모바일 */
  @media (max-width: 768px) {
    width: 100%;
    right: ${({ isOpen }) => (isOpen ? '0' : '-100%')};
    padding: 70px 1rem 1rem 1rem;
  }
`;

export const MobileNavItem = styled.li`
  list-style: none;
  margin-bottom: 1.5rem;
`;

export const MobileNavLink = styled.a`
  text-decoration: none;
  color: #000000;
  font-size: 1.2rem;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.3s ease;
  display: block;
  padding: 0.5rem 0;

  &:hover {
    color: #A2601E;
  }

  &.active {
    color: #A2601E;
    font-weight: 600;
  }
`;

export const MobileAuthMenu = styled.ul`
  list-style: none;
  margin: 2rem 0 0 0;
  padding: 2rem 0 0 0;
  border-top: 1px solid #eee;
`;

export const MobileAuthLink = styled(Link)`
  text-decoration: none;
  color: #000000;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.3s ease;
  display: block;
  padding: 0.5rem 0;

  &:hover {
    color: #A2601E;
  }
`;

export const MobileAuthButton = styled.button`
  background: none;
  border: none;
  color: #000000;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.3s ease;
  display: block;
  padding: 0.5rem 0;
  text-align: left;
  width: 100%;

  &:hover {
    color: #A2601E;
  }

  &.logout {
    color: #dc3545;
    
    &:hover {
      color: #c82333;
    }
  }
`;
