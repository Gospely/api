var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes){
    const config = sequelize.define("gospel_users", {
			id: {
				type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
				primaryKey: true
			},
	    name: DataTypes.STRING,
      appid: DataTypes.STRING,
      appsecret: DataTypes.STRING,
      accessToken: { type: DataTypes.STRING, field: "access_token" },
      isDeleted: { type: DataTypes.INTEGER, field: "isdeleted", defaultValue: 0 }
	  },{
			timestamps: true,
      createdAt: 'createat',
      updatedAt: 'updateat',
      classMethods:{
          associate: (models) => {
                      console.log("associate");
                  },
          isBind: function *(user){

          }
      }
    });
    return config;
}
