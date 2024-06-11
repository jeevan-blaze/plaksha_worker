let config = require('../../config/config').getEnvDetails();
let { logger,initializeApplicationInsights } = require('../../logger');
let mongo= require('../database/mongodb');
let redis = require('../database/redis');
let mysql = require('../database/mysql');
let { Op } = require('sequelize');
const { EventHubConsumerClient, earliestEventPosition  } = require("@azure/event-hubs");
const { BlobCheckpointStore } = require("@azure/eventhubs-checkpointstore-blob");
const { ContainerClient } = require("@azure/storage-blob");
const {UtilsService,GhomeService,DeviceService} = require('../services');
const { VoiceActController,PubSubController } = require('../controller');
let AZUREIOTController = require('../Mqtt/AzureIotCommandController');
let MessageController=require('../messages/message.controllers');
const {EnergyReports} = require('../services/reports/reports.service')
let Event_Type=[
    'SwitchEvent',
    'LockEvent',
    'BatteryEvent',
    'ConfigEvent',
    'DimmerEvent',
    'ThermostatModeEvent',
    'FloodEvent',
    'MotionEvent',
    'SmokeEvent',
    'TemperatureEvent',
    'IlluminanceEvent',
    'UVEvent',
    'HumidityEvent',
    'SirenEvent',
    'ColorEvent',
    'CurtainEvent',
    'RGBEvent',
    'DoorSensorEvent',
    'SceneControlEvent',
    'SceneControllerEvent',
    'ThermostatFanModeEvent',
    'ThermostatSetPointEvent',
    'GasAlaramEvent',
    'ActionEvent',
    'ActionStatusEvent',
    'SOSAlarmEvent',
    'HubStatusEvent',
    'DeviceAliveEvent',
    'SecurityUpdateEvent',
    'SecurityAlertEvent',
    'SecurityStatusEvent',
    'ScheduleEvent',
    'SecurityKeyFobEvent',
    'ImplantEvent',
    'LockKeyEvent',
    'LockWrongCodeEvent',
    'SchedulecountEvent'
    ,'valveEvent',
    'waterLevelEvent',
    'FanEvent',
    'HubStatusEvent',
    'SeismicIntensityEvent',
    'AccelerationEvent',
    'EnergyReportEvent',
    ];

const CheckJson= async (data)=>{
    return new Promise((reslove)=>{
        try{
            let rsult=JSON.parse(data)
            reslove([true,rsult]) ;
        }
        catch(err){
            logger.warn(err);
            reslove([false,data]) ;
        }
    })
    
}
exports.init = async (env) => {
    try{
        // Azure App insights
        if (config?.worker_insigths) {
            initializeApplicationInsights(config.worker_insigths,env)
            .then(()=>logger.info('Initialized Application Insights'))
            .catch((err)=>logger.error(err));
          }
        logger.info(`Running receiveEvents`);
        [mySQLStatus, mySQLState] = await mysql.connect(config.mysql_host, config.mysql_port, config.mysql_db, config.mysql_user, config.mysql_pass);
        [redisStatus, RedisState] = await redis.connect(config.redis_url,0,config.redis_password);
        [mongoStatus, mongoState] = await mongo.connect(config.mongo_url, config.mongo_db);
        if(redisStatus && mongoStatus && mySQLStatus){
            if(config.iot_pubsub_host_url!=undefined && config.iot_pubsub_name!=undefined){
                PubSubController.init(config.iot_pubsub_host_url,config.iot_pubsub_name,config.iot_pubsub_logging_name)
            }
            if(config.iot_host_url && config.iot_host_url!=undefined){
                AZUREIOTController.connect(config.iot_host_url);
            }
            MessageController.getServerMessageInit()
            const containerClient = new ContainerClient(config.iot_image_connection_string,config.iot_storage_logger);
            const checkpointStore = new BlobCheckpointStore(containerClient);
            let loadBalancingOptions={loadBalancingOptions:{strategy:"balanced"}}
            const consumerClient = new EventHubConsumerClient(config.iot_event_group_name, config.iot_event_hub, config.iot_event_name,checkpointStore,loadBalancingOptions);
            let tsrun=new Date().getTime();
            const subscription = consumerClient.subscribe(
                {
                    processEvents: async (events, context) => {
                        if (events.length === 0) {
                            return;
                          }
                          events.forEach(async (event)=>{
                            
                            let ts=event.systemProperties[`iothub-enqueuedtime`];
                            let mac_id=event.systemProperties['iothub-connection-device-id'];
                            let source=event.systemProperties['iothub-message-source']
                            if(ts<tsrun) return
                            if(source==='deviceConnectionStateEvents'){
                                let state=event.properties['opType'];
                                let reqObj={online:'0'}
                                if(state=='deviceConnected'){
                                    reqObj={online:'1'};
                                }
                                let WifiCategoryIds=await getWifiCategoryIds()
                                let device= await mysql.getModels().Devices.findOne({where:{mac_id:mac_id,device_state:'ADDED',category_id:{[Op.in]:WifiCategoryIds}},attributes:['device_id'],order:[['create_at','DESC']]})
                                if(device!=undefined){
                                    let device_id=device.device_id
                                    if((device.device_id).indexOf('$')>-1){
                                        device_id=((device.device_id).split('$'))[0]
                                    }
                                    let group_id=(device_id).split('-');
                                    PubSubController.sendPubSub(group_id[0],{device_id:device_id,online:reqObj.online});   
                                    UpdateDeviceInfo(device_id,reqObj);
                                } 
                            }
                            if(source==='Telemetry'){
                                EventProccessing(event,mac_id)
                            }
                          })
                           await context.updateCheckpoint(events[events.length - 1]);
                    },
                    processError: async (err, context) => {
                        //logger.info(`Error on partition "${context.partitionId}": ${err}`);
                    }
                },{ startPosition: earliestEventPosition })
        }
    }
    catch(err){
        logger.error(err)
    }
       
}
exports.Close = async ()=>{
    try {
  
      [redisStatus, redisObject] = await redis.close();
      [mongoStatus, mongoObject] = await mongo.close();
      [mySqlStatus, mySqlObject] = await mysql.MysqlColse();
  
      if (redisStatus == true && mongoStatus == true && mySqlStatus == true) {
        logger.info(`Closed all DB connections`);
      }
      else {
        logger.info(`MySQL connection closed status===> ${mySqlStatus} `);
        logger.info(`Redis connection closed status===> ${redisStatus} `);
        logger.info(`Mongo connection closed status===> ${mongoStatus} `);
      }
    }
    catch (err) {
    logger.error(err);
    }
  }

