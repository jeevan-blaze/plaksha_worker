const { Sequelize, DataTypes } = require("sequelize");

exports.getSchema = function(Hubs) {
  return {
    id: {type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true },
    hub_id:{type: DataTypes.CHAR(36),notNull:true,references: {model:Hubs,key: 'id',as:'Hubs'},onDelete: 'CASCADE'},
    ble_mac:{type: DataTypes.STRING, defaultValue: null},
    wifi_mac:{type: DataTypes.STRING, defaultValue: null},
    imei:{type: DataTypes.STRING, defaultValue: null},
    cert_id:{type: DataTypes.STRING, defaultValue: null}
  };
};

exports.getTableName = function(){
  return {
    tableName:'hubs_edge',
  }
};