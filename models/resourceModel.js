var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes) {
  const resource = sequelize.define("gospel_user_resources", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    owner: DataTypes.STRING,
    diskSize: {
      type: DataTypes.INTEGER,
      field: "disk_size"
    },
    diskUnit: {
      type: DataTypes.STRING,
      field: "disk_unit"
    },
    bandwidth: {
      type: DataTypes.INTEGER,
      field: "disk_size"
    },
    bandwidthUnit: {
      type: DataTypes.STRING,
      field: "bandwidth_unit"
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
        console.log("associate");
      }
    }
  });
  return resource;
}
