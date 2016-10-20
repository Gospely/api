var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes){
    const privilege = sequelize.define("gospel_privileges", {
			id: {
				type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
				primaryKey: true
			},
	    name: DataTypes.STRING,
      router: DataTypes.STRING,
      method: DataTypes.STRING,
      groups: DataTypes.STRING,
      isDeleted: { type: DataTypes.INTEGER, field: "isdeleted", defaultValue: 0 }
	  },{
			timestamps: true,
      createdAt: 'createat',
      updatedAt: 'updateat',
      classMethods:{
          associate: (models) => {
                      console.log("associate");
                  },
          getAllInit: function(item) {
              console.log(item);
              return "SELECT * FROM gospel_privileges where groups like '%"+ item.group +"_%' or groups " + "like '%"+item.group+"_%'";
          },
          countInit: function(item) {

              return "SELECT count(id) FROM gospel_privileges where groups like '%" + item.group + "_%' or groups " + "like '%"+item.group+"_%'";
          },
          modify: function* (item) {

              function buildGrups(arr){
                  var str = '';
                  for(var i = 0; i<=arr.length - 1; i++){
                      if(str != ''){
                        str = str +"_" + arr[i];
                      }else{
                        str = arr[i];
                      }

                  }
                  return str;
              }
              if(item.operate != null && item.operate != undefined && item.operate != ''){

                  if(item.operate == 'delete'){
                      var privilege = yield this.findById(item.privilege);
                      var privileges= privilege.groups.split('_');
                      var temp = new Array();

                      for(var i = 0; i <= privileges.length-1; i++){

                          if(item.group != privileges[i]){
                              temp.push(privileges[i]);
                          }
                      }
                      item.group = buildGrups(temp);

                  }
                  if(item.operate == 'delete'){

                      var privilege = yield this.findById(item.privilege);
                      var privileges= privilege.groups.split('_');
                      privileges.push(item.group);
                      item.group = buildGrups(item.group);
                  }
              }
              delete item['operate'];
              return yield this.update(item,{where:{id:item.id } });
          }
      }
    });
    return privilege;
}
