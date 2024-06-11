const { Sequelize, DataTypes } = require("sequelize");

exports.getSchema = function(Locations,UserDetails) {
  return {
    room_id: { type: DataTypes.CHAR(36),primaryKey: true,defaultValue:DataTypes.UUIDV4 },
    user_id: {type: DataTypes.CHAR(36),notNull: true,references: {model: UserDetails,key: 'user_id',as: 'userId'},onDelete: 'CASCADE'},
    room_name:{type: DataTypes.STRING,notNull:true},
    room_desc:{type: DataTypes.STRING, defaultValue: null},
    location_id:{type: DataTypes.CHAR(36),notNull:true,references: {model:Locations,key: 'location_id',as:'Locations'},onDelete: 'CASCADE'},
    room_type:{type: DataTypes.INTEGER,defaultValue:0},
    is_default:{type:DataTypes.BOOLEAN,defaultValue:false},
    is_active:{type:DataTypes.BOOLEAN,defaultValue:true},
    created_at:{ type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    sortid:{ type: DataTypes.INTEGER}
  };
};

exports.getTableName = function(){
  return {
    indexes:[{
      name:'unique_keys_index',
      unique:true,
      fields:['room_name','location_id','is_active','is_default']
    }],
    tableName:'location_rooms',
  }
};