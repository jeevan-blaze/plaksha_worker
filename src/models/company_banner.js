const { Sequelize, DataTypes } = require("sequelize");

exports.getSchema = function(CompanyDetails) {
  return {
    id: { type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true},
    title:{ type: DataTypes.STRING,defaultValue:null},
    banner_url:{ type: DataTypes.STRING,defaultValue:null},
    redirect_url:{ type: DataTypes.STRING,defaultValue:null},
    is_active:{ type: DataTypes.BOOLEAN,defaultValue:true},
    company_id:{type: DataTypes.CHAR(36),references: {model:CompanyDetails,key: 'uuid',as:'company_id'},onDelete: 'CASCADE'},
    created_at:{type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')},
    lang:{ type: DataTypes.STRING,defaultValue:'en'},
  };
};

exports.getTableName = function(){
  return {
    tableName:'company_banners'
  }
};
