var Sequelize = require("sequelize");
module.exports = function(sequelize, DataTypes){
    const group = sequelize.define("gospel_groups", {
			id: {
				type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4 ,
				primaryKey: true
			},
	    name: DataTypes.STRING,
      type: DataTypes.STRING,
      privileges: DataTypes.JSONB                       ,
      isDeletted: { type: DataTypes.INTEGER, field: "isdeleted", defaultValue: 0 }
	  },{
			timestamps: true,
      createdAt: 'createat',
      updatedAt: 'updateat',
        classMethods:{
          
            getAll: function*(){
                console.log(1)
                return yield this.findAll();
            },
            findById: function*(id) {
                console.log(id);
                return yield this.find({where:{id:id}});
            },
            add: function*(user){
                var row = this.build(user);
                return yield row.save();
            }
        }
    });
    return group;
}
