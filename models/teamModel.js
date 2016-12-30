var Sequelize = require("sequelize");
module.exports = function(sequelize, DataTypes) {
  const team = sequelize.define("gospel_teams", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: DataTypes.STRING,
    members: DataTypes.JSONB,
    inviteLink: {
      type: "invite_link",
      field: "invite_link"
    },
    applications: DataTypes.JSONB,
    creator: DataTypes.STRING,
    expireAt: {
      type: DataTypes.DATE,
      field: "expireat"
    },
    isDeleted: {
      type: DataTypes.INTEGER,
      field: "isdeleted",
      defaultValue: 0
    }
  }, {
    timestamps: true,
    createdAt: 'createat',
    updatedAt: 'updateat',
    classMethods: {
      associate: (models) => {
      }
    }
  });
  return team;
}
