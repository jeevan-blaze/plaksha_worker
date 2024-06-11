const { Sequelize, DataTypes } = require("sequelize");

exports.getSchema = function() {
  return {
    id: { type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true },
    device_name:{type: DataTypes.STRING,notNull:true},
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
      fields:['device_name','is_active']
    }],
    tableName:'device_types',
  }
};