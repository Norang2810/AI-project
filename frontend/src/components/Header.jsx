import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  z-index: 1000;
  padding: 1rem 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
`;

const Nav = styled.nav`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  
  span {
    color: #007bff;
  }
`;

const NavMenu = styled.ul`
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 2rem;
`;

const NavItem = styled.li`
  position: relative;
`;

const NavLink = styled.a`
  text-decoration: none;
  color: #333;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    color: #007bff;
    background-color: #f8f9fa;
  }

  &.active {
    color: #007bff;
    background-color: #e3f2fd;
  }
`;

const AuthButton = styled.button`
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
    
    &:hover {
      color: #c82333;
      background-color: #f8d7da;
    }
  }
`;

const Header = ({ isLoggedIn, setIsLoggedIn }) => {
  const [activeSection, setActiveSection] = useState('home');

  // 스크롤 위치에 따른 활성 섹션 감지
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'upload', 'allergy', 'analysis', 'about'];
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    // 로그아웃 후 홈페이지로 리다이렉트
    window.location.href = '/';
  };

  return (
    <HeaderContainer>
      <Nav>
        <Logo>
          🍽️ <span>알레르기 안전</span>
        </Logo>

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

        <NavMenu>
          {isLoggedIn ? (
            <NavItem>
              <AuthButton className="logout" onClick={handleLogout}>
                로그아웃
              </AuthButton>
            </NavItem>
          ) : (
            <>
              <NavItem>
                <NavLink as={Link} to="/login">
                  로그인
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink as={Link} to="/register">
                  회원가입
                </NavLink>
              </NavItem>
            </>
          )}
        </NavMenu>
      </Nav>
    </HeaderContainer>
  );
};

export default Header; 