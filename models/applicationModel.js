var Sequelize = require("sequelize");
var dnspod = require('../server/dnspod')

module.exports = function(sequelize, DataTypes){
    const application=sequelize.define("gospel_applications", {
			id: {
				type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
				primaryKey: true
			},
	    name: DataTypes.STRING,
      port: DataTypes.STRING,
      sshPort: { type: DataTypes.STRING, field: 'ssh_port'},
      socketPort: { type: DataTypes.STRING, field: 'socket_port'},
      source: DataTypes.STRING,
      domain: DataTypes.STRING,
      docker: DataTypes.STRING,
      members: DataTypes.JSONB,
      team:DataTypes.STRING,
      creator: DataTypes.STRING,
      status: { type: DataTypes.INTEGER, field: "status", defaultValue: 0 },
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
    return application;
}
