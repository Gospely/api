var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes) {
  const value_added = sequelize.define("gospel_value_addeds", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    price: DataTypes.DOUBLE,
    name: DataTypes.STRING,
    diskSize: {
      type: DataTypes.INTEGER,
      field: "disk_size"
    },
    diskUnit: {
      type: DataTypes.STRING,
      field: "disk_unit"
    },
    bandwidth: DataTypes.INTEGER,
    timeUnit: {
      type: DataTypes.STRING,
      field: "time_unit"
    },
    timeLength: {
      type: DataTypes.INTEGER,
      field: "time_length"
    },
    cpuCore: {
      type: DataTypes.STRING,
      field: "cpu_core"
    },
    cpuType: {
      type: DataTypes.STRING,
      field: "cpu_type"
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
    }
  }, {
    timestamps: false,
    createdAt: 'createat',
    updatedAt: 'updateat',
    classMethods: {
      associate: (models) => {
      }
    }
  });
  return value_added;
}
