const { Sequelize, DataTypes } = require("sequelize");
exports.getSchema = function() {
  return {
    category_id: { type: DataTypes.CHAR(36), primaryKey: true, defaultValue: Sequelize.UUIDV4 },
    category_parent_id: { type: DataTypes.CHAR(36) },
    category_name: { type: DataTypes.STRING },
    category_desc: { type: DataTypes.STRING },
    category_type: {type: DataTypes.ENUM('Security', 'Remote', 'Music', 'Devices') },
    device_make: { type: DataTypes.STRING },
    device_model: { type: DataTypes.STRING },
    device_radio_type: { type: DataTypes.STRING },
    created_at:{type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')}
  };
};

exports.getTableName = function(){
  return {
    tableName:'device_categories',
    timestamp:false
  }
};