const { Sequelize, DataTypes } = require("sequelize");

exports.getSchema = function(Hubs) {
  return {
    id: { type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true },
    hub_id:{type: DataTypes.CHAR(36),notNull:true,references: {model:Hubs,key: 'id',as:'Hubs'},onDelete: 'CASCADE'},
    name:{type: DataTypes.STRING, defaultValue: 'hub'},
    ssid:{type: DataTypes.STRING, defaultValue: 0},
    desc:{type: DataTypes.STRING, defaultValue: null},
    lon:{type: DataTypes.STRING, defaultValue: null},
    lat:{type: DataTypes.STRING, defaultValue: null},
    address:{type: DataTypes.STRING, defaultValue: null},
    zip:{type: DataTypes.STRING, defaultValue: null},
    state:{type: DataTypes.STRING, defaultValue: null},
    city:{type: DataTypes.STRING, defaultValue: null},
  };
};
exports.getTableName = function(){
  return {
    tableName:'hub_defination',
  }
};