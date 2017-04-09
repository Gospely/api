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

          if(item.application){
               return 'SELECT application, name, id, src, creator, url, author, price, description, t_type as type from gospel_templates where application=:application';
          }
          if(!item.type && !item.owner && !item.price){
               return 'select a.application, a.name, a.id, a.src, a.creator, a.url, a.author, a.price, a.description, a.t_type as type, b.status from gospel_templates as a left join (select * from gospel_orders where creator=:creator and isdeleted = 0) as b on a.id=b.products where a.isdeleted = 0';
          }
          if(item.owner){
              return 'SELECT a.application, a.name, a.id, a.src, a.creator, a.url, a.author, a.price, a.description, a.t_type as type, b.status from gospel_templates as a left join (select * from gospel_orders where creator=:creator and isdeleted = 0) as b on a.id=b.products where a.creator=:owner and a.isdeleted = 0';
          }
          if(item.type){
              return 'select a.application, a.name, a.id, a.src, a.creator, a.url, a.author, a.price, a.description, a.t_type as type, b.status from gospel_templates as a left join (select * from gospel_orders where creator=:creator and isdeleted = 0) as b on a.id=b.products where t_type=:type and a.isdeleted = 0';
          }
          if(item.price){
              return 'select a.application, a.name, a.id, a.src, a.creator, a.url, a.author, a.price, a.description, a.t_type as type, b.status from gospel_templates as a left join (select * from gospel_orders where creator=:creator and isdeleted = 0) as b on a.id=b.products where a.price=:price and a.isdeleted = 0';
          }


      },
      countInit: function(item) {

          if(item.application){
              return 'SELECT count(id) as all  from gospel_templates where application=:application and a.isdeleted = 0' ;
          }
          if(!item.type && !item.owner && !item.price){
               return 'SELECT count(a.id) as all  from gospel_templates as a left join (select * from gospel_orders where creator=:creator and isdeleted = 0) as b on a.id=b.products where a.isdeleted = 0';
          }
          if(item.owner){
              return 'SELECT count(a.id) as all  from gospel_templates as a left join (select * from gospel_orders where creator=:creator and isdeleted = 0) as b on a.id=b.products where a.creator=:owner and a.isdeleted = 0';
          }
          if(item.type){
              return 'SELECT count(a.id) as all  from gospel_templates as a left join (select * from gospel_orders where creator=:creator and isdeleted = 0) as b on a.id=b.products where t_type=:type and a.isdeleted = 0';
          }
          if(item.price){
              return 'SELECT count(a.id) as all  from gospel_templates as a left join (select * from gospel_orders where creator=:creator and isdeleted = 0) as b on a.id=b.products where a.price=:price and a.isdeleted = 0';
          }
      }
    }
  });
  return templates;
}
