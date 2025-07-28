const express = require('express');
const { User, UserAllergy } = require('../models');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 사용자 알레르기 정보 저장
router.post('/allergies', authenticateToken, async (req, res) => {
  try {
    const { allergies, severity } = req.body;
    const userId = req.user.id;

    // 기존 알레르기 정보 삭제
    await UserAllergy.destroy({
      where: { userId }
    });

    // 새로운 알레르기 정보 저장
    if (allergies && allergies.length > 0) {
      const allergyData = allergies.map(allergy => ({
        userId,
        allergyName: allergy,
        severity: severity || 'medium'
      }));

      await UserAllergy.bulkCreate(allergyData);
    }

    res.json({
      success: true,
      message: '알레르기 정보가 저장되었습니다.',
      data: {
        allergies,
        severity
      }
    });

  } catch (error) {
    console.error('알레르기 정보 저장 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 사용자 알레르기 정보 조회
router.get('/allergies', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const allergies = await UserAllergy.findAll({
      where: { userId },
      attributes: ['allergyName', 'severity']
    });

    res.json({
      success: true,
      data: {
        allergies: allergies.map(a => ({
          name: a.allergyName,
          severity: a.severity
        }))
      }
    });

  } catch (error) {
    console.error('알레르기 정보 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 사용자 프로필 조회
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'phone'],
      include: [{
        model: UserAllergy,
        as: 'allergies',
        attributes: ['allergyName', 'severity']
      }]
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          allergies: user.allergies.map(a => ({
            name: a.allergyName,
            severity: a.severity
          }))
        }
      }
    });

  } catch (error) {
    console.error('프로필 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

module.exports = router; 