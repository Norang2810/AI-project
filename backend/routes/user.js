const express = require('express');
const { User, UserAllergy } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { syncUserAllergyRecords } = require('../services/analysisPersistence');

const router = express.Router();

router.post('/allergies', authenticateToken, async (req, res) => {
  try {
    const { allergies, severity } = req.body;
    const userId = req.user.id;

    const result = await syncUserAllergyRecords({
      userId,
      allergies,
      severity,
    });

    res.json({
      success: true,
      message: '알레르기 정보가 저장되었습니다.',
      data: {
        allergies: result.allergies,
        severity: result.severity,
      },
    });
  } catch (error) {
    console.error('알레르기 정보 저장 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

router.get('/allergies', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const allergies = await UserAllergy.findAll({
      where: { userId },
      attributes: ['allergyName', 'severity'],
    });

    res.json({
      success: true,
      data: {
        allergies: allergies.map((allergy) => ({
          name: allergy.allergyName,
          severity: allergy.severity,
        })),
      },
    });
  } catch (error) {
    console.error('알레르기 정보 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'phone'],
      include: [
        {
          model: UserAllergy,
          as: 'allergies',
          attributes: ['allergyName', 'severity'],
        },
      ],
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          allergies: user.allergies.map((allergy) => ({
            name: allergy.allergyName,
            severity: allergy.severity,
          })),
        },
      },
    });
  } catch (error) {
    console.error('프로필 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

router.patch('/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: '현재 비밀번호, 새 비밀번호, 새 비밀번호 확인은 필수입니다.',
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: '새 비밀번호가 일치하지 않습니다.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: '비밀번호는 6자 이상이어야 합니다.',
      });
    }

    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.',
      });
    }

    const verify = await user.comparePassword(currentPassword);
    if (!verify) {
      return res.status(403).json({
        success: false,
        message: '현재 비밀번호가 올바르지 않습니다.',
      });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: '비밀번호가 변경되었습니다.',
    });
  } catch (error) {
    console.error('비밀번호 변경 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

module.exports = router;
