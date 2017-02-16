var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes) {
  const innersession = sequelize.define("gospel_innersessions", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    code: DataTypes.STRING,
    creator: DataTypes.STRING,
    group: DataTypes.STRING,
    time: DataTypes.BIGINT,
    phone: DataTypes.STRING,
    limitTime: {
      type: DataTypes.BIGINT,
      field: "limit_time",
      defaultValue: 60000
    }
  }, {
    timestamps: false,
    classMethods: {
      associate: (models) => {
      },
      delete: function*(item) {
        yield this.destroy({
          where: item,
          force: false
        });
    },
    findById: function*(id) {

      return yield this.find({
        where: {
          id: id,
        }
      });
    }
    }
  });
  return innersession;
}
