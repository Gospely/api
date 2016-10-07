var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes){
    const volumes_config = sequelize.define("gospel_volumes_configs", {
			id: {
				type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
				primaryKey: true
			},
	    name: DataTypes.STRING,
      icon: DataTypes.STRING,
      max: DataTypes.INTEGER,
      min: DataTypes.INTEGER,
      freeSize: { type: DataTypes.INTEGER, field: "free_size", defaultValue: 5 },
      unit: DataTypes.STRING,
      price: DataTypes.DOUBLE,
      time: DataTypes.INTEGER,
      timeUnit:{ type: DataTypes.STRING, field: "time_unit" },
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
    return volumes_config;
}