let keysdays=['oPt','oSt','Pt','Qt','St','PtN','StN','QtN','idle','opr','stb','PPt','HPt','SPt','PSt','HSt','SSt','PCt','HCt','SCt','Dnc','FPtc','FStc','ltr'];
let roundedKeys=['PCt','HCt','SCt','FPtc','FStc']
async function calOperation(old,currect,type){
    return new Promise((reslove)=>{
        try{
            if(old==undefined || old==''){
                old={}
            }
            Object.keys(currect).forEach((ele)=>{
                if(keysdays.includes(ele) && old[`${ele}`]){
                    let data=currect[`${ele}`];
                    let oldsdata=old[`${ele}`];
                    if(Array.isArray(data)){
                        currect[`${ele}`]=data.map(function (num, idx) {
                            if(type){
                                return parseFloat((parseFloat(`${num}`) - parseFloat(`${oldsdata[idx] || 0}`)).toFixed(roundedKeys.includes(ele)?5:2));
                            }else{
                                return parseFloat((parseFloat(`${num}`) + parseFloat(`${oldsdata[idx] || 0}`)).toFixed(roundedKeys.includes(ele)?5:2));
                            } 
                        });
                    }else{
                        currect[`${ele}`]=parseFloat((parseFloat(data)+(parseFloat(oldsdata) || 0)).toFixed(roundedKeys.includes(ele)?5:2));
                    }
                    
                }
            })
            if(old!=undefined && old.Pt && Object.keys(old).length>0){
                Object.keys(old).forEach((ele)=>{
                    if(keysdays.includes(ele) && currect[`${ele}`]==undefined){
                        currect[`${ele}`] = old[`${ele}`];
                    }
                })
            }
            reslove(currect);  
        }
        catch(err){
            logger.error(err);
            reslove(currect);  
        }
        
    })
}
async function MongoMinInsert(device_id,data){
    return new Promise(async(reslove)=>{
        try{
            data.device_id=device_id
            await mongo.save('energy_minutes',data);
            delete data._id;
            reslove(data);
        }catch(err){
            logger.error(err);
            reslove(data);
        }
        
    })
}
async function MongoDayInsert(device_id,data){
    return new Promise(async (reslove)=>{
        try{
            let ts=new Date(data.ts);
            ts.setUTCHours(0,0,0,0);
            let result={}
            result.ts=ts.getTime();
            result.device_id=device_id;
            Object.keys(data).forEach(ele=>{
                if(keysdays.includes(ele)){
                    result[`${ele}`]= data[`${ele}`]
                }
            })
            let keyname=`day_${device_id}_${ts.getTime()}`;
            let getdatainfo= await lastRecordRedis(keyname,'energy_days',device_id,ts.getTime())
            if(getdatainfo && getdatainfo.ts && getdatainfo.ts!=ts.getTime()){
                getdatainfo='';
            }
            let flage=false;
            if(getdatainfo[`Dnc`] && new Date(getdatainfo.ts).getUTCDate()==new Date(result.ts).getUTCDate()){
                delete getdatainfo[`Dnc`];
                flage=true;
            }
            let resultres=await calOperation(getdatainfo,result,false);
            await mongo.updateOne('energy_days',`${device_id}_${ts.getTime()}`,resultres);
            await redis.setDataWithTTL(keyname,resultres,(2*60*60))
            reslove([resultres,flage])
        }
        catch(err){
            logger.error(err);
            reslove([data,false])
        }
         
    })
}
async function MongoMonthInsert(device_id,data){
    return new Promise(async (reslove)=>{
        try{
            let ts=new Date(data.ts);
            ts.setUTCDate(1)
            ts.setUTCHours(0,0,0,0);
            let result={}
            result.ts=ts.getTime();
            result.device_id=device_id;
            Object.keys(data).forEach(ele=>{
                if(keysdays.includes(ele)){
                    result[`${ele}`]= data[`${ele}`]
                }
            })
            let keyname=`month_${device_id}_${ts.getTime()}`;
            let getdatainfo= await lastRecordRedis(keyname,'energy_months',device_id,ts.getTime())
            if(getdatainfo && getdatainfo.ts && getdatainfo.ts!=ts.getTime()){
                getdatainfo='';
            }
            let resultres=await calOperation(getdatainfo,result,false);
            await mongo.updateOne('energy_months',`${device_id}_${ts.getTime()}`,resultres);
            await redis.setDataWithTTL(keyname,resultres,(2*24*60*60))
            reslove(resultres)
        }catch(err){
            logger.error(err);
            reslove(data)
        }
         

    })
}
const EventProccessing= async(event,mac_id)=>{
    try{
        let LogReqdata={
            type:'event',
            body:event.body
        }
        try{
            PubSubController.sendPubSubCommand(mac_id,LogReqdata)
        }catch(err){
            logger.error(err);
        }
        
        let [state,JsonData]= await CheckJson(JSON.stringify(event.body));
                if(state && JsonData.event_type){
            if(JsonData.device_id!=undefined && (JsonData.device_id).length>10){
                try{
                    let group_id=(JsonData.device_id).split('-');
                    PubSubController.sendPubSub(group_id[0],event.body)
                }
                catch(err){
                    logger.error(err);
                }
                
            }
            if(JsonData.event_type=='DebugEvent'){
                logger.info(JsonData.event_type,mac_id,`${JsonData.message}`);
            }
            if(Event_Type.includes(JsonData.event_type) && JsonData.data!=undefined && JsonData.device_id!=undefined && (JsonData.device_id).length>10){
                let data = JsonData.data;
                let device_id = JsonData.device_id;
                if ((JsonData.event_type == 'SwitchEvent'|| JsonData.event_type == 'FanEvent' || JsonData.event_type == 'DimmerEvent') && (data.status!=undefined || data.state!=undefined)) {
                    let state='off'
                    if(data.status!=undefined){
                        state=(data.status)
                    }
                    if(data.state!=undefined){
                        state=(data.state)
                    }
                    if (state == 'off' || state == '0') {
                        data.message = 'Turned OFF'
                    }
                    if (state == 'on' || state == '1') {
                        data.message = 'Turned ON'
                    }
                }
                else if(JsonData.event_type == 'ThermostatModeEvent'){
                    if(data.mode=='off'){
                        data.message = 'set to OFF'
                    }
                    if(data.mode=='cool'){
                        data.message = 'set to COOL'
                    }
                    if(data.mode=='heat'){
                        data.message = 'set to HEAT'
                    }
                    if(data.mode=='auto'){
                        data.message = 'set to AUTO'
                    }
                    if(data.mode){
                        data.status=data.mode;
                    }
                }
                else if (JsonData.event_type == 'DoorSensorEvent'  && data.status!=undefined ) {
                    if ((data.status).toLowerCase() === 'door_open' || (data.status).toLowerCase() === 'open') {
                        data.message = 'Open'
                    }
                    if ((data.status).toLowerCase() === 'door_close' || (data.status).toLowerCase() === 'close') {
                        data.message = 'Closed'
                    }
                }
                else if (JsonData.event_type == 'CurtainEvent' && data.status!=undefined) {
                    if ((data.status).toLowerCase() === 'close') {
                        data.message = 'Closed'
                    }
                    if ((data.status).toLowerCase() === 'open') {
                        data.message = 'Open'
                    }
                    if ((data.status).toLowerCase() === 'pause') {
                        data.message = 'Paused'
                    }
                }
                else if (JsonData.event_type == 'SirenEvent' && data.status!=undefined) {
                    if ((data.status).toLowerCase() === 'siren_deactivated') {
                        data.message = 'Turned OFF'
                    }
                    if ((data.status).toLowerCase() === 'siren_activated') {
                        data.message = 'Turned ON'
                    }
                }
                else if (JsonData.event_type == 'LockEvent' && data.status!=undefined) {
                    if ((data.status).toLowerCase() === 'locked') {
                        data.message = 'Locked'
                    }
                    if ((data.status).toLowerCase() === 'unlocked') {
                        data.message = 'Unlocked'
                    }
                    if(data.source=='automatic'){
                        data.message=`${data.message} by Auto-relock`;
                    }
                    if(data.source=='rfid'){
                        data.message=`${data.message} with RFid.`;
                    }
                }
                else if (JsonData.event_type == 'MotionEvent' && data.status!=undefined) {
                    if ((data.status).toLowerCase() === 'tampered') {
                        data.message = 'Tampered'
                    }
                    if ((data.status).toLowerCase() === 'motion_idle') {
                        data.message = 'Everything is ok'
                    }
                    if ((data.status).toLowerCase() === 'motion_detected') {
                        data.message = 'Motion Detected'
                    }
                }
                else if(JsonData.event_type == 'ActionStatusEvent'){
                    data={state:`${JsonData.data.action_status}`};
                }
                else if (JsonData.event_type == 'GasAlaramEvent' && data.status!=undefined) {
                    if ((data.status).toLowerCase() === 'tampered') {
                        data.message = 'Tampered'
                    }
                    if ((data.status).toLowerCase() === 'state_idle') {
                        data.message = 'Everything is ok'
                    }
                    if ((data.status).toLowerCase() === 'combustible_gas_detected') {
                        data.message = 'Gas Leak Detected'
                    }
                    if ((data.status).toLowerCase() === 'gasalaram_activated') {
                        data.message = 'Alaram Activated'
                    }
                    if ((data.status).toLowerCase() === 'gasalaram_deactivated') {
                        data.message = 'Alaram Deactivated'
                    }
                }
                else if (JsonData.event_type == 'SmokeEvent' && data.status!=undefined) {
                    if ((data.status).toLowerCase() === 'tampered') {
                        data.message = 'Tampered'
                    }
                    if ((data.status).toLowerCase() === 'state_idle') {
                        data.message = 'Everything is ok'
                    }
                    if ((data.status).toLowerCase() === 'smoke_detected') {
                        data.message = 'Smoke Detected'
                    }
                }
                else if (JsonData.event_type == 'FloodEvent' && data.status!=undefined) {
                    if ((data.status).toLowerCase() === 'tampered') {
                        data.message = 'Tampered'
                    }
                    if ((data.status).toLowerCase() === 'flood_idle') {
                        data.message = 'Everything is ok'
                    }
                    if ((data.status).toLowerCase() === 'water_leak') {
                        data.message = 'Water Leaked'
                    }
                }
                else if (JsonData.event_type == 'ActionEvent') {

                    if (JsonData.data.message == "ACTION ENDED") {
                        data.message = 'Action Ended'
                        data.status = 0;
                    } else {
                        data.message = 'Action Started'
                        data.status = 1;
                    }
                }
                else if(JsonData.event_type == 'waterLevelEvent'){
                    data={};
                }
                else if (JsonData.event_type == 'ThermostatSetPointEvent' || JsonData.event_type == 'HumidityEvent' || JsonData.event_type == 'TemperatureEvent' || JsonData.event_type == 'waterLevelEvent') {
                    let datares={tsreg:(((5*60)+30)*60)*1000}
                    datares.device_id=(device_id).replace(/-/g,'');
                    let storeData={device_id:datares.device_id,ts:new Date().getTime()};
                    if (JsonData.event_type == 'HumidityEvent' && JsonData.data && JsonData.data.humidity) {
                        storeData.humidity=JsonData.data.humidity
                        await mongo.save('humidity_history',storeData);
                    }
                    if (JsonData.event_type == 'TemperatureEvent' && (JsonData.data && (JsonData.data.temp_C || JsonData.data.temperature_f))) {
                        storeData.temp=JsonData.data.temp_C || JsonData.data.temperature_f;
                        await mongo.save('temperature_history',storeData);
                        let state = await updateinfo(JsonData);
                    }
                    if(JsonData.event_type == 'ThermostatSetPointEvent' && (JsonData.data && (JsonData.data.cooling || JsonData.data.heating) )){
                        storeData.point=JsonData.data.heating || JsonData.data.cooling;
                        if(JsonData.data.heating!=undefined){
                            storeData.mode='heat';
                        }
                        if(JsonData.data.cooling!=undefined){
                            storeData.mode='cool';
                        }
                        await mongo.save('setpoint_history',storeData);
                    }
                    if(JsonData.event_type == 'waterLevelEvent' && JsonData.data && JsonData.data.total_ltr!=undefined){
                        storeData.ts=new Date().getTime()+datares.tsreg;
                        let lits=0;
                        if(JsonData.data.total_ltr>0){
                            lits=1
                        }
                        let totalObj={}
                        totalObj.ts=storeData.ts;
                        totalObj.total_ltr=JsonData.data.total_ltr;
                        storeData.ltr=[parseInt(`${lits}`)];
                        let mins=await MongoMinInsert(datares.device_id,{...storeData});
                        let days=await MongoDayInsert(datares.device_id,{...storeData});
                        let months=await MongoMonthInsert(datares.device_id,{...storeData}); 
                        await mongo.updateOne('energy_total',datares.device_id,totalObj);
                    }

                }
                else if(JsonData.event_type=='SOSAlarmEvent'){
                    if(JsonData.data.status=='alert_detected'){
                        data.message = 'Alert Detected'
                    }
                }
                else if(JsonData.event_type=='SceneControllerEvent' || JsonData.event_type=='SceneControlEvent' || JsonData.event_type=='SecurityKeyFobEvent'){
                    data.message = `${JsonData.data.status}`;
                    if(JsonData.data.button){
                        data.message = `Button ${JsonData.data.button} ${JsonData.data.status}`;
                        JsonData.data.status=`${JsonData.data.button}:${JsonData.data.status}`
                    } 
                }
                else if(JsonData.event_type=='ImplantEvent'){
                    if(JsonData.data.status && JsonData.data.epid){
                        data.message = `${JsonData.data.epid} is ${JsonData.data.status}`
                        JsonData.data.status=`${JsonData.data.status}:${JsonData.data.status}`
                    }
                }
                else if(JsonData.event_type=='LockKeyEvent'){
                    data={};
                    if(JsonData.data.slot=='255' && JsonData.data.status=='code_deleted'){
                        data.event_type=`${JsonData.data.status}`;
                        data.slot=JsonData.data.slot;
                        data.message = 'Successfully Deleted All Keys'
                    }else{
                        data ={};
                    }

                }
                else if(JsonData.event_type=='LockWrongCodeEvent'){
                    data.error_type=`${JsonData.data.status}`;
                    data.message=`Unauthorised Access`;
                    delete JsonData.data.status;
                }
                else if(JsonData.event_type=='valveEvent'){
                    if ((data.status).toLowerCase() === 'open') {
                        data.message = 'Open'
                    }
                    if ((data.status).toLowerCase() === 'close') {
                        data.message = 'Close'
                    }
                }
                else if(JsonData.event_type== 'DeviceAliveEvent'){
                    let events=JsonData;
                    if(events.data && events.data.alive==='4'){
                        data.online="offline"
                    }
                    if(events.data && events.data.alive==='3'){
                        data.online="online"
                    }
                    data?.data?.alive && delete data.data.alive;
                }
                else if(JsonData.event_type == 'SecurityUpdateEvent'){
                    data = JSON.parse(JSON.stringify(JsonData.data));
                    if(['1','2','3'].includes(`${data.security_mode}`)){
                        let state_val='Disarm'
                        if(data.security_mode==1){
                            state_val='Arm'
                        }
                        if(data.security_mode==2){
                            state_val='Inhouse'
                        }
                        data={security_mode:state_val}
                        data.security_timestamp=new Date().getTime();
                    }  
                }
                else if(JsonData.event_type == 'SecurityAlertEvent'){
                    data = JSON.parse(JSON.stringify(JsonData.data));
                    if(data.security_alert!=undefined){
                        data={security_alert:data.security_alert};
                        data.message="Security Alert";
                        data.isEmergency=1;
                        data.security_timestamp=new Date().getTime();                            
                    }  
                }
                else if(JsonData.event_type == 'SecurityStatusEvent'){
                    data = JSON.parse(JSON.stringify(JsonData.data));
                }
                if (JsonData.data.status) {
                    data.state = JsonData.data.status;
                    delete data.status;
                }
                if(data.dimming!=undefined && data.dimming=='0'){
                    delete data.dimming;
                }
                 if (JsonData.data.switch || JsonData.data.endpoint) {
                    let swt=JsonData.data.endpoint || JsonData.data.switch
                    device_id = `${device_id}$${swt}`;
                    delete JsonData.data.switch;
                    delete JsonData.data.endpoint;
                }
                 if(JsonData.data && JsonData.data.isEmergency!=undefined){
                    data.isEmergency=JsonData.data.isEmergency
                }
                if (Object.keys(data).length > 0 && device_id!=undefined) {
                    await UpdateDeviceInfo(device_id,data)
                }
            }else if(JsonData.event_type == 'SetState' && JsonData.device_id!=undefined && (JsonData.device_id).length>10){
                let {event_type,device_id,...reqestObj}=JsonData;
                if(reqestObj.HVD!=undefined && reqestObj.HVD=="1"){
                    reqestObj.vtype="1";
                    reqestObj.message = "HIGH VOLTAGE"
                }
                else if(reqestObj.LVD!=undefined && reqestObj.LVD=="1"){
                    reqestObj.vtype="2";
                    reqestObj.message = "LOW VOLTAGE";
                }
                else if(reqestObj.OVD!=undefined && reqestObj.OVD=="1"){
                    reqestObj.vtype="3";
                    reqestObj.message = "OVERLOAD";
                }
                else if(reqestObj.AWM!=undefined && reqestObj.AWM=="1"){
                    reqestObj.vtype="4";
                    reqestObj.message = "AWAY MODE";
                }
                else if(reqestObj.LTR!=undefined && reqestObj.LTR=="1"){
                    reqestObj.vtype="5";
                    reqestObj.message = "TURNED ON for more than set time.";
                }
                else if(reqestObj.SBM!=undefined && reqestObj.SBM=="1"){
                    reqestObj.vtype="6";
                    reqestObj.message = "currently on standby.";
                }
                else if(reqestObj.APO!=undefined && reqestObj.APO=="1"){
                    reqestObj.vtype="7";
                    reqestObj.message = "AUTO TURNED OFF.";
                }
                if(reqestObj.is_phase!=undefined && (reqestObj.voltage_alert!=undefined || reqestObj.current_alert!=undefined || reqestObj.pf_alert!=undefined)){
                    if(reqestObj.voltage_alert!=undefined){
                        let state=`stable`;
                        if(reqestObj.voltage_alert=='2'){
                            state='high'
                        }
                        if(reqestObj.voltage_alert=='1'){
                            state='low'
                        }
                        reqestObj[`p${reqestObj.is_phase}_v_alert`]=`${reqestObj.voltage_alert}$$${reqestObj.V}`;
                        reqestObj.message=`has detected a ${state} voltage of ${reqestObj.V} V in Phase ${reqestObj.is_phase}.`;
                    }
                    if(reqestObj.current_alert!=undefined){
                        let state=`stable`;
                        if(reqestObj.current_alert=='1'){
                            state='high'
                        }
                        reqestObj[`p${reqestObj.is_phase}_c_alert`]=`${reqestObj.current_alert}$$${reqestObj.I}`;
                        reqestObj.message=`has detected a ${state} current of ${reqestObj.I} Amp in Phase ${reqestObj.is_phase}.`;
                    }
                    if(reqestObj.pf_alert!=undefined){
                        reqestObj[`p${reqestObj.is_phase}_pf_alert`]=`${reqestObj.pf_alert}$$${reqestObj.PF}`;
                        reqestObj.message=` has detected a power factor of ${rest.PF}  in Phase ${rest.is_phase}.`;
                        if(reqestObj.is_phase=='0'){
                            reqestObj.message=` has detected a total power factor of ${reqestObj.PF}.`;
                        }
                    }
                }
                if (reqestObj.switch || reqestObj.endpoint) {
                    let swt=reqestObj.endpoint || reqestObj.switch
                    device_id = `${device_id}$${swt}`;
                    delete reqestObj.switch;
                    delete reqestObj.endpoint;
                }
                UpdateDeviceInfo(device_id,reqestObj);
            }else if(JsonData.event_type == 'ChangeAP' && JsonData.device_id!=undefined && (JsonData.device_id).length>10){
                let {event_type,device_id,...reqestObj}=JsonData;
                if(reqestObj.ble_set==1){
                    reqestObj.isEmergency=1;
                    reqestObj.message='The device entered BLE provisioning mode. Please allow 3 minutes for the device to return to its regular operating mode.';
                    UpdateDeviceInfo(device_id,reqestObj);
                }
                
            }else if(JsonData.event_type == 'DeviceReset' && JsonData.device_id!=undefined && (JsonData.device_id).length>10){
                let {event_type,device_id,...reqestObj}=JsonData;
                    reqestObj.isEmergency=1;
                    reqestObj.reset_device=1;
                    reqestObj.message='Manually toggling the physical switch/reset 5 times in an ON-OFF sequence has resulted in the deletion of this device from your Wiser app, erasing all the historic associated data. To re-establish connection, kindly add this device again to your Wiser App by following the provided instructions.';
                    UpdateDeviceInfo(device_id,reqestObj);
            }else if(JsonData.event_type == 'EnergyEvent' && JsonData.device_id!=undefined && (JsonData.device_id).length>10 && (JsonData.data || JsonData.isPE==1 || JsonData.dt!=undefined)){
                let data=JSON.parse(JSON.stringify(JsonData));
                let flag=false;
                if(JsonData.isPE==1){
                    flag=true;
                    let {event_type,device_id,isPE,ts,...restdata}= JsonData
                }
                if(JsonData.dt!=undefined){
                    flag=true;
                    let {event_type,device_id,dt,ts,...restdata}= JsonData
                    data=restdata;
                }
                if(JsonData.data){
                    data=JSON.parse(JSON.stringify(JsonData.data))
                    if(JsonData.data.Pt!=undefined){
                        flag=true;
                    } 
                }
                let datares={};
                datares.device_id=`${JsonData.device_id.replace(/-/g,'')}`;
                datares.tsreg=((((5*60)+30)*60)*1000)

                if(JsonData.data && (JsonData.data.endpoint!=undefined || JsonData.data.switch!=undefined)){
                    datares.device_id+=`$${JsonData.data.endpoint}`|| `${JsonData.data.switch}`;
                }else if(JsonData.endpoint && JsonData.endpoint!=undefined){
                    datares.device_id+=`$${JsonData.endpoint}`;
                }
                if(flag){
                    let olddata=JSON.parse(JSON.stringify(data));
                    let [isValidEneygyTostore,results]=await lastRecord(datares.device_id,data,datares.tsreg,0);
                    if(Boolean(isValidEneygyTostore)){
                        let resultsdata=JSON.parse(JSON.stringify(results));
                        let minsdata=JSON.parse(JSON.stringify(results));
                        minsdata.D_Pt=olddata.Pt;
                        await mongo.updateOne('energy_total',datares.device_id,olddata);
                        let mins=await MongoMinInsert(datares.device_id,minsdata);
                        let days=await MongoDayInsert(datares.device_id,resultsdata);
                        let months=await MongoMonthInsert(datares.device_id,resultsdata);
                    }else {
                        logger.warn(`Device is Publishing Incorrect Energy Pt ${datares.device_id}`)
                    }
                }else{
                    data.ts=new Date().getTime()+datares.tsreg
                    await mongo.updateOne('energy_total',datares.device_id,data);
                }  
            }else if(JsonData.event_type == 'ActionUpdateEvent' && JsonData.device_id!=undefined && (JsonData.device_id).length>10){
                let device_id = JsonData.device_id;
                let data = JsonData.irObject;
                data.device_id=device_id;
                data.ts=new Date().getTime();
                let [states, results] = await mongo.save('irstate', data);
                if(states){
                    if(JsonData.setObject!=undefined && Object.keys(JsonData.setObject).length>0){
                        UpdateDeviceInfo(device_id,JsonData.setObject)
                    }
                    let setObject = JSON.parse(JSON.stringify(results));
                    delete setObject.device_id;
                    delete setObject._id;
                    await redis.setDataWithTTL(`device_ir_${device_id}`, setObject, (10 * 24 * 60 * 60));
                }  
            }else if(JsonData.event_type == 'ActionDeleteEvent' && JsonData.device_id!=undefined && (JsonData.device_id).length>10){
                let device_id = JsonData.device_id;
                let devices= await mysql.getModels().Devices.findOne({where:{device_id:device_id,device_state:'ADDED'}});
                if(devices){
                    devices.update({device_state:'DELETED'})
                    await VoiceActController.ghomedeviceSync(devices.user_id,devices.room_id,undefined,'sync');
                }  
            }else  if((JsonData.event_type=='DeviceAddedEvent' || JsonData.event_type=='ActionAddedEvent') && JsonData.device_id!=undefined && (JsonData.device_id).length>10){
                let {event_type,device_id,...rest}=JsonData;
                rest.mac_id=mac_id
                if(device_id!=undefined && device_id.length>10){
                    try{
                       await DeviceService.addDevices(device_id,rest).then(async ({status})=>{
                            if(Boolean(status)){
                            let AcknowlegmentRes={...JsonData}
                            AcknowlegmentRes.event_type='ServerDeviceAddedEvent'
                            try{
                                let group_id=(JsonData.device_id).split('-');
                                PubSubController.sendPubSub(group_id[0],AcknowlegmentRes)
                            }
                            catch(err){
                          logger.info(err);
                            }
                            //await VoiceActController.ghomedeviceSync(device.user_id,device.room_id,undefined,'sync'); 
                            }
                        });
                    }
                    catch(err){
                        logger.error('AddedError:',err)
                    }
                }
            }else if(['ZigbeeResetEvent','ZwaveResetEvent','ActionResetEvent','HubResetEvent'].includes(JsonData.event_type) && JsonData.device_id!=undefined && (JsonData.device_id).length>10){
                logger.info(JSON.stringify(event));
                let device_id=JsonData.device_id;
                let qurey = {
                    device_state: 'ADDED',
                    device_id:device_id
                };
                let device= await mysql.getModels().Devices.findOne({where:qurey,attributes:['hub_id','user_id','room_id']});
                if(device){
                    if(['ZigbeeResetEvent','ZwaveResetEvent'].includes(JsonData.event_type)){
                        let query={device_radio_type:'Z-WAVE'}
                        if(['ZigbeeResetEvent'].includes(JsonData.event_type)){
                            query={device_radio_type:'ZIGBEE'}
                        }
                        let category_ids=await mysql.getModels().DeviceCategory.findAll({where:query,attributes:['category_id']});
                        if(category_ids.length>0){
                            let cat_ids=category_ids.map((ele)=>{ return ele.category_id});
                            let devices= await mysql.getModels().Devices.findAll({where:{device_state:"ADDED",category_id:{[Op.in]:cat_ids},hub_id:device.hub_id,device_id:{[Op.not]:device_id}}});
                            if(devices.length>0){
                                devices.forEach(ele=>{
                                    ele.update({device_state:'DELETED',delete_at:new Date()});
                                })
                            }
                        }

                    }
                    if(['ActionResetEvent'].includes(JsonData.event_type)){
                        let devices= await mysql.getModels().Devices.findAll({where:{device_state:"ADDED",category_id:'91f98abb-7e90-40fa-ae46-8c54c1bbd563',hub_id:device.hub_id}});
                        if(devices.length>0){
                            devices.forEach(ele=>{
                                ele.update({device_state:'DELETED',delete_at:new Date()});
                            })
                        }
                    }
                    if(['HubResetEvent'].includes(JsonData.event_type)){
                        let hubs=await mysql.getModels().Hubs.findOne({where:{id:device.hub_id}});
                        if(hubs){
                            hubs.update({hub_id:`${hubs.hub_id}_${new Date().getTime()}`,is_active:0})
                        }
                        let devices= await mysql.getModels().Devices.findAll({where:{device_state:"ADDED",hub_id:device.hub_id}});
                        if(devices.length>0){
                            devices.forEach(ele=>{
                                ele.update({device_state:'DELETED',delete_at:new Date()});
                            })
                        }
                    } 
                    await VoiceActController.ghomedeviceSync(device.user_id,device.room_id,undefined,'sync');  
                }

            }else if(['ControlEvent'].includes(JsonData.event_type) && JsonData.device_id!=undefined && (JsonData.device_id).length>10){
                
                let device_id=JsonData.device_id;
                let qurey = {
                    device_state: 'ADDED',
                    device_id:device_id
                };
                let device= await mysql.getModels().Devices.findOne({where:qurey,attributes:['mac_id']});
                if(device && device.mac_id){
                    let [state,setObject]= await CheckJson(JsonData.setObject)
                    if(state && setObject!=undefined && Object.keys(setObject).length>0){
                        UpdateDeviceInfo(device_id,setObject)
                    }
                    try{
                        let data=JSON.parse(JsonData.content);
                        if(data!=undefined && Array.isArray(data)){
                            data.forEach((ele,index)=>{
                                setTimeout((mac_id,contant)=>{
                                    AZUREIOTController.sendCommand(mac_id,contant);
                                },(500*index),device.mac_id,JSON.stringify(ele));
                            })
                        }else{
                            AZUREIOTController.sendCommand(device.mac_id,JsonData.content);
                        }  
                    }catch(err){
                        logger.error(err);
                        AZUREIOTController.sendCommand(device.mac_id,JsonData.content);
                    }
                    
                }
            }
        }else{
            logger.info(`tested:${JSON.stringify(JsonData)}`); 
        }
    }catch(err){
        logger.warn(event);
        logger.error(err.message);
    }
}
async function lastRecordRedis(key_name,collection,device_id,ts){
    return new Promise(async (reslove)=>{
        try{
            let [state,result] = await redis.getStringData(key_name,true)
        if(state){
            reslove(result)
        }else{
            let [states,results]=await mongo.findSortedObjectsFields(collection,{_id:`${device_id}_${ts}`},{_id:0,oPt:1,oSt:1,Pt:1,Qt:1,St:1,idle:1,opr:1,stb:1,Pt1:1,Qt1:1,Pt2:1,Qt2:1,St2:1,PtN:1,StN:1,QtN:1,ltr:1,ts:1},{ts:-1},1);
            if(states && results.length>0){
                reslove(results[0])
            }else{
                reslove({});
            }
            
        }
        }catch(err){
            logger.error(err);
            reslove({});
        }
    })
}
async function lastRecord(device_id, data, region, ots) {
    return new Promise(async (resolve) => {
        try {
            const key_name = `total_energy_${device_id}`;
            let [state,devices] = await redis.getStringData(key_name,true)
            const ts = ots !== undefined && ots > 0 ? new Date(`${ots}`).getTime() + region : new Date().getTime() + region;
            data.ts = ts;
            if (!state) {
                let [state,result]=await mongo.findSortedObjectsFields('energy_total',{_id:device_id},{_id:0,Pt:1,Qt:1,St:1,PtN:1,StN:1,QtN:1,ltr:1},{ts:-1},1);
                if (state && result.length > 0) {
                    if(check_Pt(result[0], data)){
                        await redis.setDataWithTTL(key_name,data,(2*24*60*60))
                        let results=await calOperation(result[0], data, true)
                        resolve([true, results]);
                        return;
                    }else {
                        resolve([false, data]);
                        return;
                    }
                }else {
                    let results=await calOperation({}, data, true)
                    resolve([true, results]);
                    return;
                }
            }else if (state && check_Pt(devices, data)) {
                await redis.setDataWithTTL(key_name,data,(2*24*60*60))
                let results=await calOperation(devices, data, true)
                resolve([true, results]);
            } else {
                resolve([false, data]);
            }
        } catch (err) {
            logger.error(err);
            resolve([false, data]);
        }
    });
}

