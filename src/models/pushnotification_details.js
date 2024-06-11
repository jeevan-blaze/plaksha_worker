const { Sequelize, DataTypes } = require("sequelize");

exports.getSchema = function(CompanyDetails,DeviceType,LoginType,UserType) {
  return {
    id: { type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true},
    host:{ type: DataTypes.STRING(5000)},
    kid:{ type: DataTypes.STRING},
    iss:{ type: DataTypes.STRING},
    topic:{ type: DataTypes.STRING},
    title:{ type: DataTypes.STRING},
    device_type:{ type: DataTypes.INTEGER,defaultValue:1,references: {model:DeviceType,key: 'id',as:'deviceType'},onDelete: 'CASCADE'},
    login_type:{ type: DataTypes.INTEGER,defaultValue:1,references: {model:LoginType,key: 'id',as:'loginType'},onDelete: 'CASCADE'},
    user_type:{type:DataTypes.INTEGER,defaultValue:4,references: {model:UserType,key: 'id',as:'UserType'},onDelete: 'CASCADE'},
    company_id:{type: DataTypes.CHAR(36), defaultValue: 0,references: {model:CompanyDetails,key: 'uuid',as:'company_id'},onDelete: 'CASCADE'},
    is_active:{type:DataTypes.BOOLEAN,defaultValue:true},
    deleted_at:{ type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    created_at:{type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')},
  };
};

exports.getTableName = function(){
  return {
    indexes:[{
      name:'unique_keys_index',
      unique:true,
      index:true,
      fields:['device_type','user_type','is_active','company_id']
    }],
    tableName:'pushnotification_details',
  }
};
