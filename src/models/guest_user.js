
const { Sequelize, DataTypes } = require("sequelize");

exports.getSchema = function(UserDetails) {
  return {
    guest_id: { type: DataTypes.CHAR(36), primaryKey: true, defaultValue: Sequelize.UUIDV4 },
    user_id: {type: DataTypes.CHAR(36),notNull: true,references: {model: UserDetails,key: 'user_id',as: 'userId'},onDelete: 'CASCADE'},
    parent_user_id: {type: DataTypes.CHAR(36),notNull: true,references: {model: UserDetails,key: 'user_id',as: 'userId'},onDelete: 'CASCADE'},
    action_type:{type: DataTypes.STRING, defaultValue:"0"},
    start:{type: DataTypes.BIGINT, defaultValue:0},
    end:{type: DataTypes.BIGINT, defaultValue:0},
    is_active:{type:DataTypes.BOOLEAN,defaultValue:true},
    created_date: {type: DataTypes.DATE, defaultValue: Sequelize.NOW}
  };
};

exports.getTableName = function(){
  return {
    indexes:[{
      name:'keys_index',
      index:true,
      fields:['guest_id','user_id']
    }],
    tableName:'guest_users'
  };
};
