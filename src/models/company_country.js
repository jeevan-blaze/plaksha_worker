const { Sequelize, DataTypes } = require("sequelize");

exports.getSchema = function(CountryCode,CompanyDetails) {
  return {
    id: { type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true},
    cid:{ type: DataTypes.INTEGER,references: {model:CountryCode,key: 'id',as:'CountryCode'},onDelete: 'CASCADE'},
    company_id:{type: DataTypes.CHAR(36), defaultValue: 0,references: {model:CompanyDetails,key: 'uuid',as:'company_id'},onDelete: 'CASCADE'},
    is_active:{type:DataTypes.BOOLEAN,defaultValue:true},
    deleted_at:{ type: DataTypes.DATE, defaultValue: DataTypes.NOW },created_at:{type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')},
  };
};

exports.getTableName = function(){
  return {
    indexes:[{
      name:'unique_keys_index',
      unique:true,
      fields:['cid','company_id','is_active']
    },{
      name:'keys_index',
      index:true,
      fields:['company_id','is_active']
    }],
    tableName:'company_countries_codes',
  }
};
