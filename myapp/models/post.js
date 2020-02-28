'use strict';
module.exports = (sequelize, DataTypes) => {
  const post = sequelize.define('post', {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    user: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    view: {
      type: DataTypes.INTEGER,
      defualtValue: 0,
      allowNull: true,
    }
  }, {});
  post.associate = function (models) {
    post.hasMany(models.reply);
  };
  return post;
};