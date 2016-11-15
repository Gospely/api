var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes) {
  const order = sequelize.define("gospel_orders", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    products: DataTypes.STRING,
    application: DataTypes.STRING,
    name: DataTypes.STRING,
    price: DataTypes.DOUBLE,
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
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
      },
      //最近7天的订单数
      orders_count: function*(item) {
        console.log(item);
        var sql =
        "select count( * ) count, type, to_char(createat, 'yyyy-MM-dd') str from gospel_orders where createat >= current_timestamp-interval '7 day' and createat <= current_timestamp group by str,type";
        if (sql != null && sql != undefined) {
          console.log(sql);
          console.log(item);
          var data = yield sequelize.query(sql);
          console.log(data);
          return data;
        }
      },
      //今日收益
      today_profit:function*(item){
        console.log(item);
        var sql =
        "select sum( price ) from gospel_orders where createat >= current_timestamp-interval '1 day' and createat <= current_timestamp";
        if (sql != null && sql != undefined) {
          console.log(sql);
          console.log(item);
          var data = yield sequelize.query(sql);
          console.log(data);
          return data;
        }
      },
      //昨日收益
      yesterday_profit:function*(item){
        console.log(item);
        var sql =
        "select sum( price ) from gospel_orders where createat >= current_timestamp-interval '2 day' and createat <= current_timestamp-interval '1 day'";
        if (sql != null && sql != undefined) {
          console.log(sql);
          console.log(item);
          var data = yield sequelize.query(sql);
          console.log(data);
          return data;
        }
      },
      //今日新增订单
      today_orders:function*(item){
        console.log(item);
        var sql =
        "select count(*) from gospel_orders where createat >= current_timestamp-interval '1 day' and createat <= current_timestamp-interval '0 day'";
        if (sql != null && sql != undefined) {
          console.log(sql);
          console.log(item);
          var data = yield sequelize.query(sql);
          console.log(data);
          return data;
        }
      },
      //昨日新增订单
      yesterday_orders:function*(item){
        console.log(item);
        var sql =
        "select count(*) from gospel_orders where createat >= current_timestamp-interval '2 day' and createat <= current_timestamp-interval '1 day'";
        if (sql != null && sql != undefined) {
          console.log(sql);
          console.log(item);
          var data = yield sequelize.query(sql);
          console.log(data);
          return data;
        }
      }

    }
  });
  return order;
}
