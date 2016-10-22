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
      open: {type: DataTypes.BOOLEAN,  field: "open", defaultValue: false},
      isDeleted: { type: DataTypes.INTEGER, field: "isdeleted", defaultValue: 0 }
	  },{
			timestamps: true,
      createdAt: 'createat',
      updatedAt: 'updateat',
      classMethods:{
          associate: (models) => {
                      console.log("associate");
                  },
          getAll: function* (item) {

            function check(groups,group) {


                for (var i = 0; i < groups.length; i++) {

                    if(groups[i] == group){

                      return true;
                    }
                }
                return false;
            }

            console.log(item);
            var group = item.groups;
            delete item['groups'];

            item.isDeleted = 0;
            //判断是否是分页
            console.log(item);
            var privileges;
            if(item.cur != null && item.cur != undefined){

                var offset = (item.cur-1)*item.limit;
                var limit = item.limit;
                var attributes = [];
                //判断是否是选择行查询
                if(item.show != null && item.show != undefined && item.show != ''){
                    attributes = item.show.split('_');
                    delete item['cur'];
                    delete item['limit'];
                    delete item['show'];



                    privileges =  yield this.findAll({
                                              offset: offset,
                                              limit: limit,
                                              where: item,
                                              attributes: attributes,
                                              order: [
                                                      ['createat', 'DESC']
                                                    ]
                                            });

                }else{

                  delete item['limit'];
                  delete item['cur'];
                  console.log("wwwwww");
                  privileges =  yield this.findAll({
                                            offset: offset,
                                            limit: limit,
                                            where: item,
                                            order: [
                                                    ['createat', 'DESC']
                                                  ]
                                          });
                }

            }else{
                console.log(item.show);
                if(item.show != null && item.show != undefined && item.show != ''){
                    attributes = item.show.split('_');
                    delete item['show'];
                    privileges = yield this.findAll({
                                              where:item,
                                              attributes: attributes,
                                              order: [
                                                      ['createat', 'DESC']
                                                    ]
                                            });
                }else{

                  console.log("no page ,no selec");
                  privileges =  yield this.findAll({
                                            where:item,
                                            order: [
                                                    ['createat', 'DESC']
                                                  ]
                                          });


              }
            }
            if(group != null && group != undefined && group != ''){
              for (var i = 0; i < privileges.length; i++) {
                  privileges[i].open = check(privileges[i].groups.split("_"),group);
              }
            }

            return privileges;
          },
          count: function* (item) {

            delete item['groups'];
            return  yield this.findAll({
                                        where: item,
                                        attributes: [[sequelize.fn('COUNT', sequelize.col('id')), 'all']]
                                      });
          },
          modify: function* (item) {

              console.log(item);
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

                  if(item.operate == 'close'){
                      var privilege = yield this.findById(item.id);
                      var privileges= privilege.groups.split('_');
                      var temp = new Array();

                      for(var i = 0; i <= privileges.length-1; i++){

                          if(item.groups != privileges[i]){
                              temp.push(privileges[i]);
                          }
                      }
                      item.groups = buildGrups(temp);

                  }
                  if(item.operate == 'open'){

                      var privilege = yield this.findById(item.id);
                      var privileges= privilege.groups.split('_');
                      privileges.push(item.groups);
                      item.groups = buildGrups(privileges);
                  }
              }
              delete item['operate'];
              return yield this.update(item,{where:{id:item.id } });
          }
      }
    });
    return privilege;
}
