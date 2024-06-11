const { Sequelize, DataTypes } = require("sequelize");

exports.getSchema = function(UserDetails) {
  return {
    id: { type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true },
    user_id:{type: DataTypes.CHAR(36),unique:true,notNull:true,references:{model:UserDetails,key:'user_id',as:'user_id'},onDelete: 'CASCADE'},
    logo_path:{type:DataTypes.STRING},
    temp_in:{ type: DataTypes.STRING(10), defaultValue: '0' },
    cost_in:{ type: DataTypes.STRING(10), defaultValue: '129' },
    energy_in:{ type: DataTypes.STRING(10), defaultValue: '0' },
    funit_in:{ type: DataTypes.STRING(10), defaultValue: '0' },
    loc_order: {type: DataTypes.TEXT, defaultValue: null },
    created_at:{ type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  };
};

exports.getTableName = function(){
  return {
    indexes:[{
      name:'keys_index',
      index:true,
      fields:['user_id']
    }],
    tableName:'general_setting',
  }
};