import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch, clearTokens } from '../../../lib/apiFetch';
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
  AuthButton,
  MobileMenuButton,
  MobileMenu,
  MobileNavItem,
  MobileNavLink,
  MobileAuthMenu,
  MobileAuthLink,
  MobileAuthButton
} from './Header.styles';

const Header = ({ isLoggedIn, setIsLoggedIn }) => {
  const [activeSection, setActiveSection] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    // 모바일 메뉴 닫기
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      // 1) 카카오 SDK 로그아웃(있으면)
      if (window.Kakao?.Auth) {
        await new Promise((res) => window.Kakao.Auth.logout(res));
      }
  
      // 2) 서버에 refresh 토큰 폐기 
      await apiFetch('/api/auth/logout', {
        method: 'POST',
      });
    } catch (e) {
      console.error('logout error:', e);
    } finally {
      // 3) 클라이언트 정리 & 라우팅
      clearTokens();
      setIsLoggedIn(false);
      window.location.href = '/login';
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  

  return (
    <HeaderContainer>
      <Logo onClick={() => scrollToSection('home')} />

      {/* 데스크톱 네비게이션 */}
      <NavMenuContainer className="desktop-only">
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

      {/* 데스크톱 인증 메뉴 */}
      <AuthMenuContainer className="desktop-only">
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

      {/* 모바일 햄버거 메뉴 버튼 */}
      <MobileMenuButton 
        className="mobile-only"
        onClick={toggleMobileMenu}
        aria-label="메뉴 열기"
      >
        <span></span>
        <span></span>
        <span></span>
      </MobileMenuButton>

      {/* 모바일 메뉴 */}
      <MobileMenu isOpen={isMobileMenuOpen}>
        <MobileNavItem>
          <MobileNavLink
            className={activeSection === 'home' ? 'active' : ''}
            onClick={() => scrollToSection('home')}
          >
            홈
          </MobileNavLink>
        </MobileNavItem>
        <MobileNavItem>
          <MobileNavLink
            className={activeSection === 'upload' ? 'active' : ''}
            onClick={() => scrollToSection('upload')}
          >
            메뉴 업로드
          </MobileNavLink>
        </MobileNavItem>
        <MobileNavItem>
          <MobileNavLink
            className={activeSection === 'analysis' ? 'active' : ''}
            onClick={() => scrollToSection('analysis')}
          >
            분석 결과
          </MobileNavLink>
        </MobileNavItem>
        <MobileNavItem>
          <MobileNavLink
            className={activeSection === 'about' ? 'active' : ''}
            onClick={() => scrollToSection('about')}
          >
            서비스 소개
          </MobileNavLink>
        </MobileNavItem>
        
        <MobileAuthMenu>
          {isLoggedIn ? (
            <>
              <MobileNavItem>
                <MobileAuthLink as={Link} to="/mypage" onClick={() => setIsMobileMenuOpen(false)}>
                  마이페이지
                </MobileAuthLink>
              </MobileNavItem>
              <MobileNavItem>
                <MobileAuthButton className="logout" onClick={handleLogout}>
                  로그아웃
                </MobileAuthButton>
              </MobileNavItem>
            </>
          ) : (
            <>
              <MobileNavItem>
                <MobileAuthLink as={Link} to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  로그인
                </MobileAuthLink>
              </MobileNavItem>
              <MobileNavItem>
                <MobileAuthLink as={Link} to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  회원가입
                </MobileAuthLink>
              </MobileNavItem>
            </>
          )}
        </MobileAuthMenu>
      </MobileMenu>
    </HeaderContainer>
  );
};

export default Header;