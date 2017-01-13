var Sequelize = require("sequelize");
var dnspod = require('../server/dnspod')

module.exports = function(sequelize, DataTypes) {
  const application = sequelize.define("gospel_applications", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: DataTypes.STRING,
    port: DataTypes.STRING,
    version: DataTypes.STRING,
    sshPort: {
      type: DataTypes.STRING,
      field: 'ssh_port'
    },
    dbUser: {
      type: DataTypes.STRING,
      field: 'db_user'
    },
    dbPort: {
      type: DataTypes.STRING,
      field: 'db_port'
    },
    exposePort: {
      type: DataTypes.STRING,
      field: 'expose_port'
    },
    password: DataTypes.STRING,
    socketPort: {
      type: DataTypes.STRING,
      field: 'socket_port'
    },
    sshPassword: {
        type: DataTypes.STRING,
        field: 'ssh_password',
        defaultValue: '123456',
    },
    source: DataTypes.STRING,
    domain: DataTypes.STRING,
    docker: DataTypes.STRING,
    image: DataTypes.STRING,
    members: DataTypes.JSONB,
    team: DataTypes.STRING,
    cmds: DataTypes.STRING,
    git:DataTypes.STRING,
    host: DataTypes.STRING,
    creator: DataTypes.STRING,
    payStatus: {
      type: DataTypes.INTEGER,
      field: "pay_status",
      defaultValue: 0,
    },
    orderNo: {
      type: DataTypes.INTEGER,
      field: "order_no"
    },
    status: {
      type: DataTypes.INTEGER,
      field: "status",
      defaultValue: 0
    },
    createat:{
        type: DataTypes.DATE,
        defaultValue: new Date()
    },
    updateat: {
        type: DataTypes.DATE,
        defaultValue: new Date()
    },
    isDeleted: {
      type: DataTypes.INTEGER,
      field: "isdeleted",
      defaultValue: 0
    },

  }, {
    timestamps: false,
    createdAt: 'createat',
    updatedAt: 'updateat',
    classMethods: {
      associate: (models) => {
      }
    }
  });
  return application;
}
