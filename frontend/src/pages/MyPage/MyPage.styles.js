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

export const SectionContainer = styled.div`
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

// 알레르기 정보 섹션의 컨테이너
export const AllergyGridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1rem;
  width: 100%;
`;

// 알레르기 카테고리 칸 (InfoCard와 유사한 역할)
export const AllergyCategoryCard = styled(InfoCard)`
  padding: 1.5rem;
  background-color: white;
  border-left: 5px solid ${({ $isCategorySelected, $badgeColor }) => 
    $isCategorySelected ? $badgeColor : '#ccc'};
  
  // 카테고리 제목과 심각도 배지를 중앙 정렬
  & > div:first-child {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
  }
`;

// 알레르기 카테고리 제목과 아이콘
export const AllergyCategoryTitle = styled.h3`
  margin: 0;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
`;

// 심각도 배지
export const AllergySeverityBadge = styled.span`
  margin-left: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
  background-color: ${({ $badgeColor }) => $badgeColor};
  color: white;
`;

// 알레르기 항목들을 감싸는 컨테이너
export const AllergyItemsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  
  // '기타' 카테고리 항목이 많을 때 스크롤 가능하게
  ${({ $isEtcCategory }) => 
    $isEtcCategory && `
      max-height: 4rem;
      overflow-y: auto;
    `
  }
`;

// 알레르기 개별 항목 태그
export const AllergyItemTag = styled.span`
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
  color: #374151;
  font-weight: 500;
`;

// 알레르기 정보 수정 버튼 컨테이너
export const AllergyButtonContainer = styled.div`
  text-align: center;
  margin-top: 1rem;
  width: 100%;
`;

// 선택되지 않은 카테고리에 표시할 텍스트
export const EmptyAllergyText = styled.p`
  color: #374151;
  margin: 0;
`;