
const { Sequelize, DataTypes } = require("sequelize");

exports.getSchema = function(User,LoginType,SuperLocation) {
  return {
    location_id: { type: DataTypes.CHAR(36), primaryKey: true, defaultValue: Sequelize.UUIDV4 },
    user_id:{ type: DataTypes.CHAR(36),notNull:true,references: {model:User,key: 'user_id',as:'User'},onDelete: 'CASCADE'},
    location_name: {type: DataTypes.STRING,defaultValue:"" },
    location_type: {type: DataTypes.STRING,defaultValue:"" },
    location_sqft: {type: DataTypes.STRING,defaultValue:"" },
    lon:{type: DataTypes.STRING,defaultValue:"" },
    lat:{type: DataTypes.STRING,defaultValue:"" },
    login_type:{ type: DataTypes.INTEGER,references: {model:LoginType,key: 'id',as:'loginType'},onDelete: 'CASCADE'},
    loc_id:{ type: DataTypes.CHAR(36),references: {model:SuperLocation,key: 'loc_id',as:'SuperLocation'},onDelete: 'CASCADE'},
    is_active:{type:DataTypes.BOOLEAN,defaultValue:true},
    created_date: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
    sortid:{ type: DataTypes.INTEGER}
  };
};

exports.getTableName = function(){
  return {
    indexes:[{
      name:'unique_keys_index',
      unique:true,
      fields:['user_id','location_name','login_type','loc_id','is_active']
    },{
      name:'keys_index',
      index:true,
      fields:['location_id','user_id','is_active']
    }],
    tableName:'locations_details'
  };
};
