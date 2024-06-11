let Sequelize = require('sequelize');
let { logger } = require('../../logger');
let mySqlConnection = null;
let fs= require('fs');
let models = {};
const CompanyDetails = require('../models/company_details');
const UserType = require('../models/user_types');
const DeviceType = require('../models/device_types');
const LoginType = require('../models/login_type');
const ThirdPartyServices = require('../models/thirdparty_service');
const ThirdPartyServiceDetails = require('../models//thirdparty_service_details');
const ClientInfoDetails = require('../models/client_info_details');
const RedirectInfoDetails = require('../models/redirect_urls');
const MailDetails = require('../models/mail_details');
const PushNotification = require('../models/pushnotification_details');
const CountryCode = require('../models/country_codes');
const CompanyCountry = require('../models/company_country');
const DeviceCategory = require('../models/device_categories');
const CompanyBanner = require('../models/company_banner');

const UserDetails = require('../models/user_details');
const GeneralSettings = require('../models/general_settings');
const UserAccessToken = require('../models/user_access_token');
const LoginDeviceDetails = require('../models/login_device_details');
const VioceActAccessToken = require('../models/voiceact_access_token');

const SuperLocations = require('../models/super_location_details');
const Locations = require('../models/location_details');
const LocationsPref = require('../models/location_preference');
const Rooms = require('../models/location_rooms');
const LocationSetting = require('../models/location_settings');

const Hubs = require('../models/hubs');
const HubUser = require('../models/hub_users');
const HubDef = require('../models/hub_defination');
const HudEdgeDetails = require('../models/hub_edge_details');

const Devices = require('../models/devices');

const GuestUser = require('../models/guest_user');
const GuestLocation = require('../models/guest_location');

const ProdectionHubs = require('../models/prod_hubstest');
const ServerMessage = require('../models/servier_message');

const EnergyBudget = require('../models/energy_budget');
const EnergyKpIInputs = require('../models/energy_kpi_inputs')

const Firmwares = require('../models/firmware');

const WorkingHours = require('../models/working_hours');

