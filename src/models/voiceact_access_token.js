const { Sequelize, DataTypes } = require("sequelize");

exports.getSchema = function(UserDetails,CompanyDetails,DeviceType,LoginType,UserType,Locations) {
  return {
    id: { type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true },
    user_id: { type: DataTypes.CHAR(36),references: {model:UserDetails,key: 'user_id',as:'userId'},onDelete: 'CASCADE'},
    access_token:{type: DataTypes.STRING,defaultValue:''},
    refresh_token:{ type: DataTypes.STRING, notNull:true},
    expire_in:{type: DataTypes.INTEGER, defaultValue: 3600 },
    active_in:{type: DataTypes.BIGINT,notNull:true},
    device_type:{ type: DataTypes.INTEGER ,references: {model:DeviceType,key: 'id',as:'deviceType'},onDelete: 'CASCADE'},
    login_type:{ type: DataTypes.INTEGER, references: {model:LoginType,key: 'id',as:'LoginType'},onDelete: 'CASCADE'},
    user_type:{ type: DataTypes.INTEGER, references: {model:UserType,key: 'id',as:'UserType'},onDelete: 'CASCADE' },
    company_id:{type:DataTypes.CHAR(36),notNull:true,references: {model:CompanyDetails,key: 'uuid',as:'company_id'},onDelete: 'CASCADE'},
    location_id:{type: DataTypes.CHAR(36),notNull:true,references: {model:Locations,key: 'location_id',as:'Locations'},onDelete: 'CASCADE'},
    created_at:{ type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  };
};

exports.getTableName = function(){
  return {
    tableName:'voiceact_access_token'
  }
};