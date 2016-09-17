var Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes){
    return sequelize.define("gospel_users", {
			id: {
				type: DataTypes.STRING,
				primaryKey: true
			},
	    name: DataTypes.STRING
	  },{
			timestamps: false,
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
}
