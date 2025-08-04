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
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
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
    return await bcrypt.compare(candidatePassword, this.password);
  };

  // 클래스 메서드 SELECT * FROM users WHERE email = 'aaa@bbb.com' 실행되는 구조.
  User.findByEmail = function(email) {
    return this.findOne({ where: { email } });
  };

  return User;
}; 