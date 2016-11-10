var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes) {
  const dockers = sequelize.define("gospel_dockers", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: DataTypes.STRING,
    config: DataTypes.STRING,
    creator: DataTypes.STRING,
    volume: DataTypes.STRING,
    image: DataTypes.STRING,
    sshPort: {
      type: DataTypes.STRING,
      field: "ssh_port"
    },
    port: DataTypes.STRING,
    username: {
      type: DataTypes.STRING,
      defaultValue: "root"
    },
    password: DataTypes.STRING,
    expireAt: {
      type: DataTypes.DATE,
      field: "expireat"
    },
    isDeleted: {
      type: DataTypes.INTEGER,
      field: "isdeleted",
      defaultValue: 0
    },
  }, {
    timestamps: true,
    createdAt: 'createat',
    updatedAt: 'updateat',
    classMethods: {
      associate: (models) => {},
      isBind: function*(user) {

      }
    }
  });
  return dockers;
}
