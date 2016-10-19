var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes){
    const innersession = sequelize.define("gospel_innersessions", {
			id: {
				type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
				primaryKey: true
			},
	    code: DataTypes.STRING,
      creator: DataTypes.STRING,
      group: DataTypes.STRING,
      time: DataTypes.BIGINT,
      limitTime: { type: DataTypes.BIGINT, field: "limit_time", defaultValue: 60000}
	  },{
			timestamps: false,
      classMethods:{
          associate: (models) => {
                      console.log("associate");
                  },
          delete: function*(item) {
              item.destroy({
                force: false,
                logging: true
              });
          }
      }
    });
    return innersession;
}
