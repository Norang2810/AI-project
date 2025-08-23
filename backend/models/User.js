const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: 'users_email_unique',
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true, 
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    kakaoId: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: 'users_kakaoid_unique',
    },
    refreshToken: { type: DataTypes.TEXT, allowNull: true },
  }, {
    tableName: 'users',
    freezeTableName: true,
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: async (user) => { //새 유저 생성 시 비밀번호 해싱
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user) => { //비밀번호 변경 시 해싱
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10); //솔트 라운드를 10으로 설정
        }
      },
    },
  });

  // 인스턴스 메서드
  User.prototype.comparePassword = async function(candidatePassword) {
    if (!this.password) return false; // 카카오 로그인 사용자의 경우
    return await bcrypt.compare(candidatePassword, this.password);
  };

  // 클래스 메서드 SELECT * FROM users WHERE email = 'aaa@bbb.com' 실행되는 구조.
  User.findByEmail = function(email) {
    return this.findOne({ where: { email } });
  };

  // 카카오 ID로 사용자 찾기
  User.findByKakaoId = function(kakaoId) {
    return this.findOne({ where: { kakaoId } });
  };

  return User;
}; 