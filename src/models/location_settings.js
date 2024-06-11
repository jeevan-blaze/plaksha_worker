const { DataTypes } = require("sequelize");

exports.getSchema = function(Location,User) {
  return {
    id: { type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true },
    location_id:{type: DataTypes.CHAR(36),unique:true,references:{model:Location,key:'location_id',as:'location_id'},onDelete: 'CASCADE'},
    user_id:{type: DataTypes.CHAR(36),references:{model:User,key:'user_id',as:'user_id'},onDelete: 'CASCADE'},
    temp_in:{ type: DataTypes.STRING(10), defaultValue: '0' },
    cost_in:{ type: DataTypes.STRING(10), defaultValue: '$' },
    energy_in:{ type: DataTypes.STRING, defaultValue: '0$$0$$0$$0' },
    funit_in:{ type: DataTypes.STRING(10), defaultValue: '0' },
    env_in:{ type: DataTypes.STRING(10), defaultValue: '0' },
    hc_date: {type: DataTypes.STRING,defaultValue: '0$$0'},
    created_at:{ type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  };
};

exports.getTableName = function(){
  return {
    indexes:[{
      name:'unique_keys_index',
      unique:true,
      index:true,
      fields:['location_id','user_id']
    }],
    tableName:'location_settings',
  }
};