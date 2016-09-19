var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes){
    const value_added = sequelize.define("gospel_value_addeds", {
			id: {
				type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4 ,
				primaryKey: true
			},
	    name: DataTypes.STRING,
      diskSize: { type: DataTypes.DOUBLE, field: "disk_size" },
      price: DataTypes.DOUBLE,
      unit: DataTypes.STRING,
      timeLength: { type: DataTypes.DOUBLE, field: "time_length" },
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
    return value_added;
}
