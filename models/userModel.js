var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes){
    const user = sequelize.define("gospel_users", {
			id: {
				type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
				primaryKey: true
			},
	    name: DataTypes.STRING,
      phone: DataTypes.STRING,
      password: DataTypes.STRING,
      type: DataTypes.STRING,
      team: DataTypes.STRING,
      group: DataTypes.STRING,
      company: DataTypes.STRING,
      qq: DataTypes.STRING,
      photo: DataTypes.STRING,
      wechat: DataTypes.STRING,
      workspace: DataTypes.STRING,
      isDeleted: { type: DataTypes.INTEGER, field: "isdeleted", defaultValue: 0 },
      isBlocked: {type: DataTypes.INTEGER, field: "isblocked", defaultValue: 0 }
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
    return user;
}
