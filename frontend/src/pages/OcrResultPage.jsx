import React from 'react';

function OcrResultPage() {
  // ✅ 사용자가 선택한 알레르기 성분 (임시 데이터)
  const userAllergies = ['우유', '땅콩'];

  // ✅ 샘플 메뉴 데이터 (OCR 결과라고 가정)
  const menuData = [
    {
      name: '카라멜 마끼아또',
      price: '5500원',
      ingredients: ['우유', '카라멜 시럽', '커피'],
    },
    {
      name: '아메리카노',
      price: '4500원',
      ingredients: ['물', '커피'],
    },
    {
      name: '땅콩라떼',
      price: '6000원',
      ingredients: ['땅콩', '우유', '에스프레소'],
    },
  ];

  // ✅ 알레르기 필터링 및 위험도 계산
  const getAllergyMatches = (ingredients) => {
    const matched = ingredients.filter((ingredient) =>
      userAllergies.includes(ingredient)
    );
    return matched;
  };

  const getSeverity = (matchedCount) => {
    if (matchedCount === 0) return '-';
    if (matchedCount === 1) return '경미';
    if (matchedCount === 2) return '보통';
    return '심각';
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>📋 메뉴 분석 결과 (알레르기 기반)</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th style={cellStyle}>메뉴명</th>
            <th style={cellStyle}>가격</th>
            <th style={cellStyle}>위험 성분</th>
            <th style={cellStyle}>위험도</th>
          </tr>
        </thead>
        <tbody>
          {menuData.map((menu, idx) => {
            const allergyMatches = getAllergyMatches(menu.ingredients);
            const severity = getSeverity(allergyMatches.length);

            return (
              <tr key={idx}>
                <td style={cellStyle}>{menu.name}</td>
                <td style={cellStyle}>{menu.price}</td>
                <td style={cellStyle}>
                  {allergyMatches.length > 0 ? allergyMatches.join(', ') : '없음'}
                </td>
                <td style={{ ...cellStyle, color: getSeverityColor(severity), fontWeight: 'bold' }}>
                  {severity}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ✅ 셀 스타일
const cellStyle = {
  border: '1px solid #ddd',
  padding: '10px',
  textAlign: 'center',
};

// ✅ 위험도 색상
const getSeverityColor = (severity) => {
  switch (severity) {
    case '경미':
      return '#ffa500'; // 주황
    case '보통':
      return '#ff6347'; // 토마토
    case '심각':
      return '#ff0000'; // 빨강
    default:
      return '#333'; // 기본
  }
};

export default OcrResultPage;