function check_Pt(lastRecord, currentRecord) {
    try {
        const lastRecordPt = parseFloat(lastRecord.Pt);
        const currentRecordPt = parseFloat(currentRecord.Pt);
        return Boolean(!isNaN(lastRecordPt) && !isNaN(currentRecordPt) && (lastRecordPt <= currentRecordPt));
    } catch (e) {
        logger.warn(e);
        return false;
    }
}
async function UpdateDeviceInfo(device_id,body){
    return new Promise(async (reslove)=>{
        try{
            //logger.info(`${device_id} ${JSON.stringify(body)}`);
            let qurey = {
                device_state: 'ADDED',
                device_id:{[Op.like]:`${device_id}%`}
            };
            let device= await mysql.getModels().Devices.findAll({where:qurey,attributes:['name', 'device_id', 'noti', 'hub_id', 'timeline', 'room_id', 'user_id', 'state', 'category_id', 'online','node_id','remote_model']});
            let ProArr=[];
            device.forEach(ele=>{
                ProArr.push(DevicesStateDevices(ele,body));
            })
            Promise.all(ProArr).then((result)=>{
            }) 
            reslove(true) 
        }
        catch(err){
            logger.error(`Sync devices error 1:${err.message}`);
            reslove(false)
        }
            

    })
}
const DevicesStateDevices=async (device,body)=>{
    return new Promise(async (reslove)=>{
        try{
            if(device){
                let devices= JSON.parse(JSON.stringify(device));
                if(devices.online=='0' || devices.online==false){
                    body.online=true;
                }
                let UpdateObj=await UtilsService.UpdateAndPushMessage(body,devices);
                let keysdatalength = parseInt(Object.keys(UpdateObj).length);
                if (keysdatalength > 0) {
                    device.update(UpdateObj);
                    try{
                        let catstates=await GhomeService.getCheckCategorys(devices.category_id);
                        if(catstates){
                            setTimeout(async (user_id,room_id,device_id)=>{
                                await VoiceActController.ghomedeviceSync(user_id,room_id,device_id,'state');
                            },1000,devices.user_id,devices.room_id,devices.device_id)    
                        }
                    }catch(err){
                        logger.error(`Sync devices error 2:${err.message}`);
                    }
                }
                await setState(devices.device_id,body);
                reslove(true)
            }else{
                reslove(false)
            }
        }
        catch(err){
            logger.error(`Sync devices error 3:${err.message}`);
            reslove(false)
        }
    })
}
const SetRedisState = async(device_id,body)=>{
    return new Promise(async(reslove)=>{
        try{
            let keyname = `device_${device_id}`;
            let [states, result] = await redis.getStringData(keyname, true);
            if (states && result && Object.keys(result).length > 0) {
                body.modifed = Object.keys(body);
                if(body && body.mode!= undefined && result.mode && result.mode!= undefined){
                    body.previous_mode=`${result.mode}`
                }
                body = Object.assign(result, body);
                reslove(body);
            } else {
                let [state, history] = await UtilsService.getMongoState('state', {
                    device_id: device_id
                }, 1)
                if (state && history.length > 0) {
                    body.modifed = Object.keys(body);
                    let resdata = JSON.parse(JSON.stringify(history[0]));
                    if(body && body.mode!= undefined && resdata.mode && resdata.mode!= undefined){
                        body.previous_mode=`${resdata.mode}`
                    }
                    body = Object.assign(resdata, body);
                    reslove(body);
                } else {
                    reslove(body);
                }
            }
        }catch(err){
            logger.error(err);
            reslove(body);
        } 
    })
}
const setState= async(device_id,reqObj)=>{
    return new Promise(async(reslove)=>{
        try{
            let body= await SetRedisState(device_id,reqObj);
            body.ts=new Date().getTime();
            body.device_id=device_id;
            let [state, result] = await mongo.save('state', body);
            if (state) {
                var setObject = JSON.parse(JSON.stringify(result));
                delete setObject.device_id;
                delete setObject._id;
                delete setObject.modifed;
                await redis.setDataWithTTL(`device_${device_id}`, setObject, (2 * 24 * 60 * 60));
                reslove(true)
            }else{
                reslove(false)
            }
        }
        catch(err){
            logger.error('Error:'+err.message);
            reslove(false)   
        }
    })
}

