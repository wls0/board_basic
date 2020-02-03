'use strict';
module.exports = (sequelize, DataTypes) => {
  const reply = sequelize.define('reply', {
    postId: {
      type:DataTypes.INTEGER,
      allowNull: false
    },
    user: {
      type:DataTypes.STRING,
      allowNull: false
    },
    reply: {
      type:DataTypes.STRING,
      allowNull: false
    }  }, {});
  reply.associate = function(models) {
    reply.belongsTo(models.post, {
      foreignKey: "postId"
    })
  };
  return reply;
};