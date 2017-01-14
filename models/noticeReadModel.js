var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes) {
  const notice_read = sequelize.define("gospel_notice_read", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.STRING,
      field: "user_id"
    },
    noticeId: {
      type: DataTypes.STRING,
      field: "notice_id"
    },
    read: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    createat:{
        type: DataTypes.DATE,
    },
    updateat: {
        type: DataTypes.DATE,
    },
  }, {
    timestamps: false,
    createdAt: 'createat',
    classMethods: {
      associate: (models) => {
      },
      isBind: function*(user) {

      }
    }
  });
  return notice_read;
}
