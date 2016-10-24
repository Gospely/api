var Sequelize = require("sequelize");
var dnspod = require('../server/dnspod')
var config =  require('../configs')

module.exports = function(sequelize, DataTypes){
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
      sub: DataTypes.BOOLEAN,
      isDeleted: { type: DataTypes.INTEGER, field: "isdeleted", defaultValue: 0 },
	  },{
			timestamps: true,
      createdAt: 'createat',
      updatedAt: 'updateat',
      classMethods:{
          associate: (models) => {
                  },
          create : function *(domain){

            console.log(dnspod);
            var options = {
                method: 'recordCreate',
                opp: 'recordCreate',
                param: {
                      domain: config.dnspod.baseDomain,
                      sub_domain: domain.domain,
                      record_type: 'A',
                      record_line: '默认',
                      value:  domain.ip,
                      mx: '10'
                }
            }
            var data = yield dnspod.domainOperate(options);
            try {
              domain.record = data.record.id
            } catch (e) {
              throw e;
            }
            var row = this.build(domain);
            return yield row.save();
          },
          delete: function* (id) {


          }
      }
    });
    return domain;
}
