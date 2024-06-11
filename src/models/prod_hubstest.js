const { Sequelize, DataTypes } = require("sequelize");

exports.getSchema = function(User) {
  return {
    id: { type: DataTypes.CHAR(36),primaryKey: true,defaultValue:DataTypes.UUIDV4 },
    user_id:{type: DataTypes.CHAR(36),notNull:true,references: {model:User,key: 'user_id',as:'User'},onDelete: 'CASCADE'},
    hub_id:{type: DataTypes.STRING,notNull:true},
    hub_type:{type:DataTypes.INTEGER,defaultValue:0},
    data:{type:DataTypes.JSON},
    created_at:{type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')},
  };
};

exports.getTableName = function(){
  return {
    tableName:'prod_testing_hubs',
  }
};