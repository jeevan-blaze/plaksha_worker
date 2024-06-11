const { Sequelize, DataTypes } = require("sequelize");

exports.getSchema = function(User) {
  return {
    id: { type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true},
    device_type:{type:DataTypes.INTEGER,defaultValue:0},
    title:{type: DataTypes.STRING,notNull:true},
    description:{type: DataTypes.STRING(5000),notNull:true},
    version:{type: DataTypes.STRING,notNull:true},
    force:{type:DataTypes.BOOLEAN,defaultValue:true},
    type:{type:DataTypes.INTEGER,defaultValue:0},
    is_active:{type:DataTypes.BOOLEAN,defaultValue:true},
    created_at:{type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')},
  };
};

exports.getTableName = function(){
  return {
    indexes:[{
      name:'unique_keys_index',
      unique:true,
      fields:['device_type','version','is_active','type']
    }],
    tableName:'firmware_details',
  }
};