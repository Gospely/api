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
            associate: (models) => {
                       console.log("associate");
                     }
        }
    });
    return group;
}
