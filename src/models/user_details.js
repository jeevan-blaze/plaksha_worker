const { Sequelize, DataTypes } = require("sequelize");

exports.getSchema = function(CompanyDetails,UserType) {
  return {
    user_id: { type: DataTypes.CHAR(36),primaryKey: true,defaultValue: DataTypes.UUIDV4 },
    name:{type: DataTypes.STRING,notNull:true},
    email_id:{ type: DataTypes.STRING,notNull:true},
    phone_code:{ type: DataTypes.STRING, defaultValue: null },
    phone_no:{ type: DataTypes.STRING, defaultValue: null },
    alt_phone:{type: DataTypes.STRING, defaultValue: null },
    password:{type: DataTypes.STRING,notNull:true},
    old_password:{type: DataTypes.STRING,defaultValue: null},
    dob:{type: DataTypes.STRING,defaultValue: null},
    master:{type:DataTypes.STRING(10),defaultValue:'1'},
    gender:{type:DataTypes.STRING,defaultValue:null},
    region:{type:DataTypes.STRING(100),defaultValue:null},
    lang:{type:DataTypes.STRING(100),defaultValue:'en'},
    utc:{type:DataTypes.STRING(100),defaultValue:null},
    gcode:{type:DataTypes.STRING(255),defaultValue:null},
    fcode:{type:DataTypes.STRING(255),defaultValue:null},
    subscribe:{type:DataTypes.INTEGER,defaultValue:0},
    subscribe_date:{ type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    company_id:{type:DataTypes.CHAR(36),notNull:true,references: {model:CompanyDetails,key: 'uuid',as:'company_id'},onDelete: 'CASCADE'},
    user_type:{type:DataTypes.INTEGER,defaultValue:1,references: {model:UserType,key: 'id',as:'UserType'},onDelete: 'CASCADE'},
    reg_type:{type:DataTypes.INTEGER,defaultValue:0},
    is_active:{ type: DataTypes.BOOLEAN, defaultValue: true },
    created_at:{ type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    deleted_at:{ type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    others:{type:DataTypes.STRING(50),defaultValue:null},
    customer_id:{type:DataTypes.INTEGER},
  };
};

exports.getTableName = function(){
  return {
    indexes:[{
      name:'unique_keys_index',
      unique:true,
      index:true,
      fields:['email_id','user_type','company_id','is_active']
    }],
    tableName:'user_details',
  }
};