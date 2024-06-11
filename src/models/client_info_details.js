const { Sequelize, DataTypes } = require("sequelize");

exports.getSchema = function(DeviceType,CompanyDetails,UserType) {
  return {
    id: { type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true },
    client_id:{type: DataTypes.STRING,notNull:true},
    client_secret:{type:DataTypes.STRING,notNull:true},
    device_type:{ type: DataTypes.INTEGER ,references: {model:DeviceType,key: 'id',as:'deviceType'},onDelete: 'CASCADE'},
    login_type:{ type: DataTypes.INTEGER},
    company_id:{type: DataTypes.CHAR(36), defaultValue: 0,references: {model:CompanyDetails,key: 'uuid',as:'company_id'},onDelete: 'CASCADE' },
    user_type:{type:DataTypes.INTEGER,defaultValue:1,references: {model:UserType,key: 'id',as:'UserType'},onDelete: 'CASCADE'},
    service:{type:DataTypes.INTEGER,defaultValue:0},
    is_active:{type:DataTypes.BOOLEAN,defaultValue:true},
    expire_in:{type:DataTypes.BIGINT,defaultValue:3600},
    deleted_at:{ type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    created_at:{ type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  };
};

exports.getTableName = function(){
  return {
    indexes:[{
      name:'unique_keys_index',
      unique:true,
      fields:['client_id','client_secret','device_type','login_type','company_id','service','is_active']
    },{
      name:'keys_index',
      index:true,
      fields:['client_id','client_secret']
    }],
    tableName:'client_info_details',
  }
};