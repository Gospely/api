var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes){
    const type = sequelize.define("gospel_types", {
			id: {
				type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4 ,
				primaryKey: true
			},
	    name: DataTypes.STRING,
      description: DataTypes.STRING,
      parent: DataTypes.STRING,
      isDeletted: { type: DataTypes.INTEGER, field: "isdeleted", defaultValue: 0 }
	  },{
			timestamps: true,
      createdAt: 'createat',
      updatedAt: 'updateat',
      classMethods:{
           associate: (models) => {
                      console.log("associate");
                  },
          loadAll: function*(){
              return this.findAll({
                include: [
                  { model: Group }
                ]
              });
          },
          create: function*(type){
              var row = this.build(type);
              return yield row.save();
          }
      }
    });

    return type;
}
