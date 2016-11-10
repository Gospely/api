var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes) {
  const user = sequelize.define("gospel_users", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: DataTypes.STRING,
    realname: DataTypes.STRING,
    phone: DataTypes.STRING,
    password: DataTypes.STRING,
    identify: DataTypes.STRING,
    ide: DataTypes.STRING,
    ideName: {
      type: DataTypes.INTEGER,
      field: "idename"
    },
    openId: {
      type: DataTypes.INTEGER,
      field: "open_id"
    },
    type: DataTypes.STRING,
    teams: DataTypes.STRING,
    group: DataTypes.STRING,
    company: DataTypes.STRING,
    qq: DataTypes.STRING,
    email: DataTypes.STRING,
    photo: DataTypes.STRING,
    wechat: DataTypes.STRING,
    workspace: DataTypes.STRING,
    isDeleted: {
      type: DataTypes.INTEGER,
      field: "isdeleted",
      defaultValue: 0
    },
    isBlocked: {
      type: DataTypes.INTEGER,
      field: "isblocked",
      defaultValue: 0
    }
  }, {
    timestamps: true,
    createdAt: 'createat',
    updatedAt: 'updateat',
    classMethods: {
      associate: (models) => {
        models['gospel_users'].hasMany(models['gospel_groups'], {
          as: 'groups',
          foreignKey: 'id'
        });
      },
      isBind: function*(user) {

      }
    }
  });
  return user;
}
