const {
  Sequelize,
  DataTypes
} = require("sequelize");

exports.getSchema = function (Category, Rooms, UserDetails, Hubs) {
  return {
    device_id: {
      type: DataTypes.CHAR(46),
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4
    },
    user_id: {
      type: DataTypes.CHAR(36),
      references: {
        model: UserDetails,
        key: 'user_id',
        as: 'userId'
      },
      onDelete: 'CASCADE'
    },
    device_b_one_id: {
      type: DataTypes.STRING
    },
    hub_id: {
      type: DataTypes.CHAR(36),
      notNull: true,
      references: {
        model: Hubs,
        key: 'id',
        as: 'Hubs'
      },
      onDelete: 'CASCADE'
    },
    category_id: {
      type: DataTypes.CHAR(36),
      references: {
        model: Category,
        key: 'category_id',
        as: 'categoryId'
      },
      onDelete: 'CASCADE'
    },
    name: {
      type: DataTypes.STRING
    },
    device_state: {
      type: DataTypes.ENUM('ADDED', 'DELETED'),
      defaultValue: 'ADDED'
    },
    create_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    delete_at: {
      type: DataTypes.DATE
    },
    deleted_by: {
      type: DataTypes.CHAR(36)
    },
    room_id: {
      type: DataTypes.CHAR(36),
      references: {
        model: Rooms,
        key: 'room_id',
        as: 'roomId'
      },
      onDelete: 'CASCADE'
    },
    noti: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    timeline: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    state: {
      type: DataTypes.STRING,
      defaultValue: 0
    },
    online: {
      type: DataTypes.STRING,
      defaultValue: 1
    },
    node_id: {
      type: DataTypes.STRING,
      defaultValue: '0'
    },
    mac_id: {
      type: DataTypes.STRING,
      defaultValue: 0
    },
    ssid: {
      type: DataTypes.TEXT,
      defaultValue: 0
    },
    icon: {
      type: DataTypes.STRING,
      defaultValue: 0
    },
    remote_model: {
      type: DataTypes.STRING,
      defaultValue: 0
    },
    state_date: {
      type: DataTypes.DATE
    },
    security_mode: {
      type: DataTypes.ENUM('Disarm', 'Arm', 'Inhouse', 'Panic', 'Medical Emergency'),
      defaultValue: 'Disarm'
    },
    sortid:{ type: DataTypes.INTEGER}
  };
};

exports.getTableName = function () {
  return {
    indexes:[{
      name:'keys_index',
      index:true,
      fields:['user_id','hub_id','device_state']
    },{
      name:'keys_user',
      index:true,
      fields:['user_id','device_state']
    },{
      name:'keys_hub',
      index:true,
      fields:['hub_id','device_state']
    }],
    tableName: 'devices',
  }
};