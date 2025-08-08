import styled from 'styled-components';

export const MyPageContainer = styled.div`
  display: flex;
  height: 100vh; // 또는 min-height: 100vh;
  background-color: #FFF4E6;
`;

export const NavigationPanel = styled.div`
  width: 300px;
  background-color: #FFEDD5;
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
  background-color: ${props => props.active ? '#A2601E' : 'transparent'};
  color: ${props => props.active ? 'white' : '#A2601E'};
  border: none;
  text-align: left;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 0 25px 25px 0;
  margin-left: 1rem;

  &:hover {
    background-color: ${props => props.active ? '#A2601E' : '#FFE6C8'};
    color: ${props => props.active ? 'white' : '#A2601E'};
  }

  &:focus {
    outline: none;
  }
`;

export const ContentPanel = styled.div`
  flex: 1;
  background-color: #FFF4E6; // 이 부분을 수정하세요
  padding: 0;
  border-radius: 0 8px 8px 0;
  box-shadow: -2px 0 4px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
`;

export const ContentArea = styled.div`
  h2 {
    color: #A2601E;
    fontFamily: 'Ownglyph_meetme-Rg, sans-serif';
    margin-bottom: 1rem;
    font-size: 2.5rem;
    font-weight: 600;
  }

  p {
    color: #bc7228ff;
    fontFamily: 'Ownglyph_meetme-Rg, sans-serif';
    line-height: 1.6;
    font-size: 1rem;
  }
`;

export const MyInfoSectionContainer = styled.div`
  background: #FFF4E6;
  padding: 2rem;
  padding-bottom: 1rem;
  border-radius: 16px;
`;

export const MyInfoContentWrapper = styled.div`
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
`;

export const InfoCard = styled.div`
  background: #FFFFFF;
  padding: 2rem;
  border-radius: 12px;
  border: 2px solid #FFEDD5;
  flex: 1;
`;

export const CardTitle = styled.h3`
  color: #A2601E;
  font-weight: 500;
  font-size: 1.4rem;
  fontFamily: 'Ownglyph_meetme-Rg, sans-serif';
  margin-bottom: 1.5rem;
`;

export const InfoRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

export const InfoLabel = styled.label`
  width: 140px;
  font-weight: 400;
  color: #A2601E;
  font-size: 1.1rem;
  fontFamily: 'Ownglyph_meetme-Rg, sans-serif';
`;

export const InfoValue = styled.div`
  flex: 1;
  padding: 1rem;
  border: 2px solid #FFEDD5;
  border-radius: 8px;
  font-size: 1.1rem;
  background-color: #F9F9F9;
  color: #A2601E;
  fontFamily: 'Ownglyph_meetme-Rg, sans-serif';
`;

export const PasswordInput = styled.input`
  flex: 1;
  padding: 1rem;
  border: 2px solid #FFEDD5;
  border-radius: 8px;
  font-size: 1.1rem;
  background-color: #FFFFFF;
  color: #A2601E;
  fontFamily: 'Ownglyph_meetme-Rg, sans-serif';
  width: 100%;
`;

export const ChangePasswordButton = styled.button`
  background-color: #A2601E;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  fontFamily: 'Ownglyph_meetme-Rg, sans-serif';
  font-weight: 400;
  transition: background-color 0.2s;

  &:hover {
    background-color: #8B4513;
  }
`;