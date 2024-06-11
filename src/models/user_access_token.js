const { Sequelize, DataTypes } = require("sequelize");

exports.getSchema = function(UserDetails,CompanyDetails,DeviceType,LoginType,UserType) {
  return {
    id: { type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true },
    user_id: { type: DataTypes.CHAR(36),references: {model:UserDetails,key: 'user_id',as:'userId'},onDelete: 'CASCADE'},
    app_token:{type: DataTypes.STRING,defaultValue:''},
    refresh_token:{ type: DataTypes.STRING, defaultValue:''},
    access_token:{ type: DataTypes.STRING, notNull:true},
    expire_in:{type: DataTypes.INTEGER, defaultValue: 3600 },
    active_in:{type: DataTypes.BIGINT,notNull:true},
    device_type:{ type: DataTypes.INTEGER ,references: {model:DeviceType,key: 'id',as:'deviceType'},onDelete: 'CASCADE'},
    login_type:{ type: DataTypes.INTEGER, references: {model:LoginType,key: 'id',as:'LoginType'},onDelete: 'CASCADE'},
    user_type:{ type: DataTypes.INTEGER, references: {model:UserType,key: 'id',as:'UserType'},onDelete: 'CASCADE' },
    company_id:{type:DataTypes.CHAR(36),notNull:true,references: {model:CompanyDetails,key: 'uuid',as:'company_id'},onDelete: 'CASCADE'},
    created_at:{ type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    lang:{ type: DataTypes.STRING,defaultValue:'en'}
  };
};

exports.getTableName = function(){
  return {
    indexes:[{
      name:'unique_keys_index',
      unique:true,
      fields:['user_id','app_token','device_type','login_type','user_type','company_id']
    },{
      name:'access_token_index',
      unique:true,
      fields:['access_token']
    }],
    tableName:'user_access_token',
  }
};