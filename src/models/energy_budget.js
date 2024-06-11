const { Sequelize, DataTypes } = require("sequelize");

exports.getSchema = function(DeviceDetails) {
  return {
    id: { type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true },
    device_id: {type: DataTypes.CHAR(36), references: { model: DeviceDetails,key: 'device_id',as: 'device_id'}, onDelete: 'CASCADE'},
    month_year:{type:Sequelize.BIGINT,defaultValue:null},
    budget:{type:Sequelize.STRING,defaultValue:null},
    m_alert:{type:Sequelize.STRING,defaultValue:"50:75"},
    w_alert:{type:Sequelize.STRING,defaultValue:"50:75"},
    d_alert:{type:Sequelize.STRING,defaultValue:"50:75"},
    noti:{type:Sequelize.STRING,defaultValue:'0,0,0,0,0,0,0,0,0'},
    created_at:{ type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    is_active:{ type: DataTypes.BOOLEAN, defaultValue: true },
  };
};

exports.getTableName = function(){
  return {
    indexes:[{
      name:'keys_index',
      index:true,
      fields:['device_id','is_active']
    }],
    tableName:'energy_budget',
  }
};