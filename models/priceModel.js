var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes){
    const prices = sequelize.define("gospel_prices", {
			id: {
				type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
				primaryKey: true
			},
	    price: DataTypes.DOUBLE,
      time: DataTypes.STRING,
      unit: DataTypes.STRING,
      target: DataTypes.STRING,
      type: DataTypes.STRING,
      isDeleted: { type: DataTypes.INTEGER, field: "isdeleted", defaultValue: 0 },
	  },{
			timestamps: true,
      createdAt: 'createat',
      updatedAt: 'updateat',
      classMethods:{
          associate: (models) => {
                  },
          isBind: function *(user){

          }
      }
    });
    return prices;
}