let Path = require('path');
const TPath=Path.resolve(__dirname);
exports.connect =async function (host, port, dbName, userName, password) {
    return new Promise(function(resolve){
        let options={
            host: host,
            port: port,
            dialect: 'mysql',
            logging: false,
            syncOnAssociation: true,
            pool: {
                max: 200,
                min: 10,
                acquire: 60000,
                idle: 120000
            },
            define: {
                charset: 'utf8mb4',
                collate: 'utf8mb4_unicode_ci',
                timestamps: false
            }
        }
        options.dialectOptions={
            ssl: {
              ca: fs.readFileSync(`${TPath}/databasemysql.pem`).toString()
            }
          }
        let sequelize = new Sequelize(dbName, userName, password, options);
        //Company Table
        models.CompanyDetails = sequelize.define('CompanyDetails', CompanyDetails.getSchema(), CompanyDetails.getTableName());
        models.UserType = sequelize.define('UserType', UserType.getSchema(), UserType.getTableName());
        models.DeviceType = sequelize.define('DeviceType', DeviceType.getSchema(), DeviceType.getTableName());
        models.LoginType = sequelize.define('LoginType', LoginType.getSchema(), LoginType.getTableName());
        models.ThirdPartyServices = sequelize.define('ThirdPartyServices', ThirdPartyServices.getSchema(), ThirdPartyServices.getTableName());
        models.ThirdPartyServiceDetails = sequelize.define('ThirdPartyServiceDetails', ThirdPartyServiceDetails.getSchema(models.ThirdPartyServices, models.CompanyDetails), ThirdPartyServiceDetails.getTableName());
        models.ClientInfoDetails = sequelize.define('ClientInfoDetails', ClientInfoDetails.getSchema(models.DeviceType, models.CompanyDetails, models.UserType),ClientInfoDetails.getTableName());
        models.RedirectInfoDetails = sequelize.define('RedirectInfoDetails', RedirectInfoDetails.getSchema(models.ClientInfoDetails),RedirectInfoDetails.getTableName());
        models.MailDetails = sequelize.define('MailDetails', MailDetails.getSchema(models.CompanyDetails, models.LoginType, models.UserType), MailDetails.getTableName());
        models.CountryCode = sequelize.define('CountryCode', CountryCode.getSchema(), CountryCode.getTableName())
        models.CompanyCountry = sequelize.define('CompanyCountry', CompanyCountry.getSchema(models.CountryCode,models.CompanyDetails), CompanyCountry.getTableName())
        models.PushNotification = sequelize.define('PushNotification',PushNotification.getSchema(models.CompanyDetails,models.DeviceType, models.LoginType,models.UserType),PushNotification.getTableName())
        models.DeviceCategory = sequelize.define('DeviceCategory', DeviceCategory.getSchema(), DeviceCategory.getTableName());
        models.CompanyBanner = sequelize.define('CompanyBanner',CompanyBanner.getSchema(models.CompanyDetails),CompanyBanner.getTableName())
        
        // //User Tables
        models.UserDetails = sequelize.define('UserDetails', UserDetails.getSchema(models.CompanyDetails, models.UserType), UserDetails.getTableName());
        models.GeneralSettings = sequelize.define('GeneralSettings', GeneralSettings.getSchema(models.UserDetails), GeneralSettings.getTableName());
        models.UserAccessToken = sequelize.define('UserAccessToken', UserAccessToken.getSchema(models.UserDetails, models.CompanyDetails, models.DeviceType, models.LoginType, models.UserType), UserAccessToken.getTableName());
        models.LoginDeviceDetails = sequelize.define('LoginDeviceDetails', LoginDeviceDetails.getSchema(models.UserAccessToken), LoginDeviceDetails.getTableName());
        //Location Tables
        models.SuperLocations = sequelize.define('SuperLocations',SuperLocations.getSchema(models.UserDetails,models.LoginType),SuperLocations.getTableName());
        models.Locations = sequelize.define('Locations',Locations.getSchema(models.UserDetails,models.LoginType,models.SuperLocations),Locations.getTableName());
        models.LocationsPref = sequelize.define('LocationsPref',LocationsPref.getSchema(models.UserDetails,models.Locations),LocationsPref.getTableName());
        models.LocationSetting = sequelize.define('LocationSetting',LocationSetting.getSchema(models.Locations,models.UserDetails),LocationSetting.getTableName());
        models.Rooms = sequelize.define('Rooms',Rooms.getSchema(models.Locations,models.UserDetails),Rooms.getTableName());
        
        //VoiceAct
        models.VioceActAccessToken = sequelize.define('VioceActAccessToken', VioceActAccessToken.getSchema(models.UserDetails, models.CompanyDetails, models.DeviceType, models.LoginType, models.UserType,models.Locations), VioceActAccessToken.getTableName());

        //User Tables
        models.Hubs = sequelize.define('Hubs', Hubs.getSchema(models.UserDetails, models.Locations), Hubs.getTableName());
        models.HubUser = sequelize.define('HubUser', HubUser.getSchema(models.UserDetails, models.Hubs), HubUser.getTableName());
        models.HubDef = sequelize.define('HubDef', HubDef.getSchema(models.Hubs), HubDef.getTableName());
        models.HudEdgeDetails = sequelize.define('HudEdgeDetails', HudEdgeDetails.getSchema(models.Hubs), HudEdgeDetails.getTableName());
        


        //Devices Table
        models.Devices = sequelize.define('Devices', Devices.getSchema(models.DeviceCategory, models.Rooms, models.UserDetails, models.Hubs), Devices.getTableName())
        //Guest Users
        models.GuestUser = sequelize.define('GuestUser', GuestUser.getSchema(models.UserDetails),GuestUser.getTableName());
        models.GuestLocation =sequelize.define('GuestLocation', GuestLocation.getSchema(models.Locations,models.GuestUser),GuestLocation.getTableName());
        models.ProdectionHubs = sequelize.define('ProdectionHubs',ProdectionHubs.getSchema(models.UserDetails),ProdectionHubs.getTableName());
        
        models.ServerMessage = sequelize.define('ServerMessage',ServerMessage.getSchema(),ServerMessage.getTableName());

        //EnergyMeter
        models.EnergyBudget = sequelize.define('EnergyBudget',EnergyBudget.getSchema(models.Devices),EnergyBudget.getTableName());
        models.EnergyKpIInputs = sequelize.define('EnergyKpIInputs',EnergyKpIInputs.getSchema(models.Devices),EnergyKpIInputs.getTableName());
        //Firmwares
        models.Firmwares = sequelize.define('Firmwares',Firmwares.getSchema(),Firmwares.getTableName());

        //working Hours
        models.WorkingHours= sequelize.define('WorkingHours',WorkingHours.getSchema(models.UserDetails,models.Devices),WorkingHours.getTableName())
        sequelize.sync({
            alter: false
        }).then(function () {
            mySqlConnection = sequelize;
            resolve([true,mySqlConnection]);
        }).catch(function (err) {
            logger.error("MySQL error ",err.message)
            resolve([false, err]);
        });
    })
   
};
exports.getModels = function () {
    return models;
}
exports.getMySqlConnection = function () {
    return mySqlConnection;
};
exports.MysqlColse =async function () {
    return new Promise(function(resolve){
        let conn = mySqlConnection.close()
        if (conn) {
            resolve([true,conn])
        } else {
            resolve([false,conn]);
        }
    })
    
}