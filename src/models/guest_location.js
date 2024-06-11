
const { Sequelize, DataTypes } = require("sequelize");

exports.getSchema = function(Locations,GuestUser) {
  return {
    id: {type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true },
    guest_id: { type: DataTypes.CHAR(36), notNull:true,references: {model:GuestUser,key: 'guest_id',as:'guest_id'},onDelete: 'CASCADE'},
    location_id:{type: DataTypes.CHAR(36),notNull:true,references: {model:Locations,key: 'location_id',as:'Locations'},onDelete: 'CASCADE'},
    access:{type: DataTypes.STRING, defaultValue:'0:0:0'},
    devices:{type: DataTypes.JSON, defaultValue:null},
    is_active:{type:DataTypes.BOOLEAN,defaultValue:true},
    created_date: {type: DataTypes.DATE, defaultValue: Sequelize.NOW}
  };
};

exports.getTableName = function(){
  return {
    
    tableName:'guest_locations_details'
  };
};
