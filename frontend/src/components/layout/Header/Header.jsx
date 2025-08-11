import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HeaderContainer,
  Logo,
  NavMenuContainer,
  NavMenu,
  NavItem,
  NavLink,
  AuthMenuContainer,
  AuthMenu,
  AuthLink,
  AuthButton
} from './Header.styles';

const Header = ({ isLoggedIn, setIsLoggedIn }) => {
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

  const handleLogout = async () => {
    try {
      // 1) 우리 서비스 상태/스토리지 초기화
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsLoggedIn(false);
  
      // 2) 카카오 JS SDK 세션 로그아웃
      if (window.Kakao?.Auth) {
        await new Promise((res) => window.Kakao.Auth.logout(res));
      }
  
      // 3) 서버에 refresh token 폐기(있다면)
      await fetch('/auth/logout', { method: 'POST', credentials: 'include' });
  
      // 4) 필요하면 메인으로 이동 or 그대로 머무르기
      // navigate('/') or stay
    } catch (e) {
      console.error(e);
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
          {isLoggedIn ? (
            <>
              <NavItem>
                <AuthLink as={Link} to="/mypage">
                  마이페이지
                </AuthLink>
              </NavItem>
              <NavItem>
                <AuthButton className="logout" onClick={handleLogout}>
                  로그아웃
                </AuthButton>
              </NavItem>
            </>
          ) : (
            <>
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
            </>
          )}
        </AuthMenu>
      </AuthMenuContainer>

    </HeaderContainer>
  );
};

export default Header;