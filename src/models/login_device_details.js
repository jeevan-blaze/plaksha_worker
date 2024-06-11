const { Sequelize, DataTypes } = require("sequelize");
exports.getSchema = function(UserAccessToken) {
    return {
        id: { type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true },
        token_id:{ type: DataTypes.INTEGER, notNull:true,references: {model:UserAccessToken, key: 'id',as:'token_id'},onDelete: 'CASCADE'},
        os_version:{type: DataTypes.STRING},
        device_name:{type: DataTypes.STRING},
        model_no:{type: DataTypes.STRING},
        created_at:{ type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        last_active_date:{type: DataTypes.DATE, defaultValue: DataTypes.NOW}
    }
}


exports.getTableName = function(){
    return {
      indexes:[{
          name:'unique_keys_index',
          unique:true,
          index:true,
          fields:['id']
        }],
      tableName:'login_details',
    }
  };