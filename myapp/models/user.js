'use strict';
module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define('user', {
    idUser: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {});
  user.associate = function (models) {
    // associations can be defined here
  };
  return user;
};