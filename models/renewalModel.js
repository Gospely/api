var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes){
    const renewal = sequelize.define("gospel_package_renewals", {
			id: {
				type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
				primaryKey: true
			},
	    product: DataTypes.STRING,
      price: DataTypes.DOUBLE,
      time: DataTypes.INTEGER,
      unit: DataTypes.STRING,
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
    return renewal;
}
