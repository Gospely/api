var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes) {
  const templates = sequelize.define("gospel_templates", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    content: DataTypes.STRING,
    name: DataTypes.STRING,
    status: DataTypes.INTEGER,
    creator: DataTypes.STRING,
    application: DataTypes.STRING,
    description: DataTypes.STRING,
    price: DataTypes.DOUBLE,
    url: DataTypes.STRING,
    src: DataTypes.STRING,
    author: DataTypes.STRING,
    type: {
      type: DataTypes.STRING,
      field: "t_type"
    },
    createat:{
        type: DataTypes.DATE,
    },
    updateat: {
        type: DataTypes.DATE,
    },
    isDeleted: {
      type: DataTypes.INTEGER,
      field: "isdeleted",
      defaultValue: 0
    }
  }, {
    timestamps: false,
    createdAt: 'createat',
    updatedAt: 'updateat',
    classMethods: {
      associate: (models) => {
      },
      isBind: function*(user) {

      },
      getAllInit(item) {
          console.log(item);
          if(!item.type){
               return 'select a.name, a.id, a.src, a.creator, a.url, a.author, a.price, a.description, a.t_type as type, b.status from gospel_templates as a left join (select * from gospel_orders where creator=:creator) as b on a.id=b.products';
          }else {
               return 'select a.name, a.id, a.src, a.creator, a.url, a.author, a.price, a.description, a.t_type as type, b.status  from gospel_templates as a left join (select * from gospel_orders where creator=:creator) as b on a.id=b.products where t_type=:type';
          }

      },
      countInit: function(item) {

          if(!item.type){
               return 'SELECT count(a.id) as all  from gospel_templates as a left join (select * from gospel_orders where creator=:creator) as b on a.id=b.products';
          }else if(item.owner){
              return 'SELECT count(a.id) as all  from gospel_templates as a left join (select * from gospel_orders where creator=:creator) as b on a.id=b.products where a.creator=:owner';
          }else {
              return 'SELECT count(a.id) as all  from gospel_templates as a left join (select * from gospel_orders where creator=:creator) as b on a.id=b.products where t_type=:type';
          }
12      }
    }
  });
  return templates;
}
