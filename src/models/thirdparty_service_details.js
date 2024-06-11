const { Sequelize, DataTypes } = require("sequelize");

exports.getSchema = function(ThirdPartyServices,CompanyDetails) {
  return {
    id: { type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true },
    service_id:{type: DataTypes.INTEGER,notNull:true,references: {model:ThirdPartyServices,key: 'id',as:'service_id'},onDelete: 'CASCADE'},
    service_name:{type: DataTypes.STRING,notNull:true},
    client_id:{type: DataTypes.STRING,notNull:true},
    client_secret:{type: DataTypes.STRING,notNull:true},
    redirect:{type: DataTypes.STRING,notNull:true},
    region:{type: DataTypes.STRING,defaultValue:null},
    company_id:{type: DataTypes.CHAR(36), defaultValue: null,references: {model:CompanyDetails,key: 'uuid',as:'company_id'},onDelete: 'CASCADE' },
    is_active:{type:DataTypes.BOOLEAN,defaultValue:true},
    deleted_at:{ type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    created_at:{ type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  };
};

exports.getTableName = function(){
  return {
    indexes:[{
        name:'unique_keys_index',
        unique:true,
        index:true,
        fields:['service_id','company_id','is_active']
      }],
    tableName:'thirdparty_services_details',
  }
};