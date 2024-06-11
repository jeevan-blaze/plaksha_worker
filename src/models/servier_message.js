const { Sequelize, DataTypes } = require("sequelize");

exports.getSchema = function(CompanyDetails) {
  return {
    id: { type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true},
    en_msg:{ type: DataTypes.STRING,defaultValue:''},
    gr_msg:{ type: DataTypes.STRING,defaultValue:''},
    created_at:{type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')},
  };
};

exports.getTableName = function(){
  return {
    tableName:'server_messages'
  }
};
