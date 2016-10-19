var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes){
    const privilege = sequelize.define("gospel_privileges", {
			id: {
				type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
				primaryKey: true
			},
	    name: DataTypes.STRING,
      router: DataTypes.STRING,
      method: DataTypes.STRING,
      groups: DataTypes.STRING,
      isDeleted: { type: DataTypes.INTEGER, field: "isdeleted", defaultValue: 0 }
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
    return privilege;
}
