var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes){
    const config = sequelize.define("gospel_dockers_configs", {
			id: {
				type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
				primaryKey: true
			},
	    name: DataTypes.STRING,
      memory: DataTypes.STRING,
      memoryUnit: { type: DataTypes.STRING, field:"memory_unit" },
      cup: DataTypes.STRING,
      cpuType: { type: DataTypes.STRING, field: "cpu_type" },
      free: DataTypes.BOOLEAN,
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
    return config;
}
