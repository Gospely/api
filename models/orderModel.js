var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes) {
  const order = sequelize.define("gospel_orders", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    products: DataTypes.STRING,
    name: DataTypes.STRING,
    price: DataTypes.DOUBLE,
    status: DataTypes.INTEGER,
    size: DataTypes.INTEGER,
    unit: DataTypes.STRING,
    type: DataTypes.STRING,
    orderNo: {
      type: DataTypes.STRING,
      field: "order_no"
    },
    timeSize: {
      type: DataTypes.INTEGER,
      field: "time_size"
    },
    timeUnit: {
      type: DataTypes.STRING,
      field: "time_unit"
    },
    unitPrice: {
      type: DataTypes.DOUBLE,
      field: "unit_price"
    },
    creator: DataTypes.INTEGER,
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
        console.log("associate");
      }
    }
  });
  return order;
}
