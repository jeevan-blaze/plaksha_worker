const { Sequelize, DataTypes } = require("sequelize");

exports.getSchema = function() {
  return {
    id: { type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true  },
    country:{type: DataTypes.STRING,defaultValue:null},
    ccode:{type: DataTypes.STRING,defaultValue:null},
    currency:{type: DataTypes.STRING,defaultValue:null},
    code:{type: DataTypes.STRING,defaultValue:null},
    symbol:{type: DataTypes.TEXT,defaultValue:null},
    cost_per_unit:{type: DataTypes.STRING,defaultValue:"0"},
    pcode:{type: DataTypes.STRING,defaultValue:"+1"},
    utc:{type: DataTypes.STRING,defaultValue:"0"},
    region:{type: DataTypes.STRING,defaultValue:"0"}
  };
};

exports.getTableName = function(){
  return {
    tableName:'countries_details',
  }
};
