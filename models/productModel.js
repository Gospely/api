var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes) {
  const product = sequelize.define("gospel_products", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    type: DataTypes.STRING,
    price: DataTypes.DOUBLE,
    unit: DataTypes.STRING,
    peopleLimit: {
      type: DataTypes.INTEGER,
      field: "people_limit",
      defaultValue: 0
    },
    teamLimit: {
      type: DataTypes.INTEGER,
      field: "team_limit",
      defaultValue: 0
    },
    appLimit: {
      type: DataTypes.INTEGER,
      field: "app_limit",
      defaultValue: 0
    },
    cpu: DataTypes.STRING,
    cpuType: {
      type: DataTypes.STRING,
      field: "cpu_type"
    },
    free: DataTypes.BOOLEAN,
    memory: DataTypes.DOUBLE,
    memoryUnit: {
      type: DataTypes.STRING,
      field: "memory_unit"
    },
    max: DataTypes.INTEGER,
    min: DataTypes.INTEGER,
    freeSize: {
      type: DataTypes.INTEGER,
      field: "free_size"
    },
    discount: DataTypes.STRING,
    createat:{
        type: DataTypes.DATE,
        defaultValue: new Date(Date.now() + (8 * 60 * 60 * 1000))
    },
    updateat: {
        type: DataTypes.DATE,
        defaultValue: new Date(Date.now() + (8 * 60 * 60 * 1000))
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
  return product;
}
