const { Sequelize, DataTypes } = require("sequelize");

exports.getSchema = function() {
  return {
    id: { type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true },
    service_name:{type: DataTypes.STRING,notNull:true},
    is_active:{type:DataTypes.BOOLEAN,defaultValue:true},
    deleted_at:{ type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    created_at:{ type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  };
};

exports.getTableName = function(){
  return {
    indexes:[{
      name:'unique_keys_index',
      unique:true,
      fields:['service_name','is_active']
    }],
    tableName:'thirdparty_services',
  }
};