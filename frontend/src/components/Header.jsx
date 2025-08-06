import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const HeaderContainer = styled.header`
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

const Logo = styled.div`
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

const NavMenuContainer = styled.div`
  display: flex;
  align-items: center;
  font-family: 'Ownglyph_meetme-Rg', sans-serif;
  font-size: 25px; /* 폰트 크기 더 줄임 */
  line-height: 28px;
  color: #000000;
  flex: 1; /* 가운데 공간을 차지 */
  justify-content: center; /* 중앙 정렬 */
`;

const NavMenu = styled.ul`
  display: flex;
  list-style: none;
  margin: 0;
  gap: 2rem; /* 메뉴 간격 줄임 */
  align-items: center;
`;

const NavItem = styled.li`
  position: relative;
`;

const NavLink = styled.a`
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

const AuthMenuContainer = styled.div`
  display: flex;
  align-items: center;
  font-family: 'Ownglyph_meetme-Rg', sans-serif;
  font-size: 25px; /* 폰트 크기 더 줄임 */
  line-height: 28px;
  color: #000000;
  flex-shrink: 0; /* 크기 고정 */
  margin-left: 1rem; /* 메뉴와 로그인 사이 간격 통일 */
`;

const AuthMenu = styled.ul`
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 2rem; /* 메뉴 간격 줄임 */
  align-items: center;
`;

const AuthLink = styled.a`
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

const Header = () => {
  const [activeSection, setActiveSection] = useState('home');

  // 스크롤 위치에 따른 활성 섹션 감지
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'upload', 'analysis', 'about'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;
          
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <HeaderContainer>
      <Logo onClick={() => scrollToSection('home')} />
      
      <NavMenuContainer>
        <NavMenu>
          <NavItem>
            <NavLink 
              className={activeSection === 'home' ? 'active' : ''}
              onClick={() => scrollToSection('home')}
            >
              홈
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink 
              className={activeSection === 'upload' ? 'active' : ''}
              onClick={() => scrollToSection('upload')}
            >
              메뉴 업로드
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink 
              className={activeSection === 'analysis' ? 'active' : ''}
              onClick={() => scrollToSection('analysis')}
            >
              분석 결과
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink 
              className={activeSection === 'about' ? 'active' : ''}
              onClick={() => scrollToSection('about')}
            >
              서비스 소개
            </NavLink>
          </NavItem>
        </NavMenu>
      </NavMenuContainer>
      
      <AuthMenuContainer>
        <AuthMenu>
          <NavItem>
            <AuthLink as={Link} to="/login">
              로그인
            </AuthLink>
          </NavItem>
          <NavItem>
            <AuthLink as={Link} to="/register">
              회원가입
            </AuthLink>
          </NavItem>
        </AuthMenu>
      </AuthMenuContainer>
    </HeaderContainer>
  );
};

export default Header;