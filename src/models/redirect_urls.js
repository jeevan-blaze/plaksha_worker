const { Sequelize, DataTypes } = require("sequelize");

exports.getSchema = function(ClientDetails) {
  return {
    id: { type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true },
    client_id:{type: DataTypes.INTEGER ,references: {model:ClientDetails,key: 'id',as:'ClientDetails'},onDelete: 'CASCADE'},
    redirect_url:{type: DataTypes.STRING,defaultValue:'/'},
    is_active:{type:DataTypes.BOOLEAN,defaultValue:true},
    deleted_at:{ type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    created_at:{ type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  };
};

exports.getTableName = function(){
  return {
    tableName:'redirect_info_details',
  }
};