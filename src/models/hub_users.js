const { Sequelize, DataTypes } = require("sequelize");

exports.getSchema = function(User,Hubs) {
  return {
    id: {type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true },
    user_id:{type: DataTypes.CHAR(36),notNull:true,references: {model:User,key: 'user_id',as:'User'},onDelete: 'CASCADE'},
    hub_id:{type: DataTypes.CHAR(36),notNull:true,references: {model:Hubs,key: 'id',as:'Hubs'},onDelete: 'CASCADE'},
    user_type:{type: DataTypes.STRING, defaultValue: 1},
    hub_type:{type:DataTypes.INTEGER,defaultValue:0},
    parent_id:{type: DataTypes.CHAR(36),defaultValue:null,references: {model:User,key: 'user_id',as:'User'},onDelete: 'CASCADE'},
    is_active:{type:DataTypes.BOOLEAN,defaultValue:true},
    deleted_at:{ type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')},
    created_at:{ type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')},
  };
};

exports.getTableName = function(){
  return {
    tableName:'hubs_users',
  }
};