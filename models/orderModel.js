var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes){
    const order = sequelize.define("gospel_orders", {
			id: {
				type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
				primaryKey: true
			},
	    products: DataTypes.STRING,
      price: DataTypes.DOUBLE,
      status: DataTypes.INTEGER,
      creator: { type: DataTypes.STRING, field: "creater" },
      renewal: DataTypes.INTEGER,
      valueAdded: { type: DataTypes.STRING, field: "value_added" },
      expiredAt: { type: DataTypes.DATE, field: "expiredat" },
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
    return order;
}