async function getWifiCategoryIds() {
    try {
    const [isExist, categoryIds] = await redis.getStringData('wifi_category_ids', true);
    if (isExist && Array.isArray(categoryIds)) return categoryIds;  
    const wifiCategoryIds = await mysql.getModels().DeviceCategory.findAll({
        where: { device_radio_type: 'WIFI' },
        attributes: ['category_id']
    });  
    if (wifiCategoryIds.length > 0) {
        const categoryIds = wifiCategoryIds.map((e) => e.category_id);
        await redis.setDataWithTTL('wifi_category_ids', categoryIds, 2 * 24 * 60 * 60);
        return categoryIds;
    }
  
      return [];
    } catch (error) {
      // Handle errors here, e.g., log them or throw a custom error
      logger.error('Error in getWifiCategoryIds:', error);
      throw error;
    }
}
async function updateinfo(dataObj) {
    try {
        return new Promise(async (resolve) => {
            if (Object.keys(dataObj).length > 0) {
                let qurey = {
                    device_state: 'ADDED',
                    device_id: { [Op.like]: `${dataObj.device_id}%` }
                };
                let device = await mysql.getModels().Devices.findAll({ where: qurey, attributes: ['name', 'device_id', 'category_id', 'user_id', 'hub_id'] });
                if (device.length > 0) {
                    let body = {};
                    let devices = JSON.parse(JSON.stringify(device));
                    let query = { user_id: devices[0].user_id }
                    let user = await mysql.getModels().UserDetails.findAll({ where:  query, attributes: ['company_id']  });
                    let users = JSON.parse(JSON.stringify(user));
                    if (users[0].company_id == 'fda7a9b7-df86-11ee-aa45-6045bde7ec3c') {
                        devices.forEach(async (ele) => {
                            let count = 0;
                            body.temp = dataObj.data.temp_C || dataObj.data.temperature_f;
                            let currentTime = new Date().getTime();
                            let currentDate = new Date();
                            let currentHour = currentDate.getHours();
                            if (currentHour >= 10 && currentHour < 22) {
                                let fourHoursAgo = currentTime - (4 * 60 * 60 * 1000);
                                let query = { device_id: ele.device_id.replace(/-/g, ""), ts: { $gte: fourHoursAgo, $lte: currentTime } };
                                let [states, result] = await mongo.findSortedObjectsFields('temperature_history', query, { temp: 1, _id: 0, ts: 1 }, { ts: -1 }, 0);
                                if (states && result.length > 0) {
                                    let sumTemp = result.reduce((sum, item) => sum + parseInt(item.temp), 0);
                                    let avgTemp = sumTemp / result.length;
                                    if (avgTemp < 24) {
                                        let keyname = `tempcount_${dataObj.device_id}`
                                        let [state, result1] = await redis.getStringData(keyname, true);
                                        if (!state) {
                                            body.user_id = ele.user_id;
                                            await UtilsService.UpdateAndPushMessage(body, ele);
                                            count++
                                            let tempcount = { count: count };
                                            var setObject = JSON.parse(JSON.stringify(tempcount));
                                            let tsx = new Date().getTime() + 19800000;
                                            let tdf = new Date().getTime() + 19800000;
                                            let tff = new Date(tdf)
                                            tff.setUTCHours(22, 0, 0)
                                            let tty = tff.getTime()
                                            let sec = Math.floor((tty - tsx) / 1000);
                                            let [states, rest] = await redis.setDataWithTTL(keyname, setObject, sec);
                                            if(states) {
                                                resolve(true)
                                            } else {
                                                resolve(false)
                                            }
                                        } else {
                                            resolve(true)
                                        }
                                    } else {
                                        resolve(true)
                                    }
                                } else {
                                    resolve(false)
                                }
                            }
                            else {
                                resolve(true)
                            }
                        })
                    } else {
                        resolve(false)
                    }

                } else {
                    resolve(false)
                }
            }
        })
    } catch (error) {
        logger.error('Error in sending notification:', error);
        throw error;
    }
}

