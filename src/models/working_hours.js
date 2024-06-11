const { Sequelize, DataTypes } = require("sequelize");

exports.getSchema = function(User,Device) {
  return {
    id: { type: DataTypes.CHAR(36),primaryKey: true,defaultValue:DataTypes.UUIDV4 },
    user_id:{type: DataTypes.CHAR(36),notNull:true,references: {model:User,key: 'user_id',as:'User'},onDelete: 'CASCADE'},
    device_id:{type: DataTypes.CHAR(36),notNull:true,references: {model:Device,key: 'device_id',as:'Device'},onDelete: 'CASCADE'},
    mins:{type:DataTypes.INTEGER,notNull:true,defaultValue:1080},
    days:{type:DataTypes.STRING(255),notNull:true,defaultValue:"0111110"},
    created_at:{type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')},
  };
};

exports.getTableName = function(){
  return {
    indexes:[{
      name:'unique_keys_index',
      unique:true,
      index:true,
      fields:['user_id','device_id']
    }],
    tableName:'working_hours',
    timestamps: false,
  }
};