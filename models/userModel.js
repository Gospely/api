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
    volume: DataTypes.STRING,
    socket_id: DataTypes.STRING,
    sshKey: {
        type: DataTypes.STRING,
        field: 'sshkey'
    },

    volumeSize: {
      type: DataTypes.INTEGER,
      field: 'volume_size'
    },
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

      },
        //获取用户和企业最近7天的数据
      users_count: function*(item) {
        console.log(item);
        var sql =
        "select count( * ) count, type, to_char(createat, 'yyyy-MM-dd') str from gospel_users where createat >= current_timestamp-interval '7 day' and createat <= current_timestamp group by str,type";
        if (sql != null && sql != undefined) {
          console.log(sql);
          console.log(item);
          var data = yield sequelize.query(sql);
          console.log(data);
          return data;
        }
      },
        //获取组织最近7天的数据
      teams_count: function*(item) {
        console.log(item);
        var sql =
        "select count( * ) count,  to_char(createat, 'yyyy-MM-dd') str from gospel_teams where createat >= current_timestamp-interval '7 day' and createat <= current_timestamp group by str";
        if (sql != null && sql != undefined) {
          console.log(sql);
          console.log(item);
          var data = yield sequelize.query(sql);
          console.log(data);
          return data;
        }
      },
      //今日新增用户数
      today_count:function* (item){
        console.log(item);
        var sql =
        "select count( * ) count from gospel_users where createat >= current_timestamp-interval '1 day' and createat <= current_timestamp";
        if (sql != null && sql != undefined) {
          console.log(sql);
          console.log(item);
          var data = yield sequelize.query(sql);
          console.log(data);
          return data;
        }
      },
      //昨日新增用户数
      yesterday_count:function* (item){
        console.log(item);
        var sql =
        "select count( * ) count from gospel_users where createat >= current_timestamp-interval '2 day' and createat <= current_timestamp-interval '1 day' ";
        if (sql != null && sql != undefined) {
          console.log(sql);
          console.log(item);
          var data = yield sequelize.query(sql);
          console.log(data);
          return data;
        }
      },
       //企业用户数
      company_count:function*(item){
        console.log(item);
        var sql =
        "select count( * ) count from gospel_companys";
        if (sql != null && sql != undefined) {
          console.log(sql);
          console.log(item);
          var data = yield sequelize.query(sql);
          console.log(data);
          return data;
        }
      },
      //总用户数，直接用count

      //活跃用户数
      active_count:function*(item){

      },
      //付费用户数
      pay_count:function*(item){
        console.log(item);
        var sql =
        "select count(distinct creator) from  gospel_orders where status=2";
        if (sql != null && sql != undefined) {
          console.log(sql);
          console.log(item);
          var data = yield sequelize.query(sql);
          console.log(data);
          return data;
        }
      },


    }
  });
  return user;
}
