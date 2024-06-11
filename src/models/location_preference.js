const {
  Sequelize,
  DataTypes
} = require("sequelize");

exports.getSchema = function (UserDetails,Locations) {
  return {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.CHAR(36),
      notNull: true,
      references: {
        model: UserDetails,
        key: 'user_id',
        as: 'userId'
      },
      onDelete: 'CASCADE'
    },
    location_id: {
      type: DataTypes.CHAR(36),
      notNull: true,
      references: {
        model: Locations,
        key: 'location_id',
        as: 'Locations'
      },
      onDelete: 'CASCADE'
    },
    master: {
      type: DataTypes.STRING(10),
      defaultValue: '1'
    },
    device_ids: {
      type: DataTypes.TEXT,
      defaultValue: null
    },
    room_ids: {
      type: DataTypes.TEXT,
      defaultValue: null
    },
    rule_ids: {
      type: DataTypes.TEXT,
      defaultValue: null
    },
    mode: {
      type: DataTypes.TEXT,
      defaultValue: null
    },
    device: {
      type: DataTypes.TEXT,
      defaultValue: null
    },
    room: {
      type: DataTypes.TEXT,
      defaultValue: null
    },
    rule: {
      type: DataTypes.TEXT,
      defaultValue: null
    },
    line_notify: {
      type: DataTypes.ENUM('0', '1'),
      defaultValue: '1'
    },
    fb_notify: {
      type: DataTypes.ENUM('0', '1'),
      defaultValue: '1'
    },
    app_notify: {
      type: DataTypes.ENUM('0', '1'),
      defaultValue: '1'
    },
    favorites: {
      type: DataTypes.TEXT,
      defaultValue: null
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
  };
};

exports.getTableName = function () {
  return {
    indexes:[{
      name:'unique_keys_index',
      unique:true,
      index:true,
      fields:['user_id','location_id','is_active']
    }],
    tableName: 'location_preference',
  }
};