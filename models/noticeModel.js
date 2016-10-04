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
                  },
          getAllInit: function() {
              return 'SELECT * FROM gospel_notices a left join gospel_notice_read b on a.id = b.notice_id and a.isdeleted = 0 WHERE user_id = :user and b.read = :read';
          },
          countInit: function() {
              return 'SELECT count(a.id) as all FROM gospel_notices a left join gospel_notice_read b on a.id = b.notice_id and a.isdeleted = 0 WHERE user_id = :user ';
          }

      }
    });
    return notice;
}
