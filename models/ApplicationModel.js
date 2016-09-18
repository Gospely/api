var Sequelize = require("sequelize");
var Team = require("./TeamModel");
var User = require("./UsersModel");

module.exports = function(sequelize, DataTypes){
    const user=sequelize.define("gospel_applications", {
			id: {
				type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4 ,
				primaryKey: true
			},
	    name: DataTypes.STRING,
      port: DataTypes.STRING,
      sshPort: { type: DataTypes.INTEGER, field: "ssh_port", defaultValue: 21 },
      source: DataTypes.STRING,
      domain: DataTypes.STRING,
      members: DataTypes.STRING,
      team: {
          type: DataTypes.STRING,
          references: {
            model: Team,
            key: 'id'
          }
          },
      creator: {
          type: DataTypes.STRING,
          references: {
            model: User,
            key: 'id'
          }
          },
      isDeletted: { type: DataTypes.INTEGER, field: "isdeleted", defaultValue: 0 }
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
          create: function*(application){
              var row = this.build(application);
              return yield row.save();
          }
      }
    });
    return user;
}
