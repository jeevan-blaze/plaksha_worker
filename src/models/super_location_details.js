
const { Sequelize, DataTypes } = require("sequelize");

exports.getSchema = function(User,LoginType) {
  return {
    loc_id: { type: DataTypes.CHAR(36), primaryKey: true, defaultValue: Sequelize.UUIDV4 },
    user_id:{ type: DataTypes.CHAR(36),notNull:true,references: {model:User,key: 'user_id',as:'User'},onDelete: 'CASCADE'},
    location_name: {type: DataTypes.STRING,defaultValue:"" },
    login_type:{ type: DataTypes.INTEGER,references: {model:LoginType,key: 'id',as:'loginType'},onDelete: 'CASCADE'},
    created_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
    sortid:{ type: DataTypes.INTEGER},
    is_active:{type:DataTypes.BOOLEAN,defaultValue:true},
    loc_sort: {type: DataTypes.TEXT,defaultValue: null}
  };
};

exports.getTableName = function(){
  return {
    indexes:[{
      name:'unique_keys_index',
      unique:true,
      fields:['user_id','location_name','login_type','is_active']
    }],
    tableName:'super_locations_details'
  };
};
