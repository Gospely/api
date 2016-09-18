var Sequelize = require("sequelize");
var Group = require("./GroupModel");

module.exports = function(sequelize, DataTypes){
    const user=sequelize.define("gospel_users", {
			id: {
				type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4 ,
				primaryKey: true
			},
	    name: DataTypes.STRING,
      type: DataTypes.STRING,
      team: DataTypes.STRING,
      group:  {
          type: DataTypes.STRING,
          references: {
            model: Group,
            key: 'id'
          }
          },
      company: DataTypes.STRING,
      qq: DataTypes.STRING,
      photo: DataTypes.STRING,
      wechat: DataTypes.STRING,
      workspace: DataTypes.STRING,
      isDeletted: { type: DataTypes.INTEGER, field: "isdeleted", defaultValue: 0 },
      isBlocked: {type: DataTypes.INTEGER, field: "isblocked", defaultValue: 0 }
	  },{
			timestamps: true,
      createdAt: 'createat',
      updatedAt: 'updateat',
      classMethods:{
           associate: (models) => {
                      console.log("associate");
                  },
          loadAll: function*(){
              return this.findAll({
                include: [
                  { model: Group }
                ]
              });
          },
          create: function*(group){
              var row = this.build(group);
              return yield row.save();
          }
      }
    });

    return user;
}
