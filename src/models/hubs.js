const { Sequelize, DataTypes } = require("sequelize");

exports.getSchema = function(User,Location) {
  return {
    id: { type: DataTypes.CHAR(36),primaryKey: true,defaultValue:DataTypes.UUIDV4 },
    user_id:{type: DataTypes.CHAR(36),notNull:true,references: {model:User,key: 'user_id',as:'User'},onDelete: 'CASCADE'},
    hub_id:{type: DataTypes.STRING,notNull:true},
    hub_type:{type:DataTypes.INTEGER,defaultValue:0},
    model:{type: DataTypes.STRING, defaultValue: 0},
    date_of_mfg:{type: DataTypes.STRING, defaultValue: 0},
    software_version:{type: DataTypes.STRING, defaultValue: 0},
    software_date:{type: DataTypes.STRING, defaultValue: 0},
    password:{type: DataTypes.STRING, defaultValue: 0},
    state:{type: DataTypes.STRING, defaultValue: 1},
    state_date:{type: DataTypes.DATE, defaultValue: DataTypes.NOW},
    location_id:{type: DataTypes.CHAR(36),notNull:true,references: {model:Location,key: 'location_id',as:'Location'},onDelete: 'CASCADE'},
    is_active:{type:DataTypes.BOOLEAN,defaultValue:true},
    created_at:{type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')},
    deleted_at:{type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')},
  };
};

exports.getTableName = function(){
  return {
    indexes:[{
      name:'unique_keys_index',
      unique:true,
      fields:['hub_id','hub_type','model','is_active']
    },{
      name:'keys_index',
      index:true,
      fields:['user_id','is_active','location_id']
    }],
    tableName:'hubs'
  }
};