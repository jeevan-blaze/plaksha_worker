const { Sequelize, DataTypes } = require("sequelize");

exports.getSchema = function() {
  return {
    uuid: { type: DataTypes.CHAR(36),primaryKey: true,defaultValue: DataTypes.UUIDV4 },
    company_name:{type: DataTypes.STRING,notNull:true},
    logo:{type: DataTypes.STRING,defaultValue:null},
    color:{type: DataTypes.STRING,defaultValue:'#19bed4'},
    is_active:{type:DataTypes.BOOLEAN,defaultValue:true},
    deleted_at:{ type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    created_at:{ type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  };
};

exports.getTableName = function(){
  return {
    indexes:[{
      name:'unique_keys_index',
      unique:true,
      fields:['company_name','is_active']
    }],
    tableName:'company_details',
  }
};