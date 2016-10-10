var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes){
    const ide = sequelize.define("gospel_ides", {
			id: {
				type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
				primaryKey: true
			},
	    name: DataTypes.STRING,
      product: DataTypes.STRING,
      creator: DataTypes.INTEGER,
      volume: DataTypes.STRING,
      expireAt: { type: DataTypes.STRING, field: "expireat" },
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
    return ide;
}
