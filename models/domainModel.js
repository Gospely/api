var Sequelize = require("sequelize");
var dnspod = require('../server/dnspod')
var config = require('../configs')

module.exports = function(sequelize, DataTypes) {
  const domain = sequelize.define("gospel_domains", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    domain: DataTypes.STRING,
    ip: DataTypes.STRING,
    creator: DataTypes.STRING,
    application: DataTypes.STRING,
    record: DataTypes.STRING,
    subDomain: {
      type: DataTypes.STRING,
      field: "sub_domain"
    },
    sub: DataTypes.BOOLEAN,
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
      associate: (models) => {},
      create: function*(domain) {

        var options = {
          method: 'recordCreate',
          opp: 'recordCreate',
          param: {
            domain: config.dnspod.baseDomain,
            sub_domain: domain.subDomain,
            record_type: 'A',
            record_line: '默认',
            value: domain.ip,
            mx: '10'
          }
        }

        try {
          var data = yield dnspod.domainOperate(options);
          if (data.status.code == '1') {
            domain.record = data.record.id;
            var row = this.build(domain);
            return {
              code: 'success',
              message: yield row.save()
            };
          } else {
            return {
              code: 'failed',
              message: data.status.message
            };
          }

        } catch (e) {
          return "failed";
        }

      }

    }
  });
  return domain;
}
