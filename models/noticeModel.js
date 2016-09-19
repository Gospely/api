var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes){
    const notice = sequelize.define("gospel_notices", {
			id: {
				type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
				primaryKey: true
			},
	    title: DataTypes.STRING,
      content: DataTypes.STRING,
      receiver: DataTypes.STRING,
      type: DataTypes.STRING,
      sender: DataTypes.STRING,
      teams: DataTypes.STRING,
      userType: { type: DataTypes.STRING, field: "user_type" },
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
    return notice;
}
