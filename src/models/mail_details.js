const { Sequelize, DataTypes } = require("sequelize");

exports.getSchema = function(CompanyDetails,LoginType,UserType) {
  return {
    id: { type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true },
    host:{type: DataTypes.STRING,notNull:true},
    port:{type: DataTypes.INTEGER,notNull:true},
    secure:{type: DataTypes.BOOLEAN,notNull:true,defaultValue: false},
    tls:{type: DataTypes.BOOLEAN,notNull:true,defaultValue: false},
    service:{type: DataTypes.STRING,notNull:true},
    user:{type: DataTypes.STRING,notNull:true},
    pass:{type: DataTypes.STRING,notNull:true},
    web:{type: DataTypes.STRING,notNull:true},
    support:{type: DataTypes.STRING,notNull:true},
    from:{type: DataTypes.STRING,notNull:true},
    title:{type: DataTypes.STRING,notNull:true},
    heading:{type: DataTypes.STRING,notNull:true},
    logo:{type: DataTypes.STRING,notNull:true},
    user_type:{type:DataTypes.INTEGER,notNull:true,references: {model:UserType,key: 'id',as:'UserType'},onDelete: 'CASCADE'},
    login_type:{type:DataTypes.INTEGER,notNull:true,references: {model:LoginType,key: 'id',as:'LoginType'},onDelete: 'CASCADE'},
    company_id:{type: DataTypes.CHAR(36), defaultValue: 0,references: {model:CompanyDetails,key: 'uuid',as:'company_id'},onDelete: 'CASCADE'},
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
      fields:['user_type','login_type','company_id']
    }],
    tableName:'mail_details',
  }
};