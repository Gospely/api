var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes){
    const company = sequelize.define("gospel_companys", {
			id: {
				type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4 ,
				primaryKey: true
			},
	    name: DataTypes.STRING,
      owner: DataTypes.STRING,
      licencePhoto: { type: DataTypes.STRING, field: "licence_photo" },
      status: DataTypes.INTEGER,
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
    return company;
}
