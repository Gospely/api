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
    gitUser: {
      type: DataTypes.STRING,
      field: "git_user",
    },
    gitEmail: {
      type: DataTypes.STRING,
      field: "git_email",
    },
    gitPassword: {
      type: DataTypes.STRING,
      field: "git_password",
    },
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
    },
    updateat: {
        type: DataTypes.DATE,
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
      },
      getAllInit(item){

          if (item.type == "deployfast") {
            return "SELECT * FROM gospel_applications where image in (select id from gospel_images where type='application' and isdeleted=0) and creator = :creator and isdeleted=0";
          } else if(item.parent){

              var sql = "select *  from gospel_applications where image in (select id from gospel_images where parent=:parent and type!='application' and isdeleted=0) and creator = :creator and isdeleted=0";
              for (var key in item) {
                  if(key != 'parent' && key != 'creator'&& key!='isDeleted' && key!= 'limit' && key !='cur'){
                      sql = sql + ' and ' + key + '=:'+key;
                  }
              }
              return sql;
          }else {
              var sql =  "select *  from gospel_applications where  isdeleted=0"
              for (var key in item) {
                  if(key!='isDeleted' && key!= 'limit' && key !='cur' ){
                      sql = sql + ' and ' + key + '=:'+key;
                  }
              }
              return sql;
          }
      },
      countInit(item){
          if (item.type == "deployfast") {
            return "SELECT count(a.id) AS all FROM gospel_applications a LEFT JOIN gospel_images b ON a.image = b.id WHERE creator = :creator AND b.type = 'application' AND a.isdeleted = 0";
          } else if (item.type == 'vd') {
            return "select count(*) as all from (select id from gospel_images where isdeleted=0 and (parent ~ '^vd.?latest' or parent ~ '^hybridapp.?latest' ) )as a inner join (select image from gospel_applications where creator = :creator and isdeleted=0 ) as b on a.id = b.image";
        }else if (item.parent) {
            var sql = "select count(id) as all from gospel_applications where image in (select id from gospel_images where parent=:parent and type!='application' and isdeleted=0) and creator = :creator and isdeleted=0";
            for (var key in item) {
                if(key != 'parent' && key != 'creator' && key!='isDeleted' && key!= 'limit' && key !='cur'){
                    sql = sql + ' and ' + key + '=:'+key;
                }
            }
            return sql;
        }else {

            var sql = "select count(id) as all from gospel_applications where isdeleted=0";
            for (var key in item) {
                if(key!='isDeleted' && key!= 'limit' && key !='cur'){
                    sql = sql + ' and ' + key + '=:'+key;
                }
            }
            console.log(sql);
            return sql;
        }

      }
    }
  });
  return application;
}
