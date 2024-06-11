const { Sequelize, DataTypes } = require("sequelize");

exports.getSchema = function(DeviceDetails) {
  return {
    id: { type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true },
    device_id: {type: DataTypes.CHAR(36), references: { model: DeviceDetails,key: 'device_id',as:'device_id'}, onDelete: 'CASCADE'},
    start_date:{type: Sequelize.BIGINT, defaultValue: 0},
    product_name:{type: Sequelize.STRING, defaultValue: null},
    product_id:{type: Sequelize.STRING, defaultValue: null},
    total:{type: Sequelize.STRING, defaultValue: "0"},
    defective_output:{type:Sequelize.STRING,defaultValue:null},
    scheduled_runtime:{type:Sequelize.STRING,defaultValue:null},
    ideal_cycle_time:{type:Sequelize.STRING,defaultValue:null},
    created_at:{ type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    is_active:{ type: DataTypes.BOOLEAN, defaultValue: true }
  };
};
exports.getTableName = function(){
  return {
    indexes:[{
      name:'keys_index',
      index:true,
      fields:['device_id','is_active']
    }],
    tableName:'energy_kpi_inputs',
  }
};