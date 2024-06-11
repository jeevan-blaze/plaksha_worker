let UtilsServices = require('./utils.services');
let { logger } = require('../../../logger');
let AzuerController = require('../../Mqtt/AzureIotCommandController')
let redis = require('../../database/redis');
let LIGHT_LIFX_GROUP = ['e857fda2-3d8b-4d01-a158-150b30fa0ecb']
let LIGHT_LIFX = ['64e1465b-2509-4a39-9a53-bbbd14869aaa']
let LIGHT_TUYA = ['e4bca9c8-a914-408d-b8c7-ce1870a4bb62','33a8b3e0-782b-4f6b-aa8e-542b6c780d25','e4bca9c8-a914-408d-b8c7-ce1870a4bb62','38c8d7f9-233d-44b0-a249-e088839d7599']
let TUYA_LIGHT_COLOR=['98d40a11-1776-4db3-82fc-133f3b84f752','2df67983-956a-4b7d-acaf-b9278e319d1c','19e1b021-c6c3-4910-bb6e-3fd862ce3fec']
let ZWAVE_SWITCH=['1fe8c5bb-08fb-4037-b894-52945e95e13b','48b3b167-bac9-4f22-8a8d-87777b3ef7af','8b3d347c-6222-43c5-9b42-b7f14c0d0894','06386905-032a-4c94-a761-f89c48a79ba4','f41bb4cb-523e-4cae-97b9-4423e490a92b'];
let ZWAVE_OUTLET=['8bf6b3b5-4c31-4cb6-b91d-91c823a99978'];
let ZWAVE_FAN=[];
let ZWAVE_DIMMER=['80db49e9-08da-450e-bd70-725e9ddeeee7','088d4b50-fda3-4d60-b0f2-6650724ae6f4'];
let ZWAVE_LOCK=['d8e0d183-2cbe-4b4d-9dbf-b5c34d104ea8','4c9e82ed-f3eb-4152-a5db-51d02d112663'];
let ZIGBEE_LOCK=['c5cc9deb-65a8-45ab-996b-ca6b6c009f58'];
let ZWAVE_CURTAIN=['6521905b-a7fc-47c4-a968-3951f62319a0','99696901-b87d-4f13-9d22-ee29704ff752','e81bfc43-61bc-4111-98a5-3a6edee58281'];
let ZWAVE_SIRAN=['8a4b09c3-1978-468d-a441-763fe8019d83'];
let ZWAVE_THERMOSTAT=['7e7bee24-7c3f-4d40-ae57-a29958ad5738'];
let ZWAVE_PSE03_THERMOSTAT=['0d057a96-b0c2-40a7-9472-ef568a3dd17b'];
let ZIGBEE_OUTLET=['a24176ec-c2eb-4480-80f7-d272f0e7d5ac','9af1dbe3-927e-491b-9fff-e3b87d8e7643']
let ZIGBEE_DIMMER=['adbeb28c-ebb2-4299-af74-a276911fe926'];
let ZIGBEE_SIRAN=['216c3ceb-08f8-4376-b75f-e22bdb4e64d1'];
let ZIGBEE_SWITCH=['de0e6cc5-840f-4888-abea-d04c5afeac0f','87c92188-49e1-4cf8-8aea-7580e88f01b3','c48bfa8a-defe-4db8-a43e-102f23837f8f'];
let ZIGBEE_CURTAIN=['90c5a574-bb22-4533-b2c3-3f65542b8e4a'];
let ZIGBEE_THERMOSTAT=['42ece83f-f655-450e-8f9f-bd3a95794346'];
let WIFI_SOCKET=['b875114a-71d9-4131-b6ed-1b083f59b9e3'];
let Private_Key='PdnDxIoWAe9WQzARp0As5FlzPmORUoQZ';
let AC_REMOTE=['a6f4d4c9-e326-4105-bb7c-152d368cdc5d'];
let TV_REMOTE=['d5c6ec14-881a-4d1a-b38d-7139bebeeaa7'];
let ZWAVE_DOOR_SENSOR=['11cd3c08-e75a-4a12-b2c2-8f83af285547'];
let ZIGBEE_DOOR_SENSOR=['8fe1d960-1772-4051-80ec-73ef821ab5e3'];
let OTHERREMOTES = ['d87127ca-f711-4f0d-a443-6e96d336a4cb',"d180a8ec-4201-41bd-ba08-16ade34aacfd","7edb7e80-cf69-40ce-a63b-408cd4380e70","3552afa7-0560-43a3-9198-fc4d84f4c575","8a31336e-c381-42c3-9e5d-22ea9ebea095","d09f4a3d-f368-4710-8561-326348ba5efa","c9df1ead-e06f-4b02-87a4-decc993ec589","d87127ca-f711-4f0d-a443-6e96d336a4cb","094fbdec-c3fc-4e64-993f-5815ae7099ae","c409206f-d06d-4bf3-9327-ef3bc8a61916","4cf95a4a-2c34-4c2b-9e24-54396022099f","091ec4e6-098f-463d-aeee-e15303262069","5ad6c717-cda6-45db-9216-9707ea258fe2","aa47925c-ba21-4960-b105-de1b67223293","9fe678b2-8463-4ac0-9b40-2381ac9e228c","b48b63b9-806b-480e-84d4-32d42996c6e1","3963030b-583c-4d8c-8778-c0e662b3081b","d5c6ec14-881a-4d1a-b38d-7139bebeeaa7","a6f4d4c9-e326-4105-bb7c-152d368cdc5d","446f61ab-2eb9-4478-b8fc-89451d8bb7ce","4d71e5dd-2e87-4e13-8640-0be9cdefbbfd","fa4c465b-b694-4eb1-8b98-d47d4a3145cf","278d9864-16b7-4662-a6fa-e8d2e6200b2e","d89a1cb3-b451-4560-bf3b-64c51b8e9170","bd2cbd07-ca55-42fe-8e0b-184897cb8ac6","55e9b894-3c7c-4e34-963b-fd548a163d66"];
let HubSecurity = ['70a2bbe3-505c-4828-8311-2c2fc3bbc755'];
let WIFI_DUEL_RELAY=['148a90c0-64c6-4c08-b40f-70e6e78407a1']
let OUTLET_TUYA=[
    'e0c48314-5579-4bf5-8728-bb6a8cff5353',
    'c80e7eb2-d121-4432-9cb1-24c0561c657e',
    '7535e6ef-c5f0-44a9-890a-43acf3256c10',
    'a8914aaa-47fe-4a62-bd05-6f963cd02537'
  ]
let SWITCH_TUYA = ['1a7c84b3-3116-4e98-8717-122fd638b9d3'];
let CURTAIN_TUYA=['9d82dcdb-dfe9-4336-b322-60a0954320fb'];
let QuickAction=['91f98abb-7e90-40fa-ae46-8c54c1bbd563'];
let ZIGBEE_WATER_VALVE=['7afb17d6-a649-4ab0-82b2-1b68c879c93c'];
let ZIGBEE_MOTION_SENSOR=['df196a3c-3ceb-4da1-a755-bd0ac7e8027e'];
let ZWAVE_MOTION_SENSOR=['c4f39b04-0032-4632-ae1e-9eb2d95eed3d'];
let Temp_Humidity_Sensor=['7910ac8b-dde3-452d-b3ff-456307ec6074'];

let types = {
    light: 'action.devices.types.LIGHT',
    outlet:'action.devices.types.OUTLET',
    curtain:'action.devices.types.CURTAIN',
    switch:'action.devices.types.SWITCH',
    lock:'action.devices.types.LOCK',
    thermostat:'action.devices.types.THERMOSTAT',
    scenes:'action.devices.types.SCENE',
    ac:'action.devices.types.AC_UNIT',
    tv:'action.devices.types.TV',
    sensor:'action.devices.types.SENSOR',
    door:"action.devices.types.DOOR",
    shutter:"action.devices.types.SHUTTER",
    security:"action.devices.types.SECURITYSYSTEM"
}
let triles = {
    onoff: 'action.devices.traits.OnOff',
    brightness: 'action.devices.traits.Brightness',
    color: 'action.devices.traits.ColorSetting',
    lockunlock:'action.devices.traits.LockUnlock',
    temperature:'action.devices.traits.TemperatureSetting',
    scene:"action.devices.traits.Scene",
    fanspeed:"action.devices.traits.FanSpeed",
    volume:"action.devices.traits.Volume",
    openclose:"action.devices.traits.OpenClose",
    armdisarm:"action.devices.traits.ArmDisarm",
    sensor:"action.devices.traits.OccupancySensing",
    humidity:"action.devices.traits.HumiditySetting",
    temphumidity:"action.devices.traits.TemperatureControl"
}

module.exports = {
    getDevices: (devices,comp_id) => {
        return new Promise((reslove) => {
            let PromArr=[];
            devices.forEach(ele=>{
                PromArr.push(getDeviceMapValue(ele,comp_id))  
            })
            Promise.all(PromArr).then(results=>{
                let device = results.reduce((curval,ele)=>{
                    if(Object.keys(ele).length>0){
                        curval.push(ele)
                    }
                    return curval;
                },[])
                reslove(device)
            })
            
        })
    },
    getDevicesAlexa: (devices,comp_id) => {
        return new Promise((reslove) => {
            let PromArr=[];
            devices.forEach(ele=>{
                PromArr.push(getDeviceMapValueAlexa(ele,comp_id))  
            })
            Promise.all(PromArr).then(results=>{
                let device = results.reduce((curval,ele)=>{
                    if(Object.keys(ele).length>0){
                        curval.push(ele)
                    }
                    return curval;
                },[])
                reslove(device)
            })
            
        })
    },
    getQuary: (devices, comp_id) => {
        return new Promise(async (reslove) => {
            let reqObject = {};
            reqObject.comp_id = comp_id;
            if (LIGHT_LIFX_GROUP.includes(devices.category_id)) {
                reqObject.hub_id = devices.hubid;
                reqObject.tp_id = '2';
                reqObject.op = 'device';
                reqObject.dev_id = `group_id:${devices.node_id}`;
                let [state,device_id,body]= await UtilsServices.callLambdhaFunction(reqObject,devices.device_id)
                let status={}
                if(body.status && body.data && (body.data).length>0){
                    status[`${device_id}`]= (body.data).reduce((result,ele)=>{
                        if(ele.power=='on'){
                            result.on=true;
                        }
                        if(ele.connected){
                            result.online=true;
                        }
                        if(ele.brightness){
                            result.brightness=parseInt((ele.brightness)*100);
                        }
                        let color={}
                        if(ele.color){
                            color={spectrumHSV:{"hue": ele.color.hue,
                            "saturation": 1,
                            "value": 1}}
                        }
                        if(ele.color.kelvin){
                            color['temperatureK']=ele.color.kelvin
                        }
                        if(Object.keys(color).length>0){
                            result.color=color
                        }
                        return result
                    },{on:false,brightness:0,online:false,status:'SUCCESS'})  

                }else{
                    status[`${device_id}`]= {
                        "errorCode": "deviceOffline",
                        "status" : "ERROR"
                      }
                }
                reslove(status);
            }
            if (LIGHT_LIFX.includes(devices.category_id)) {
                reqObject.hub_id = devices.hubid;
                reqObject.tp_id = '2';
                reqObject.op = 'device';
                reqObject.dev_id = `id:${devices.node_id}`;
                let [state,device_id,body]= await UtilsServices.callLambdhaFunction(reqObject,devices.device_id)
                let status={}
                if(body.status && body.data && (body.data).length>0){
                    status[`${device_id}`]= (body.data).reduce((result,ele)=>{
                        if(ele.power=='on'){
                            result.on=true;
                        }
                        if(ele.connected){
                            result.online=true;
                        }
                        if(ele.brightness && ele.power=='on'){
                            result.brightness=parseInt((ele.brightness)*100);
                        }
                        let color={}
                        if(ele.color){
                            color={spectrumHSV:{"hue": ele.color.hue,
                            "saturation": 1,
                            "value": 1}}
                        }
                        if(ele.color.kelvin){
                            color['temperatureK']=ele.color.kelvin
                        }
                        if(Object.keys(color).length>0){
                            result.color=color
                        }
                        return result
                    },{on:false,brightness:0,online:false,status:'SUCCESS'})  

                }else{
                    status[`${device_id}`]= {
                        "errorCode": "deviceOffline",
                        "status" : "ERROR"
                      }
                }
                reslove(status);
            }
            if (LIGHT_TUYA.includes(devices.category_id) || TUYA_LIGHT_COLOR.includes(devices.category_id)) {
                reqObject.tuyaurl = devices.remote_model;
                reqObject.tp_id = '1';
                reqObject.op = 'status';
                reqObject.dev_id = `${devices.node_id}`;
                let [state,device_id,body]= await UtilsServices.callLambdhaFunction(reqObject,devices.device_id)
                let status={}
                if(body && body.success!=undefined && body.result && (body.result).length>0){
                    let colormode='';
                    status[`${device_id}`]= (body.result).reduce((result,ele)=>{
                        if(ele.code=='switch_led' && ele.value){
                            result.on=true;
                        }
                        if(ele.code==='bright_value'){
                            if(ele.value==25){
                                result.brightness=1; 
                            }else{
                                result.brightness=Math.round(((ele.value-25)/(255-25))*100);
                            }
                        }
                        if(ele.code=='bright_value_v2'){
                            if(ele.value==10){
                                result.brightness=1; 
                            }else{
                                result.brightness=Math.round(((ele.value-10)/(1000-10))*100); 
                            } 
                        }                        
                        if(ele.code=='work_mode'){
                            colormode=ele.value
                        }
                        if(ele.code=='colour_data_v2'){
                            let codes=JSON.parse(ele.value);
                            if(colormode=='colour'){
                                if(codes.v==10){
                                    result.brightness=1; 
                                }else{
                                    result.brightness=Math.round(((codes.v-10)/(1000-10))*100); 
                                }
                            }
                            result.color={spectrumHsv:{"hue": codes.h,
                            "saturation": 1,
                            "value": 1}}
                        }
                        if(ele.code=='colour_data'){
                            let codes=JSON.parse(ele.value);
                            if(colormode=='colour'){
                                if(codes.v==25){
                                    result.brightness=1; 
                                }else{
                                    result.brightness=Math.round(((codes.v-25)/(255-25))*100);
                                }
                                
                            }
                            result.color={spectrumHSV:{"hue": codes.h,
                            "saturation": 1,
                            "value": 1}}
                        }
                        if(devices.online!=='0'){
                            result.online=true;
                        } 
                        return result
                    },{on:false,brightness:0,online:false,status:'SUCCESS'})  

                }else{
                    status[`${device_id}`]= {
                        "errorCode": "deviceOffline",
                        "status" : "ERROR"
                      }
                }
                reslove(status);
            }
            if (OUTLET_TUYA.includes(devices.category_id) || SWITCH_TUYA.includes(devices.category_id)) {
                reqObject.tuyaurl = devices.remote_model;
                reqObject.tp_id = '1';
                reqObject.op = 'status';
                reqObject.dev_id = `${devices.node_id}`;
                let [state,device_id,body]= await UtilsServices.callLambdhaFunction(reqObject,devices.device_id)
                let status={}
                if(body.success && body.result && (body.result).length>0){
                    status[`${device_id}`]= (body.result).reduce((result,ele)=>{
                        if((ele.code).indexOf('switch')>-1 && ele.value && !result.on){
                            result.on=true;
                        }
                        if(devices.online!=='0'){
                            result.online=true;
                        } 
                        return result
                    },{on:false,online:false,status:'SUCCESS'})  

                }else{
                    status[`${device_id}`]= {
                        "errorCode": "deviceOffline",
                        "status" : "ERROR"
                      }
                }
                reslove(status);
            }
            if (CURTAIN_TUYA.includes(devices.category_id)) {
                reqObject.tuyaurl = devices.remote_model;
                reqObject.tp_id = '1';
                reqObject.op = 'status';
                reqObject.dev_id = `${devices.node_id}`;
                let [state,device_id,body]= await UtilsServices.callLambdhaFunction(reqObject,devices.device_id)
                let status={}
                if(body.success && body.result && (body.result).length>0){
                    status[`${device_id}`]= (body.result).reduce((result,ele)=>{
                        if((ele.code).indexOf('control')>-1 && (ele.value=='open'||ele.value=='stop') && !result.on){
                            result.on=true;
                        }
                        if(devices.online!=='0'){
                            result.online=true;
                        } 
                        return result
                    },{on:false,online:false,status:'SUCCESS'})  

                }else{
                    status[`${device_id}`]= {
                        "errorCode": "deviceOffline",
                        "status" : "ERROR"
                      }
                }
                reslove(status);
            }
            if(ZWAVE_SWITCH.includes(devices.category_id) || ZWAVE_OUTLET.includes(devices.category_id) || ZIGBEE_OUTLET.includes(devices.category_id) || ZIGBEE_SWITCH.includes(devices.category_id) || WIFI_SOCKET.includes(devices.category_id) || WIFI_DUEL_RELAY.includes(devices.category_id)){
                let status={}
                let state={on:true,online:true,status:'SUCCESS'}
                if(devices.state=='off' || devices.state=='0'){
                    state.on=false;
                }
                if(devices.online==='0'){
                    state.online=false  
                }
                status[`${devices.device_id}`]=state ;
                reslove(status); 
            }
            if(ZWAVE_SIRAN.includes(devices.category_id) || (ZIGBEE_SIRAN.includes(devices.category_id))){
                let status={}
                let state={on:true,online:true,status:'SUCCESS'}
                if(devices.state=='siren_deactivated'){
                    state.on=false;
                }
                if(devices.online==='0'){
                    state.online=false  
                }
                status[`${devices.device_id}`]=state ;
                reslove(status); 
            }
            if(ZWAVE_LOCK.includes(devices.category_id)|| ZIGBEE_LOCK.includes(devices.category_id)){
                let status={}
                let state={isLocked:true,isJammed:true,online:true,status:'SUCCESS'}
                if(devices.state=='unlocked'){
                    state.isLocked=false;
                }
                if(devices.online==='0'){
                    state.online=false  
                }
                status[`${devices.device_id}`]=state ;
                reslove(status);

            }
            if(ZWAVE_CURTAIN.includes(devices.category_id) || ZIGBEE_CURTAIN.includes(devices.category_id)){
                let status={}
                let state={on:true,online:true,status:'SUCCESS'}
                state.openPercent= 100
                if(devices.state=='close'){
                    state.openPercent = 0
                    state.on=false;
                }
                if(devices.online==='0'){
                    state.online=false  
                }
                status[`${devices.device_id}`]=state ;
                reslove(status);
            }
            if(ZWAVE_DIMMER.includes(devices.category_id) || ZIGBEE_DIMMER.includes(devices.category_id)){
                let status={}
                let state={on:true,brightness:0,online:true,status:'SUCCESS'}
                if(devices.state=='off'){
                    state.on=false;
                }
                if(devices.online==='0'){
                    state.online=false  
                }
                let keyname=`device_${devices.device_id}`;
                let [states, result] = await redis.getStringData(keyname, true);
                if (states && result && Object.keys(result).length > 1) {
                    if(result.dimming){
                        state.brightness=result.dimming;  
                    }
                }else{
                    let [state, history] = await UtilsServices.getMongoState('state', {
                        device_id: devices.device_id
                    }, 1); 
                    if(state){
                        if(history.length>0){
                            let stateres=JSON.parse(JSON.stringify(history[0]))
                            await redis.setDataWithTTL(`device_${devices.device_id}`, stateres, (2 * 24 * 60 * 60));
                            if(stateres.dimming){
                                state.brightness=stateres.dimming;  
                            }
                        }
                    } 
                }
                status[`${devices.device_id}`]=state ;
                reslove(status); 
            }
            if(ZWAVE_THERMOSTAT.includes(devices.category_id) || ZIGBEE_THERMOSTAT.includes(devices.category_id)){
                let status={}
                let state={thermostatMode:'on',thermostatTemperatureSetpoint:0,online:true,status:'SUCCESS'}
                if(devices.online==='0'){
                    state.online=false  
                }
                let keyname=`device_${devices.device_id}`;
                let [states, result] = await redis.getStringData(keyname, true);
                if (states && result && Object.keys(result).length > 1) {
                    if(result.mode){
                        if(result.mode=='auto'){
                            result.mode='heatcool'
                        }
                        state.thermostatMode=result.mode; 
                        if(result.mode=='cool'){
                            state.thermostatTemperatureSetpoint=((result.cooling-32)*5/9);
                        }
                        if(result.mode=='heat'){
                            state.thermostatTemperatureSetpoint=((result.heating-32)*5/9);
                        } 
                    }
                    if(result.temperature_f){
                        state.thermostatTemperatureAmbient=((result.temperature_f-32)*5/9);  
                    }
                }else{
                    let [state, history] = await UtilsServices.getMongoState('state', {
                        device_id: devices.device_id
                    }, 1); 
                    if(state){
                        if(history.length>0){
                            let stateres=JSON.parse(JSON.stringify(history[0]))
                            await redis.setDataWithTTL(`device_${devices.device_id}`, stateres, (2 * 24 * 60 * 60));
                            if(stateres.mode){
                                if(stateres.mode=='auto'){
                                    stateres.mode='heatcool'
                                }
                                state.thermostatMode=stateres.mode;  
                                if(stateres.mode=='cool'){
                                    state.thermostatTemperatureSetpoint=((stateres.cooling-32)*5/9);
                                }
                                if(stateres.mode=='heat'){
                                    state.thermostatTemperatureSetpoint=((stateres.heating-32)*5/9);
                                }
                            }
                            
                            if(stateres.temperature_f){
                                state.thermostatTemperatureAmbient=((stateres.temperature_f-32)*5/9);  
                            }
                        }
                    } 
                }
                status[`${devices.device_id}`]=state ;
                reslove(status); 
            }
            if(ZWAVE_PSE03_THERMOSTAT.includes(devices.category_id)){
                let status={}
                let state={thermostatMode:'on',thermostatTemperatureSetpoint:0,online:true,status:'SUCCESS'}
                if(devices.online==='0'){
                    state.online=false  
                }
                let keyname=`device_${devices.device_id}`;
                let [states, result] = await redis.getStringData(keyname, true);
                if (states && result && Object.keys(result).length > 1) {
                    if(result.mode){
                        if(result.mode=='auto'){
                            result.mode='heatcool'
                        }
                        if(result.mode=='fan only'){
                            result.mode='fan'
                        }
                        state.thermostatMode=result.mode; 
                        if(result.mode=='cool'){
                            state.thermostatTemperatureSetpoint=((result.cooling-32)*5/9);
                        }
                        if(result.mode=='heat'){
                            state.thermostatTemperatureSetpoint=((result.heating-32)*5/9);
                        }
                        if(result.mode=='dry'){
                            state.thermostatTemperatureSetpoint=((result.dry_air-32)*5/9);
                        } 
                    }
                    if(result.temperature_f){
                        state.thermostatTemperatureAmbient=((result.temperature_f-32)*5/9);  
                    }
                }else{
                    let [state, history] = await UtilsServices.getMongoState('state', {
                        device_id: devices.device_id
                    }, 1); 
                    if(state){
                        if(history.length>0){
                            let stateres=JSON.parse(JSON.stringify(history[0]))
                            await redis.setDataWithTTL(`device_${devices.device_id}`, stateres, (2 * 24 * 60 * 60));
                            if(stateres.mode){
                                if(stateres.mode=='auto'){
                                    stateres.mode='heatcool'
                                }
                                if(stateres.mode=='fan only'){
                                    stateres.mode='fan'
                                }
                                state.thermostatMode=stateres.mode;  
                                if(stateres.mode=='cool'){
                                    state.thermostatTemperatureSetpoint=((stateres.cooling-32)*5/9);
                                }
                                if(stateres.mode=='heat'){
                                    state.thermostatTemperatureSetpoint=((stateres.heating-32)*5/9);
                                }
                                if(stateres.mode=='dry'){
                                    state.thermostatTemperatureSetpoint=((stateres.dry_air-32)*5/9);
                                }
                            }
                            
                            if(stateres.temperature_f){
                                state.thermostatTemperatureAmbient=((stateres.temperature_f-32)*5/9);  
                            }
                        }
                    } 
                }
                status[`${devices.device_id}`]=state ;
                reslove(status); 
            }
            if(QuickAction.includes(devices.category_id)){
                let status={}
                let state={online:true,status:'SUCCESS'}
                if(devices.online==='0'){
                    state.online=false  
                }
                status[`${devices.device_id}`]=state ;
                reslove(status); 
            }
            if(HubSecurity.includes(devices.category_id)){
                let status={}
                let state={isArmed:true,online:true,status:'SUCCESS'}
                state.online=devices.online
                    state.isArmed=false;
                    let keyname=`device_${devices.device_id}`;
                    let [states, result] = await redis.getStringData(keyname, true);
                    if (states && result && Object.keys(result).length > 1) {
                        if(result.security_mode=='Arm'){
                            state.isArmed=true;
                            state.currentArmLevel= "away_key";
                        }
                        if(result.security_mode=='Inhouse'){
                            state.isArmed=true;
                            state.currentArmLevel= "home_key";
                        }
                        status[`${devices.device_id}`]=state ;
                        reslove(status);
                    }else{
                        let [state, history] = await UtilsServices.getMongoState('state', {
                            device_id: devices.device_id
                        }, 1); 
                        if(state){
                            if(history.length>0){
                                let stateres=JSON.parse(JSON.stringify(history[0]))
                                await redis.setDataWithTTL(`device_${devices.device_id}`, stateres, (2 * 24 * 60 * 60));
                                if(stateres.security_mode=='Arm'){
                                    state.isArmed=true;
                                    state.currentArmLevel= "away_key";
                                }
                                if(stateres.security_mode=='Inhouse'){
                                    state.isArmed=true;
                                    state.currentArmLevel= "home_key";
                                }   
                            }
                        } 
                        status[`${devices.device_id}`]=state ;
                        reslove(status);
                    }
                 
            }
            if(ZWAVE_DOOR_SENSOR.includes(devices.category_id) || ZIGBEE_DOOR_SENSOR.includes(devices.category_id)){
                let status={}
                let state={online:true,status:'SUCCESS'}
                if(devices.online==='0'){
                    state.online=false  
                }
                // state.openStaate=[{
                //     openPercent:0,
                //     openDirection:"OUT"
                // }]
                 state.openPercent=0;
                 if(devices.state=='open' || devices.state=='1'){
                     state.openPercent=100;
                        // state.openStaate=[{
                        //     openPercent:100,
                        //     openDirection:"IN"
                        // }]
                 }
                status[`${devices.device_id}`]=state ;
                reslove(status);

            }
            if(ZIGBEE_MOTION_SENSOR.includes(devices.category_id)||ZWAVE_MOTION_SENSOR.includes(devices.category_id)){
                let status={};
                let state={online:true,status:'SUCCESS'}
                   state.occupancy='UNOCCUPIED'
                if(devices.state=='motion_detected'){
                    state.occupancy='OCCUPIED'
                }
                status[`${devices.device_id}`]=state ;
                reslove(status);

            }
            if(Temp_Humidity_Sensor.includes(devices.category_id)){
                let status={};
                let state={online:true,status:'SUCCESS'};
                if(devices.online==='0'){
                    state.online=false  
                }
                let keyname=`device_${devices.device_id}`;
                let [states, result] = await redis.getStringData(keyname, true);
                if(states && result && Object.keys(result).length > 1){
                    state["humidityAmbientPercent"]= parseInt(result.humidity);
                    state["temperatureAmbientCelsius"]=parseFloat(((result.temperature_f-32)*5)/9);
                }else{
                    let [state, history] = await UtilsServices.getMongoState('state', {
                        device_id: devices.device_id
                    }, 1); 
                    if(state && history.length>0){
                        let statedata=JSON.parse(JSON.stringify(history[0]))
                        redis.setDataWithTTL(`device_${devices.device_id}`, statedata, (2 * 24 * 60 * 60));
                        state["humidityAmbientPercent"]= parseInt(statedata.humidity);
                        state["temperatureAmbientCelsius"]=parseFloat(((statedata.temperature_f-32)*5)/9);
                    }
                }
                
                status[`${devices.device_id}`]=state ;
                reslove(status);
            }
            if(AC_REMOTE.includes(devices.category_id)){
                let status={}
                let state={thermostatMode:'off',on:false,thermostatTemperatureSetpoint:0,online:true,status:'SUCCESS'}
                if(devices.online==='0'){
                    state.online=false  
                }
                let [acstate,result]=await getStateCollections(devices.device_id,'state','device');
                if(acstate){
                    let mode='auto'
                    state.on=true;
                    if(result.current_mode=='5'){
                        state.thermostatMode='off';
                        state.on=false;
                    }
                    else if(result.current_mode=='1'){
                        mode='cool'
                        state.thermostatMode='cool';
                    }
                    else if(result.current_mode=='2'){
                        mode='dry'
                        state.thermostatMode='dry';
                    }
                    else if(result.current_mode=='3'){
                        mode='fan'
                        state.thermostatMode='fan-only';
                    }
                    else if(result.current_mode=='0'){
                        mode='auto'
                        state.thermostatMode='auto';
                    }
                    else if(result.current_mode=='4'){
                        mode='heat'
                        state.thermostatMode='heat';
                    }else{
                        state.thermostatMode='auto';
                    }
                    let last_state=(result.last_status_ac_remote).split(',');
                    if(last_state[2]==0){
                        state.currentFanSpeedSetting= "speed_auto";
                    }
                    if(last_state[2]==1){
                        state.currentFanSpeedSetting= "speed_low";
                    }
                    if(last_state[2]==2){
                        state.currentFanSpeedSetting= "speed_mid";
                    }
                    if(last_state[2]==3){
                        state.currentFanSpeedSetting= "speed_high";
                    }
                    state.thermostatTemperatureSetpoint=parseFloat(result[`temp_${mode}`]);
                }else{
                    status[`${devices.device_id}`]= {
                        "errorCode": "deviceOffline",
                        "status" : "ERROR"
                      } 
                }
                status[`${devices.device_id}`]=state ;
                reslove(status); 
            }
            if(TV_REMOTE.includes(devices.category_id)){
                let status={}
                let state={on:false,currentVolume:6,"isMuted": false,online:true,status:'SUCCESS'}
                status[`${devices.device_id}`]=state ;
                reslove(status); 
            }
              
        })
    },
    getExecute:(devices,comp_id,command,params)=>{
        return new Promise(async (reslove) => {
            let reqObject = {};
            reqObject.comp_id = comp_id;
            if (LIGHT_LIFX_GROUP.includes(devices.category_id)) {
                reqObject.hub_id = devices.hubid;
                reqObject.tp_id = '2';
                reqObject.op = 'control';
                reqObject.dev_id = `group_id:${devices.node_id}`;
                if(command=='action.devices.commands.OnOff' || command=='OnOff'){
                    let state='off'
                    if(params.on){
                        state='on'
                    }
                    reqObject.command={
                        power:state
                    }
                }
                
                if(command=='action.devices.commands.BrightnessAbsolute' || command=='Brightness'){
                    if(params.brightness>0){
                        reqObject.command={
                            power:'on',
                            brightness:(params.brightness)/100
                        }
                    }else{
                        reqObject.command={
                            power:'off'
                        } 
                    }
                }
                reqObject.command.fast=true;
                let [state,device_id,body]= await UtilsServices.callLambdhaFunction(reqObject,devices.device_id)
                let status={}
                status['ids']=[`${device_id}`];
                status['status']='SUCCESS';
                let states={on:false,online:true}
                if(command=='action.devices.commands.OnOff' || command=='OnOff'){
                    states.on=params.on
                } 
                if(command=='action.devices.commands.BrightnessAbsolute'|| command=='Brightness'){
                   if(params.brightness>0){
                    states.on=true;
                   }
                   states.brightness=params.brightness
                }
                status['states']=states;
                reslove(status);
            }
            else if (LIGHT_LIFX.includes(devices.category_id)) {
                reqObject.hub_id = devices.hubid;
                reqObject.tp_id = '2';
                reqObject.op = 'control';
                reqObject.dev_id = `id:${devices.node_id}`;
                if(command=='action.devices.commands.OnOff' || command=='OnOff'){
                    let state='off'
                    if(params.on){
                        state='on'
                    }
                    reqObject.command={
                        power:state
                    }
                }
                if(command=='action.devices.commands.BrightnessAbsolute' || command=='Brightness'){
                    if(params.brightness>0){
                        reqObject.command={
                            power:'on',
                            brightness:(params.brightness)/100
                        }
                    }else{
                        reqObject.command={
                            power:'off'
                        } 
                    }
                }
                if(command=='action.devices.commands.ColorAbsolute' || command=='ColorAbsolute'){
                    reqObject.command={
                        power:'on'
                    }
                    if(params.color && params.color.temperature){
                        reqObject.command['color']= {
                            "hue": 0,
                            "saturation": 0,
                            "kelvin": params.color.temperature
                        }
                    }
                    if(params.color && params.color.spectrumHSV){
                        let codes=params.color.spectrumHSV;
                        reqObject.command['color']= {
                            "hue": codes.hue,
                            "saturation":codes.saturation,
                            "kelvin": 3500
                        }
                    }
                }
                reqObject.command.fast=true;
                let [state,device_id,body]= await UtilsServices.callLambdhaFunction(reqObject,devices.device_id)
                let status={}
                status['ids']=[`${device_id}`];
                status['status']='SUCCESS';
                let states={on:false,online:true}
                if(command=='action.devices.commands.OnOff'  || command=='OnOff'){
                    states.on=params.on
                } 
                if(command=='action.devices.commands.BrightnessAbsolute' || command=='Brightness'){
                   if(params.brightness>0){
                    states.on=true;
                   }
                   states.brightness=params.brightness
                }
                if(command=='action.devices.commands.ColorAbsolute' || command=='ColorAbsolute'){
                    if(params.color){
                     states.on=true;
                    }
                    states.color=params.color
                 }
                status['states']=states;
                reslove(status);
            }
            else if (LIGHT_TUYA.includes(devices.category_id) || TUYA_LIGHT_COLOR.includes(devices.category_id)) {
                let status={}
                if(devices.online!=='0'){
                    reqObject.tuyaurl = devices.remote_model;
                    reqObject.tp_id = '1';
                    reqObject.op = 'control';
                    reqObject.dev_id = `${devices.node_id}`;
                    if(command=='action.devices.commands.OnOff' || command=='OnOff'){
                        reqObject.commands=[{
                            code:'switch_led',
                            value:params.on
                        }]
                    }
                    if(command=='action.devices.commands.ColorAbsolute' || command=='ColorAbsolute'){
                        let command=[{
                            code:'switch_led',
                            value:true
                        },{
                            code:'work_mode',
                            value:"colour"
                        }]
                        reqObject.op='status'
                        let [state,device_id,body]= await UtilsServices.callLambdhaFunction(reqObject,devices.device_id);
                        
                        if(params.color && params.color.spectrumHSV && body.success && body.result && (body.result).length>0){
                            let codes=params.color.spectrumHSV;
                            command=(body.result).reduce((commands,ele)=>{
                                if(ele.code=='colour_data'){
                                    let color= JSON.parse(ele.value);
                                    let s = color.s;
                                    let v = color.v
                                    let value={h:parseInt(`${codes.hue}`),s:s,v:v}
                                    commands.push({code:ele.code,value})
                                }
                                if(ele.code=='colour_data_v2'){
                                    let color= JSON.parse(ele.value);
                                    let s = color.s;
                                    let v = color.v
                                    let value={h:parseInt(`${codes.hue}`),s:s,v:v}
                                    commands.push({code:ele.code,value})
                                }
                                return commands;
                            },command)
                            logger.info(JSON.stringify(command));
                        }
                        reqObject.op = 'control';
                        reqObject.commands=command
                    }
                    if(command=='action.devices.commands.BrightnessAbsolute' || command=='Brightness'){            
                        if(params.brightness>0){
                        reqObject.op='status'
                        let [state,device_id,body]= await UtilsServices.callLambdhaFunction(reqObject,devices.device_id);
                        if(body.success && body.result && (body.result).length>0){
                            let command=[{
                                code:'switch_led',
                                value:true
                            }]
                            let codes= (body.result).map(ele=> {return ele.code});
                            let output = (body.result).reduce((result,ele)=> {
                                result[`${ele.code}`]=ele.value;
                                return result;
                            },{});
                            
                            if(codes.includes('bright_value') && codes.includes('work_mode')){
                                command.push({code:'bright_value',value:Math.round((230/100)*params.brightness)})+25
                            }else if(codes.includes('temp_value') && codes.includes('work_mode')){
                                command.push({code:'temp_value',value:Math.round((255/100)*params.brightness)})
                            }else if(codes.includes('bright_value_v2')){
                                command.push({code:'bright_value_v2',value:Math.round((1000/100)*params.brightness)})
                            }else if(codes.includes('bright_value')){
                                command.push({code:'bright_value',value:Math.round((230/100)*params.brightness)+25})
                            }
                            
                            if(codes.includes('work_mode')){
                                command.push({code:'work_mode',value:output['work_mode']})
                            }
                            if(codes.includes('work_mode') && codes.includes('colour_data')  && ((['scene','colour','music']).includes(output['work_mode']))){
                                let data=JSON.parse(output['colour_data']);
                                if(data.v){
                                    data.v=Math.round((((255-25)/100)*params.brightness)+25)
                                }
                                command.push({code:'colour_data',value:JSON.stringify(data)})
                            }
                            if(codes.includes('work_mode') && codes.includes('colour_data_v2') && ((['scene','colour','music']).includes(output['work_mode']))){
                                let data=JSON.parse(output['colour_data_v2']);
                                if(data.v){
                                    data.v=parseInt((1000/100)*params.brightness)
                                }
                                command.push({code:'colour_data_v2',value:JSON.stringify(data)})
                            }
                            reqObject.op = 'control';
                            reqObject.commands=command
                        }else{
                            let command=[{
                                code:'switch_led',
                                value:true
                            }]
                            reqObject.commands=command
                        }                            
                        }else{
                            let command=[{
                                code:'switch_led',
                                value:false
                            }]
                            reqObject.commands=command
                        }
                    }
                    let [state,device_id,body]= await UtilsServices.callLambdhaFunction(reqObject,devices.device_id)
                    if(body.success){
                        if(command=='action.devices.commands.OnOff'  || command=='OnOff'){
                            status['ids']=[`${device_id}`];
                            status['status']='SUCCESS';
                            status['states']={
                                on:params.on,
                                online:true
                            }
                        }
                        if(command=='action.devices.commands.BrightnessAbsolute' || command=='Brightness'){
                            status['ids']=[`${device_id}`];
                            status['status']='SUCCESS';
                            let state=false;
                            if(params.brightness) state=true;
                            status['states']={
                                on:state,
                                online:true,
                                brightness:params.brightness
                            }
                        }
                        if(command=='action.devices.commands.ColorAbsolute' || command=='ColorAbsolute'){
                            status['ids']=[`${device_id}`];
                            status['status']='SUCCESS';
                            let state=false;
                            if(params.color) state=true;
                            status['states']={
                                on:state,
                                online:true,
                                color:params.color
                            }
                        }
                    }else{
                        status= {
                            "errorCode": "deviceOffline",
                            "status" : "ERROR"
                          }
                        status['ids']=[`${devices.device_id}`];
                    }
                    reslove(status);
                }else{
                    status= {
                        "errorCode": "deviceOffline",
                        "status" : "ERROR"
                      }
                      status['ids']=[`${devices.device_id}`];
                      reslove(status);
                }
                
            }
            else if (OUTLET_TUYA.includes(devices.category_id) || SWITCH_TUYA.includes(devices.category_id)) {
                let status={}
                if(devices.online!=='0'){
                    reqObject.tuyaurl = devices.remote_model;
                    reqObject.tp_id = '1';
                    reqObject.op = 'control';
                    reqObject.dev_id = `${devices.node_id}`;
                    if(command=='action.devices.commands.OnOff' || command=='OnOff'){  
                        reqObject.op='status'
                        let [state,device_id,body]= await UtilsServices.callLambdhaFunction(reqObject,devices.device_id);
                        if(body.success && body.result && (body.result).length>0){
                            let command=(body.result).reduce((resluts,ele)=> {
                                if((ele.code).indexOf('switch')>-1){
                                    let data=ele;
                                    data.value=params.on
                                    resluts.push(data);
                                }
                                return resluts
                            },[]);
                            reqObject.op = 'control';
                            reqObject.commands=command
                        }else{
                            let command=[{
                                code:'switch_1',
                                value:true
                            }]
                            reqObject.commands=command
                        }                            
                    }
                    let [state,device_id,body]= await UtilsServices.callLambdhaFunction(reqObject,devices.device_id)
                    if(body.success){
                        if(command=='action.devices.commands.OnOff'  || command=='OnOff'){
                            status['ids']=[`${device_id}`];
                            status['status']='SUCCESS';
                            status['states']={
                                on:params.on,
                                online:true
                            }
                        }                        
                    }else{
                        status= {
                            "errorCode": "deviceOffline",
                            "status" : "ERROR"
                          }
                          status['ids']=[`${devices.device_id}`];
                    }
                    reslove(status);
                }else{
                    status= {
                        "errorCode": "deviceOffline",
                        "status" : "ERROR"
                      }
                      status['ids']=[`${devices.device_id}`];
                      reslove(status);
                }
                
            }
            else if (CURTAIN_TUYA.includes(devices.category_id)) {
                let status={}
                if(devices.online!=='0'){
                    reqObject.tuyaurl = devices.remote_model;
                    reqObject.tp_id = '1';
                    reqObject.op = 'control';
                    reqObject.dev_id = `${devices.node_id}`;
                    if(command=='action.devices.commands.OnOff' || command=='OnOff'){  
                        reqObject.op='status'
                        let [state,device_id,body]= await UtilsServices.callLambdhaFunction(reqObject,devices.device_id);
                        if(body.success && body.result && (body.result).length>0){
                            let command=(body.result).reduce((resluts,ele)=> {
                                if((ele.code).indexOf('control')>-1){
                                    let data=ele;
                                    let state='close';
                                    if(params.on){
                                        state='open';
                                    }
                                    data.value=state
                                    resluts.push(data);
                                }
                                return resluts
                            },[]);
                            reqObject.op = 'control';
                            reqObject.commands=command
                        }else{
                            let command=[{
                                code:'switch_1',
                                value:true
                            }]
                            reqObject.commands=command
                        }                            
                    }
                    let [state,device_id,body]= await UtilsServices.callLambdhaFunction(reqObject,devices.device_id)
                    if(body.success){
                        if(command=='action.devices.commands.OnOff'  || command=='OnOff'){
                            status['ids']=[`${device_id}`];
                            status['status']='SUCCESS';
                            status['states']={
                                on:params.on,
                                online:true
                            }
                        }                        
                    }else{
                        status= {
                            "errorCode": "deviceOffline",
                            "status" : "ERROR"
                          }
                          status['ids']=[`${devices.device_id}`];
                    }
                    reslove(status);
                }else{
                    status= {
                        "errorCode": "deviceOffline",
                        "status" : "ERROR"
                      }
                      status['ids']=[`${devices.device_id}`];
                      reslove(status);
                }
                
            }
            else if(ZWAVE_SWITCH.includes(devices.category_id) || ZWAVE_OUTLET.includes(devices.category_id) || ZIGBEE_OUTLET.includes(devices.category_id) || ZIGBEE_SWITCH.includes(devices.category_id) ){
                let status={}
                if(devices.hubtype===2){
                    let requestObj={}
                    requestObj.sent_at=(new Date().getTime())-(1*60*1000)
                    requestObj.expires_at=(new Date().getTime())+(2*60*1000)
                    let device_id=devices.device_id;
                    let SwitchK='';
                    let state='off'
                    if(params.on){
                        state='on'
                    }
                    if((devices.device_b_one_id).indexOf("#")>-1){
                        let divd=(devices.device_b_one_id).split("#");
                        device_id=divd[0]
                        if(parseInt(divd[1])>1){
                            SwitchK=`${parseInt(divd[1])}`  
                        }
                    }
                    if((devices.device_id).indexOf("$")>-1){
                        let divd=(devices.device_id).split("$");
                        device_id=divd[0]
                        if(parseInt(divd[1])>1){
                            SwitchK=`${parseInt(divd[1])}`  
                        }
                    }
                    let radio='zwave';
                    if(ZIGBEE_OUTLET.includes(devices.category_id) || ZIGBEE_SWITCH.includes(devices.category_id)){
                        radio='zigbee'
                    }
                    let commands={"kind":"control","radio":radio,"device_id":device_id};
                    
                    if(devices.category_id=='f41bb4cb-523e-4cae-97b9-4423e490a92b'){
                        let [rstate,result]= await getStateCollections(devices.device_id,'state','device');
                        if(state=='on'){
                            commands['dimming']='99';
                            if(rstate && result.dimming!='0'){
                                commands['dimming']=result.dimming;
                            }  
                        }else{
                            commands['dimming']='0';
                        }
                    }else{
                        commands[`action${SwitchK}`]=state;
                    }
                    AzuerController.sendCommand(devices.hubid,JSON.stringify(commands));
                    if(command=='action.devices.commands.OnOff'  || command=='OnOff'){
                        status['ids']=[`${devices.device_id}`];
                        status['status']='SUCCESS';
                        status['states']={
                            on:params.on,
                            online:true
                        }
                    }  

                }else{
                    status= {
                        "errorCode": "deviceOffline",
                        "status" : "ERROR"
                      }
                      status['ids']=[`${devices.device_id}`];
                }
                setTimeout(()=>{
                    reslove(status);
                },1000)   
            }
            else if(WIFI_SOCKET.includes(devices.category_id)){
                let status={}
                let state='off'
                if(params.on){
                        state='on'
                }
                // let topic=`mqtt/b1sb02/devid_${devices.mac_id}/fromapp`
                // let cmd=`$95${devices.mac_id}${devices.hubid}${devices.device_b_one_id}SPA00${state}#`;
                // UtilsServices.sendPublishMessageOnMqttDeviceData(topic,cmd)
                let commands={"cmd_type":"SwitchEvent","data":{"state":state,"ctl_type":3}}
                AzuerController.sendCommand(devices.mac_id,JSON.stringify(commands));
                if(command=='action.devices.commands.OnOff'  || command=='OnOff'){
                    status['ids']=[`${devices.device_id}`];
                    status['status']='SUCCESS';
                    status['states']={
                        on:params.on,
                        online:true
                    }
                }
                setTimeout(()=>{
                    reslove(status);
                },1000)
            }
            else if(WIFI_DUEL_RELAY.includes(devices.category_id)){
                let status={}
                let state='0'
                if(params.on){
                        state='1'
                }
                let device_id=devices.device_b_one_id;
                    let SwitchK='';
                if((devices.device_b_one_id).indexOf("#")>-1){
                    let divd=(devices.device_b_one_id).split("#");
                    device_id=divd[0]
                    if(parseInt(divd[1])>0){
                        SwitchK=`${parseInt(divd[1])}`;
                    }
                }
                let topic=`mqtt/b1ds01/devid_${devices.mac_id}/fromapp`
                let cmd=`$95${devices.mac_id}${devices.hubid}${device_id}DSA0${SwitchK}${state}#`;
                UtilsServices.sendPublishMessageOnMqttDeviceData(topic,cmd)
                if(command=='action.devices.commands.OnOff'  || command=='OnOff'){
                    status['ids']=[`${devices.device_id}`];
                    status['status']='SUCCESS';
                    status['states']={
                        on:params.on,
                        online:true
                    }
                }
                setTimeout(()=>{
                    reslove(status);
                },1000)
            }
            else if(ZWAVE_SIRAN.includes(devices.category_id) || ZIGBEE_SIRAN.includes(devices.category_id)){
                let status={}
                if(devices.hubtype===2){
                    let requestObj={}
                    requestObj.sent_at=(new Date().getTime())-(1*60*1000)
                    requestObj.expires_at=(new Date().getTime())+(2*60*1000)
                    let device_id=devices.device_id;
                    let state='deactivate'
                    if(params.on){
                        state='activate'
                    }
                    let SwitchK='';
                    let radio='zwave';
                    if(ZIGBEE_SIRAN.includes(devices.category_id)){
                        radio='zigbee'
                    }
                    let commands={"kind":"control","radio":radio,"device_id":device_id};
                    commands[`action${SwitchK}`]=state;
                    AzuerController.sendCommand(devices.hubid,JSON.stringify(commands));
                    
                    if(command=='action.devices.commands.OnOff'  || command=='OnOff'){
                        status['ids']=[`${devices.device_id}`];
                        status['status']='SUCCESS';
                        status['states']={
                            on:params.on,
                            online:true
                        }
                    }  

                }else{
                    status= {
                        "errorCode": "deviceOffline",
                        "status" : "ERROR"
                      }
                      status['ids']=[`${devices.device_id}`];
                }
                setTimeout(()=>{
                    reslove(status);
                },1000)
                
            }
            else if(ZWAVE_DIMMER.includes(devices.category_id) || ZIGBEE_DIMMER.includes(devices.category_id)){
                let status={}
                if(devices.hubtype===2){
                    let device_id=devices.device_id;
                    let state='off'
                    if(params.on){
                        state='on'
                    }
                    let radio='zwave';
                    if(ZIGBEE_OUTLET.includes(devices.category_id) || ZIGBEE_SWITCH.includes(devices.category_id)){
                        radio='zigbee'
                    }
                    let SwitchK='';
                    if((devices.device_id).indexOf("$")>-1){
                        let divd=(devices.device_id).split("$");
                        device_id=divd[0]
                        if(parseInt(divd[1])>1){
                            SwitchK=`${parseInt(divd[1])}`  
                        }
                    }
                    if(command=='action.devices.commands.OnOff'  || command=='OnOff'){
                        if(state=='on'){
                            let [rstate,result]= await getStateCollections(devices.device_id,'state','device');
                            let commands={"kind":"control","radio":radio,"device_id":device_id};
                            commands[`dimming${SwitchK}`]='99';
                            if(rstate && result.dimming!='0'){
                                commands[`dimming${SwitchK}`]=result.dimming;
                            }else{
                                commands[`action${SwitchK}`]=state;
                            }
                            AzuerController.sendCommand(devices.hubid,JSON.stringify(commands));
                            status['ids']=[`${devices.device_id}`];
                            status['status']='SUCCESS';
                            status['states']={
                                on:params.on,
                                online:true
                            }
                        }else{
                            let commands={"kind":"control","radio":radio,"device_id":device_id};
                            commands[`action${SwitchK}`]=state;
                            AzuerController.sendCommand(devices.hubid,JSON.stringify(commands));
                            status['ids']=[`${devices.device_id}`];
                            status['status']='SUCCESS';
                            status['states']={
                                on:params.on,
                                online:true
                            }
                        }
                        
                    } 
                    if(command=='action.devices.commands.BrightnessAbsolute' || command=='Brightness'){
                        status['ids']=[`${devices.device_id}`];
                        status['status']='SUCCESS';
                        let state=false;
                        if(params.brightness) state=true;
                        let commands={"kind":"control","radio":radio,"device_id":device_id};
                        let bri=params.brightness
                        if(params.brightness==100){
                            bri=99
                        }
                        commands[`dimming${SwitchK}`]=`${bri}`;
                        AzuerController.sendCommand(devices.hubid,JSON.stringify(commands));
                        status['states']={
                            on:state,
                            online:true,
                            brightness:params.brightness
                        }
                    } 
                }else{
                    status= {
                        "errorCode": "deviceOffline",
                        "status" : "ERROR"
                      }
                      status['ids']=[`${devices.device_id}`];
                }
                reslove(status);
            }
            else if(ZWAVE_CURTAIN.includes(devices.category_id) || ZIGBEE_CURTAIN.includes(devices.category_id) || ZIGBEE_WATER_VALVE.includes(devices.category_id)){
                let status={}
                if(devices.hubtype===2){
                    let SwitchK='';
                    let device_id=devices.device_id;
                    let state='close'
                    if(params.on){
                        state='open'
                    }
                    if(params.openPercent!=undefined && params.openPercent>0){
                        state='open' 
                    }
                    if(params.state!=undefined){
                        state=params.state;
                        params.on=state
                    }
                    if((devices.device_id).indexOf("$")>-1){
                        let divd=(devices.device_id).split("$");
                        device_id=divd[0]
                        if(parseInt(divd[1])>1){
                            SwitchK=`${parseInt(divd[1])}`  
                        }
                    }
                    let radio='zwave';
                    if(ZIGBEE_CURTAIN.includes(devices.category_id) || ZIGBEE_WATER_VALVE.includes(devices.category_id)){
                        radio='zigbee'
                    }
                    let commands={"kind":"control","radio":radio,"device_id":device_id};
                    commands[`action${SwitchK}`]=state;
                    AzuerController.sendCommand(devices.hubid,JSON.stringify(commands));
                    if (command == 'action.devices.commands.OnOff' || command == 'action.devices.commands.OpenClose' || command == 'OnOff' || command == 'OpenClose') {
                        status['ids'] = [`${devices.device_id}`];
                        status['status'] = 'SUCCESS';
                        status['states'] = {
                            openPercent: 100,
                            online: true
                        }
                        if (state == 'close') {
                            status['states'].openPercent = 0
                        }
                    }

                } else {
                    status= {
                        "errorCode": "deviceOffline",
                        "status" : "ERROR"
                      }
                      status['ids']=[`${devices.device_id}`];
                }
                reslove(status);
            } 
            else if(ZWAVE_LOCK.includes(devices.category_id)|| ZIGBEE_LOCK.includes(devices.category_id)){
                let status={}
                if(devices.hubtype===2){
                    let requestObj={}
                    requestObj.sent_at=(new Date().getTime())-(1*60*1000)
                    requestObj.expires_at=(new Date().getTime())+(2*60*1000)
                    let cert_id=await UtilsServices.hmacpassword(devices.hubid,Private_Key);
                    let device_id=devices.device_id;
                    let state='lock'
                    if(params.lock){
                        state='lock'
                    }
                    if(params.state){
                        state=params.state;
                        params.lock=params.state
                    }
                    // let commands={};
                    // commands[`action`]=state
                    // requestObj.command=commands
                    // requestObj.path=`POST:/devices/${device_id}/lock`;
                    // let topic=`mqtt/hubapp/hubid_${cert_id}/command/v1`;
                    // if(params.lock!=false){
                    //     sendEvent(topic,requestObj);
                    // }
                    let radio='zwave';
                    if(ZIGBEE_LOCK.includes(devices.category_id)){
                        radio='zigbee'
                    }
                    let commands={"kind":"control","radio":radio,"device_id":device_id,"action":state};
                    AzuerController.sendCommand(devices.hubid,JSON.stringify(commands));
                    if(command=='action.devices.commands.LockUnlock'  || command=='LockUnlock'){
                        status['ids']=[`${devices.device_id}`];
                        
                        if(params.lock==false){
                            status['errorCode'] ='unlockFailure'
                            status['status']='FAILURE';//FAILURE
                        }else{
                            status['status']='SUCCESS';
                            status['states']={
                                isLocked:true,
                                isJammed: false,
                                online:true
                            }
                        }
                    }  
                    
                }else{
                    status= {
                        "errorCode": "deviceOffline",
                        "status" : "ERROR"
                      }
                      status['ids']=[`${devices.device_id}`];
                }
                reslove(status);
            } 
            else if(ZWAVE_THERMOSTAT.includes(devices.category_id) || ZIGBEE_THERMOSTAT.includes(devices.category_id)){
                let status={}
                if(devices.hubtype===2){
                    let requestObj={}
                    requestObj.sent_at=(new Date().getTime())-(1*60*1000)
                    requestObj.expires_at=(new Date().getTime())+(2*60*1000)
                    let cert_id=await UtilsServices.hmacpassword(devices.hubid,Private_Key);
                    let device_id=devices.device_b_one_id;
                    let keyname=`device_${devices.device_id}`;
                    let [states, result] = await redis.getStringData(keyname, true);
                    if (states && result && Object.keys(result).length > 1) {
                        status=await sendThEvent(device_id,cert_id,requestObj,params,result,devices,command)
                        logger.info(status);
                        reslove(status)                          
                    }else{
                            let [state, history] = await UtilsServices.getMongoState('state', {
                                device_id: devices.device_id
                            }, 1); 
                            if(state){
                                if(history.length>0){
                                    let stateres=JSON.parse(JSON.stringify(history[0]))
                                    await redis.setDataWithTTL(`device_${devices.device_id}`, stateres, (2 * 24 * 60 * 60));
                                    status=await sendThEvent(device_id,cert_id,requestObj,params,stateres,devices,command);
                                    logger.info(status);
                                    reslove(status)
                                }else{
                                    status= {
                                        "errorCode": "deviceOffline",
                                        "status" : "ERROR"
                                      }
                                      status['ids']=[`${devices.device_id}`];
                                      reslove(status);
                                }
                            } else{
                                status= {
                                    "errorCode": "deviceOffline",
                                    "status" : "ERROR"
                                  }
                                  status['ids']=[`${devices.device_id}`];
                                  reslove(status);
                            }
                    }


                }else{
                    status= {
                        "errorCode": "deviceOffline",
                        "status" : "ERROR"
                      }
                      status['ids']=[`${devices.device_id}`];
                      reslove(status);
                }
               
            } 
            else if(ZWAVE_PSE03_THERMOSTAT.includes(devices.category_id)){
                let status={}
                if(devices.hubtype===2){
                    let requestObj={}
                    requestObj.sent_at=(new Date().getTime())-(1*60*1000)
                    requestObj.expires_at=(new Date().getTime())+(2*60*1000)
                    let cert_id=await UtilsServices.hmacpassword(devices.hubid,Private_Key);
                    let device_id=devices.device_b_one_id;
                    let keyname=`device_${devices.device_id}`;
                    let [states, result] = await redis.getStringData(keyname, true);
                    if (states && result && Object.keys(result).length > 1) {
                        status=await sendThEvent(device_id,cert_id,requestObj,params,result,devices,command)
                        logger.info(status);
                        reslove(status)                          
                    }else{
                            let [state, history] = await UtilsServices.getMongoState('state', {
                                device_id: devices.device_id
                            }, 1); 
                            if(state){
                                if(history.length>0){
                                    let stateres=JSON.parse(JSON.stringify(history[0]))
                                    await redis.setDataWithTTL(`device_${devices.device_id}`, stateres, (2 * 24 * 60 * 60));
                                    status=await sendThEvent(device_id,cert_id,requestObj,params,stateres,devices,command);
                                    logger.info(status);
                                    reslove(status)
                                }else{
                                    status= {
                                        "errorCode": "deviceOffline",
                                        "status" : "ERROR"
                                      }
                                      status['ids']=[`${devices.device_id}`];
                                      reslove(status);
                                }
                            } else{
                                status= {
                                    "errorCode": "deviceOffline",
                                    "status" : "ERROR"
                                  }
                                  status['ids']=[`${devices.device_id}`];
                                  reslove(status);
                            }
                    }


                }else{
                    status= {
                        "errorCode": "deviceOffline",
                        "status" : "ERROR"
                      }
                      status['ids']=[`${devices.device_id}`];
                      reslove(status);
                }
               
            }
            else if(QuickAction.includes(devices.category_id)){
                let status={}
                if(devices.hubtype===2){
                    let requestObj={}
                    requestObj.sent_at=(new Date().getTime())-(1*60*1000)
                    requestObj.expires_at=(new Date().getTime())+(2*60*1000)
                    let cert_id=await UtilsServices.hmacpassword(devices.hubid,Private_Key);
                    let device_id=devices.device_id;
                    let state='0'
                    if(!params.deactivate){
                        state='1'
                    }
                    let commands={"kind":"action_state","device_id":device_id,"action_status":state}
                    AzuerController.sendCommand(devices.hubid,JSON.stringify(commands));
                    if(command=='action.devices.commands.ActivateScene'  || command=='ActivateScene'){
                        status['ids']=[`${devices.device_id}`];
                        status['status']='SUCCESS';
                        status['states']={
                            online:true
                        }
                    }else{
                        status['ids']=[`${devices.device_id}`];
                        status['status']='SUCCESS';
                        status['states']={
                            online:true
                        }  
                    }
                } else if(devices.hubtype===0){
                    try{
                        await MacroController.startMacrolocal(devices);
                    }
                    catch(err){
                        logger.error(err);
                    }
                    if(command=='action.devices.commands.ActivateScene'  || command=='ActivateScene'){
                        status['ids']=[`${devices.device_id}`];
                        status['status']='SUCCESS';
                        status['states']={
                            online:true
                        }
                    }else{
                        status['ids']=[`${devices.device_id}`];
                        status['status']='SUCCESS';
                        status['states']={
                            online:true
                        }  
                    }
                }
                else{
                    status= {
                        "errorCode": "deviceOffline",
                        "status" : "ERROR"
                      }
                      status['ids']=[`${devices.device_id}`];
                }
                setTimeout(()=>{
                    reslove(status);
                },1000)
                
            }
            else if (HubSecurity.includes(devices.category_id)) {
                let status = {}
                if (devices.hubtype === 2) {
                    let isArmed = false;
                    let state = 'Disarm';
                    let security_mode = 3;
                    if (params.arm) {
                        state = 'Armed',
                        isArmed = true;
                        security_mode = 1;
                    }
                    if (params.arm && params.armLevel == 'home_key') {
                        state = 'InHouse';
                        isArmed = true;
                        security_mode = 2;
                    }
                    if(params.arm && params.security_mode==1){
                        security_mode=params.security_mode
                    }
                    let commands={"kind":"set_security","device_id":devices.device_id,security_mode:security_mode};
                    commands[`security_mode`] = security_mode;
                    if(state=='Armed'){
                        commands[`security_time_interval`]=10000;
                    }else{
                        commands[`security_time_interval`]=1000;
                    }
                    
                    
                    // let commands = {};
                    // commands[`security_mode`] = security_mode;
                    // commands[`security_time_interval`]=10000;
                    // if(params.security_time_interval!=undefined && params.security_time_interval > 0){
                    //     commands[`security_time_interval`]=params.security_time_interval;
                    // }
                    // requestObj.command = commands;
                    // requestObj.path = `POST:/security/mode`;
                    // let topic = `mqtt/hubapp/hubid_${cert_id}/command/v1`;
                    if(params.arm){
                        AzuerController.sendCommand(devices.hubid,JSON.stringify(commands));
                        //sendEvent(topic, requestObj);
                    }                   
                    if (command == 'action.devices.commands.ArmDisarm' || command == 'ArmDisarm') {
                        status['ids'] = [`${devices.device_id}`];
                        if(!params.arm){
                            status['errorCode'] ='actionNotAvailable'
                            status['status']='ERROR';//FAILURE
                        }else{
                            status['status'] = 'SUCCESS';
                            status['states'] = {
                                currentArmLevel: params.armLevel,
                                isArmed: isArmed,
                                online: true
                            }
                        }
                        logger.info(status);
                        reslove(status);
                    }
                }
                else {
                    status = {
                        "errorCode": "deviceOffline",
                        "status": "ERROR"
                    }
                    status['ids'] = [`${devices.device_id}`];
                    reslove(status);
                }
                
            }
            else if(AC_REMOTE.includes(devices.category_id)){
                let status={}
                if(command!='IRRequest'){
                    let reqObject={};
                    
                    let quary={};
                    let mode=['AUTO','COOL','DRY','FAN','HEAT'];
                    let fan =['FAN AUTO', 'FAN LOW','FAN MID','FAN HI'];
                    let [sstate,sresult]= await getStateCollections(devices.device_id,'state','device');
                    let [rstate,result]= await getStateCollections(devices.device_id,'irstate','device_ir');
                    if(rstate){
                        let remoteDate=JSON.parse(result.remoteData);
                        let last_status_ac_remote="0,0,1,25,1,ON";
                        if(sresult.last_status_ac_remote!=undefined){
                            last_status_ac_remote=sresult.last_status_ac_remote
                        }
                        last_status_ac_remote=last_status_ac_remote.split(',');
                        quary.fan=fan[last_status_ac_remote[2]];
                        quary.temp=last_status_ac_remote[3];
                        quary.swing=last_status_ac_remote[5];
                        quary.power='ON';
                        if(last_status_ac_remote[0]=='5'){
                            last_status_ac_remote[0]=sresult.previous_mode;
                        }
                        quary.mode=mode[last_status_ac_remote[0]];
                        if(command=='action.devices.commands.OnOff'  || command=='OnOff'){
                            if(params.on==false){
                                quary.power='OFF'
                            }
                            if(params.on==true && result.previous_mode != undefined){
                                quary.mode = result.previous_mode;
                            }
                        }
                        if(command=='action.devices.commands.ThermostatSetMode'  || command=='ThermostatSetMode'){
                            if(params.thermostatMode=='cool'){
                                quary.mode='COOL';
                            }
                            if(params.thermostatMode=='auto'){
                                quary.mode='AUTO'
                            }
                            if(params.thermostatMode=='heat'){
                                quary.mode='HEAT'
                            }
                            if(params.thermostatMode=='dry'){
                                quary.mode='DRY'
                            }
                            if(params.thermostatMode=='fan-only'){
                                quary.mode='FAN'
                            }
                            if(params.thermostatMode=='off'){
                                quary.power='OFF'
                            }
                        }
                        if(command=='action.devices.commands.ThermostatTemperatureSetpoint'  || command=='ThermostatTemperatureSetpoint'){
                            quary.temp=parseInt(params.thermostatTemperatureSetpoint);
                        }
                        if(command=='action.devices.commands.SetFanSpeed' || command == 'SetFanSpeed'){
                            quary.fan=fan[0]
                            if(params.fanSpeed && params.fanSpeed=='speed_high'){
                                quary.fan=fan[3]
                            }
                            if(params.fanSpeed && params.fanSpeed=='speed_low'){
                                quary.fan=fan[1]
                            }
                        }
                        let [irstate,IrData]= await RemoteDateFilter(remoteDate,true,quary);
                        if(irstate){
                            let states={
                                on:true,
                                online:true
                            }
                            reqObject.previous_mode=`${last_status_ac_remote[0]}`;
                            if(IrData.power=="ON"){
                                last_status_ac_remote[0]=mode.indexOf(IrData.mode);
                                last_status_ac_remote[2]=fan.indexOf(IrData.fan);
                                last_status_ac_remote[3]=IrData.temp;
                                last_status_ac_remote[5]=IrData.swing;
                                reqObject[`temp_${(IrData.mode).toLowerCase()}`]=IrData.temp;
                            }else{
                                last_status_ac_remote[0]=5
                            }
                            reqObject.current_mode=`${last_status_ac_remote[0]}`;
                            reqObject.last_status_ac_remote=last_status_ac_remote.join(',');
                            

                            let commands={"cmd_type":"IrRepeat","ir_type":"C","data":IrData.key_irdata}
                            if(IrData.type_remote && IrData.type_remote=='custom'){
                                commands.ir_type='R'
                            }
                            AzuerController.sendCommand(devices.hubid,JSON.stringify(commands));
                            await UtilsServices.setStates(devices.device_id,undefined,"SetState",reqObject);
                            if(reqObject.current_mode=='5'){
                                states.on=false;
                                states.thermostatMode='off';
                            }
                            else if(reqObject.current_mode=='1'){
                                states.thermostatMode='cool';
                            }
                            else if(reqObject.current_mode=='2'){
                                states.thermostatMode='dry';
                            }
                            else if(reqObject.current_mode=='3'){
                                states.thermostatMode='fan-only';
                            }
                            else if(reqObject.current_mode=='0'){
                                states.thermostatMode='auto';
                            }
                            else if(reqObject.current_mode=='4'){
                                states.thermostatMode='heat';
                            }else{
                                states.thermostatMode='auto';
                            }
                           
                            if(last_status_ac_remote[2]==0){
                                states.currentFanSpeedSetting= "speed_auto";
                            }
                            if(last_status_ac_remote[2]==1){
                                states.currentFanSpeedSetting= "speed_low";
                            }
                            if(last_status_ac_remote[2]==2){
                                states.currentFanSpeedSetting= "speed_mid";
                            }
                            if(last_status_ac_remote[2]==3){
                                states.currentFanSpeedSetting= "speed_high";
                            }
                            states.thermostatTemperatureSetpoint=last_status_ac_remote[3];
                            status['ids']=[`${devices.device_id}`];
                            status['status']='SUCCESS';
                            status['states']=states
                            reslove(status);
                        }else{
                            status= {
                                "errorCode": "deviceOffline",
                                "status" : "ERROR"
                              }
                              status['ids']=[`${devices.device_id}`];
                              reslove(status);
                        }
    
                    }else{
                        status= {
                            "errorCode": "deviceOffline",
                            "status" : "ERROR"
                          }
                        status['ids']=[`${devices.device_id}`];
                          reslove(status);
                    }
                }else{
                    let states={
                        on:true,
                        online:true
                    }
                    // let topic = `mqtt/hubapp/hubid_${devices.hubid}/fromapp`
                    // let type = 'IRCtest'
                    // if (params.type_remote && params.type_remote == 'custom') {
                    //     type = 'IRRtest'
                    // }
                    // let irdata = `$10${devices.hubid}${type};${params.key_irdata}:#`
                    // await UtilsServices.sendPublishMessageOnMqttDeviceData(topic, irdata);
                    let commands={"cmd_type":"IrRepeat","ir_type":"C","data":params.key_irdata}
                    if(IrData.type_remote && IrData.type_remote=='custom'){
                        commands.ir_type='R'
                    }
                    AzuerController.sendCommand(devices.hubid,JSON.stringify(commands));
                    status['ids']=[`${devices.device_id}`];
                    status['status']='SUCCESS';
                    status['states']=states
                    reslove(status);
                }
                
            }
            else if(TV_REMOTE.includes(devices.category_id) || OTHERREMOTES.includes(devices.category_id)){
                let status={}
                if(command!='IRRequest'){
                    let [rstate,result]= await getStateCollections(devices.device_id,'irstate','device_ir');
                    if(rstate){
                        let remoteDate=JSON.parse(result.remoteData);
                        let topic=`mqtt/hubapp/hubid_${devices.hubid}/fromapp`
                        if(command=='action.devices.commands.OnOff'  || command=='OnOff'){
                            let [irstate,IrData]= await RemoteDateFilter(remoteDate,false,{key_number:"1"});
                            let [onirstate,pownerOnData]= await RemoteDateFilter(remoteDate,false,{key_number:"229"});
                            let [offirstate,pownerOffData]= await RemoteDateFilter(remoteDate,false,{key_number:"230"});
                            if(params.on){
                                if(onirstate && pownerOnData && pownerOnData.key_irdata){
                                    irstate=onirstate;
                                    IrData=pownerOnData;
                                }
                            }else{
                                if(offirstate && pownerOffData && pownerOffData.key_irdata){
                                    irstate=offirstate;
                                    IrData=pownerOffData;
                                } 
                            }
                            // let type='IRCtest'
                            // if(IrData.type_remote && IrData.type_remote=='custom'){
                            //     type='IRRtest'
                            // }
                            // if(irstate){
                            //     let irdata=`$10${devices.hubid}${type};${IrData.key_irdata}:#`
                            //     UtilsServices.sendPublishMessageOnMqttDeviceData(topic,irdata)   
                            // }
                            if(irstate){
                                let commands={"cmd_type":"IrRepeat","ir_type":"C","data":IrData.key_irdata}
                                if(IrData.type_remote && IrData.type_remote=='custom'){
                                    commands.ir_type='R'
                                }   
                                AzuerController.sendCommand(devices.hubid,JSON.stringify(commands));
                            }
                            status['ids']=[`${devices.device_id}`];
                            status['status']='SUCCESS';
                            status['states']={
                                on:params.on,
                                online:true,
                                isMuted:false,
                            }  
                        }
                        if(command=='action.devices.commands.mute'  || command=='mute'){
                            let [irstate,IrData]= await RemoteDateFilter(remoteDate,false,{key_number:"6"});
                            
                            if(irstate){
                                // let type='IRCtest'
                                // if(IrData.type_remote && IrData.type_remote=='custom'){
                                //     type='IRRtest'
                                // }
                                // let irdata=`$10${devices.hubid}${type};${IrData.key_irdata}:#`
                                // UtilsServices.sendPublishMessageOnMqttDeviceData(topic,irdata)
                                let commands={"cmd_type":"IrRepeat","ir_type":"C","data":IrData.key_irdata}
                                if(IrData.type_remote && IrData.type_remote=='custom'){
                                    commands.ir_type='R'
                                }   
                                AzuerController.sendCommand(devices.hubid,JSON.stringify(commands));
                            }
                            status['ids']=[`${devices.device_id}`];
                            status['status']='SUCCESS';
                            status['states']={
                                on:true,
                                online:true,
                                isMuted:params.mute
                            }  
                        }
                        if(command=='action.devices.commands.volumeRelative'  || command=='volumeRelative'){
                            let quary={key_number:"5"}
                            if(params.relativeSteps>0){
                                quary.key_number="5";
                            }else if(params.relativeSteps<0){
                                quary.key_number="4";
                            }
                            let [irstate,IrData]= await RemoteDateFilter(remoteDate,false,quary);
                            if(irstate){
                                if(irstate){
                                    let commands={"cmd_type":"IrRepeat","ir_type":"C","data":IrData.key_irdata}
                                    if(IrData.type_remote && IrData.type_remote=='custom'){
                                        commands.ir_type='R'
                                    }   
                                    for(let i=0;i<Math.abs(params.relativeSteps);i++){
                                        setTimeout((hubid,commands)=>{
                                            AzuerController.sendCommand(hubid,JSON.stringify(commands));
                                        },(i*300),devices.hubid,commands)    
                                    }
                                    
                                }
                                // let type='IRCtest'
                                // if(IrData.type_remote && IrData.type_remote=='custom'){
                                //     type='IRRtest'
                                // }
                                // let irdata=`$10${devices.hubid}${type};${IrData.key_irdata}:#`
                                // for(let i=0;i<Math.abs(params.relativeSteps);i++){
                                //     setTimeout((topic,irdata)=>{
                                //         UtilsServices.sendPublishMessageOnMqttDeviceData(topic,irdata)
                                //     },(i*300),topic,irdata)    
                                // }
                            }
                            status['ids']=[`${devices.device_id}`];
                            status['states']={
                                on:true,
                                online:true,
                                isMuted:false
                            }  
    
                        }
    
                        setTimeout(()=>{
                            reslove(status);
                        },1000)
    
                    }else{
                        status= {
                            "errorCode": "deviceOffline",
                            "status" : "ERROR"
                          }
                        status['ids']=[`${devices.device_id}`];
                        reslove(status);
                    }
                }else{
                    let states={
                        on:true,
                        online:true
                    }
                    // let topic = `mqtt/hubapp/hubid_${devices.hubid}/fromapp`
                    // let type = 'IRCtest'
                    // if (params.type_remote && params.type_remote == 'custom') {
                    //     type = 'IRRtest'
                    // }
                    // let irdata = `$10${devices.hubid}${type};${params.key_irdata}:#`
                    // await UtilsServices.sendPublishMessageOnMqttDeviceData(topic, irdata);
                        let commands={"cmd_type":"IrRepeat","ir_type":"C","data":params.key_irdata}
                        if(IrData.type_remote && IrData.type_remote=='custom'){
                                commands.ir_type='R'
                        }   
                        AzuerController.sendCommand(devices.hubid,JSON.stringify(commands));
                    status['ids']=[`${devices.device_id}`];
                    status['status']='SUCCESS';
                    status['states']=states
                    reslove(status);
                }     
            }else{
                let status= {
                    "errorCode": "deviceOffline",
                    "status" : "ERROR"
                  }
                status['ids']=[`${devices.device_id}`];
                reslove(status);
            }
        })
    },
    getQuaryState: (devices, comp_id) => {
        return new Promise(async (reslove) => {
            let reqObject = {};
            reqObject.comp_id = comp_id;
            if(LIGHT_LIFX_GROUP.includes(devices.category_id)) {
                reqObject.hub_id = devices.hubid;
                reqObject.tp_id = '2';
                reqObject.op = 'device';
                reqObject.dev_id = `group_id:${devices.node_id}`;
                let [state,device_id,body]= await UtilsServices.callLambdhaFunction(reqObject,devices.device_id)
                let status={}
                if(body.status && body.data && (body.data).length>0){
                    status[`${device_id}`]= (body.data).reduce((result,ele)=>{
                        if(ele.power=='on'){
                            result.on=true;
                        }
                        if(ele.connected){
                            result.online=true;
                        }
                        if(ele.brightness){
                            result.brightness=parseInt((ele.brightness)*100);
                        }
                        let color={}
                        if(ele.color){
                            color={spectrumHSV:{"hue": ele.color.hue,
                            "saturation": 1,
                            "value": 1}}
                        }
                        if(ele.color.kelvin){
                            color['temperatureK']=ele.color.kelvin
                        }
                        if(Object.keys(color).length>0){
                            result.color=color
                        }
                        return result
                    },{on:false,brightness:0,online:false,status:'SUCCESS'})  

                }else{
                    status[`${device_id}`]= {
                        "errorCode": "deviceOffline",
                        "status" : "ERROR"
                      }
                }
                reslove(status);
            }
            if(LIGHT_LIFX.includes(devices.category_id)) {
                reqObject.hub_id = devices.hubid;
                reqObject.tp_id = '2';
                reqObject.op = 'device';
                reqObject.dev_id = `id:${devices.node_id}`;
                let [state,device_id,body]= await UtilsServices.callLambdhaFunction(reqObject,devices.device_id)
                let status={}
                if(body.status && body.data && (body.data).length>0){
                    status[`${device_id}`]= (body.data).reduce((result,ele)=>{
                        if(ele.power=='on'){
                            result.on=true;
                        }
                        if(ele.connected){
                            result.online=true;
                        }
                        if(ele.brightness && ele.power=='on'){
                            result.brightness=parseInt((ele.brightness)*100);
                        }
                        let color={}
                        if(ele.color){
                            color={spectrumHSV:{"hue": ele.color.hue,
                            "saturation": 1,
                            "value": 1}}
                        }
                        if(ele.color.kelvin){
                            color['temperatureK']=ele.color.kelvin
                        }
                        if(Object.keys(color).length>0){
                            result.color=color
                        }
                        return result
                    },{on:false,brightness:0,online:false,status:'SUCCESS'})  

                }else{
                    status[`${device_id}`]= {
                        "errorCode": "deviceOffline",
                        "status" : "ERROR"
                      }
                }
                reslove(status);
            }
            if(LIGHT_TUYA.includes(devices.category_id) || TUYA_LIGHT_COLOR.includes(devices.category_id)) {
                reqObject.tuyaurl = devices.remote_model;
                reqObject.tp_id = '1';
                reqObject.op = 'status';
                reqObject.dev_id = `${devices.node_id}`;
                let [state,device_id,body]= await UtilsServices.callLambdhaFunction(reqObject,devices.device_id)
                let status={}
                if(body.success && body.result && (body.result).length>0){
                    let colormode='';
                    status[`${device_id}`]= (body.result).reduce((result,ele)=>{
                        if(ele.code=='switch_led' && ele.value){
                            result.on=true;
                        }
                        if(ele.code==='bright_value'){
                            if(ele.value==25){
                                result.brightness=1; 
                            }else{
                                result.brightness=Math.round(((ele.value-25)/(255-25))*100);
                            }
                        }
                        if(ele.code=='bright_value_v2'){
                            if(ele.value==10){
                                result.brightness=1; 
                            }else{
                                result.brightness=Math.round(((ele.value-10)/(1000-10))*100); 
                            }
                        }                        
                        if(ele.code=='work_mode'){
                            colormode=ele.value
                        }
                        if(ele.code=='colour_data_v2'){
                            let codes=JSON.parse(ele.value);
                            if(colormode=='colour'){
                                if(codes.v==10){
                                    result.brightness=1; 
                                }else{
                                    result.brightness=Math.round(((codes.v-10)/(1000-10))*100); 
                                }
                            }
                            result.color={spectrumHsv:{"hue": codes.h,
                            "saturation": 1,
                            "value": 1}}
                        }
                        if(ele.code=='colour_data'){
                            let codes=JSON.parse(ele.value);
                            if(colormode=='colour'){
                                if(codes.v==25){
                                    result.brightness=1; 
                                }else{
                                    result.brightness=parseInt((((codes.v)-25)/(255-25))*100);
                                }   
                            }
                            result.color={spectrumHSV:{"hue": codes.h,
                            "saturation": 1,
                            "value": 1}}
                        }
                        if(devices.online!=='0'){
                            result.online=true;
                        } 
                        return result
                    },{on:false,brightness:0,online:false,status:'SUCCESS'})  

                }else{
                    status[`${device_id}`]= {
                        "errorCode": "deviceOffline",
                        "status" : "ERROR"
                      }
                }
                reslove(status);
            }
            if(OUTLET_TUYA.includes(devices.category_id) || SWITCH_TUYA.includes(devices.category_id)) {
                reqObject.tuyaurl = devices.remote_model;
                reqObject.tp_id = '1';
                reqObject.op = 'status';
                reqObject.dev_id = `${devices.node_id}`;
                let [state,device_id,body]= await UtilsServices.callLambdhaFunction(reqObject,devices.device_id)
                let status={}
                if(body.success && body.result && (body.result).length>0){
                    status[`${device_id}`]= (body.result).reduce((result,ele)=>{
                        if((ele.code).indexOf('switch_')>-1 && ele.value && !result.on){
                            result.on=true;
                        }
                        if(devices.online!=='0'){
                            result.online=true;
                        } 
                        return result
                    },{on:false,brightness:0,online:false,status:'SUCCESS'})  

                }else{
                    status[`${device_id}`]= {
                        "errorCode": "deviceOffline",
                        "status" : "ERROR"
                      }
                }
                reslove(status);
            }
            if(CURTAIN_TUYA.includes(devices.category_id)) {
                reqObject.tuyaurl = devices.remote_model;
                reqObject.tp_id = '1';
                reqObject.op = 'status';
                reqObject.dev_id = `${devices.node_id}`;
                let [state,device_id,body]= await UtilsServices.callLambdhaFunction(reqObject,devices.device_id)
                let status={}
                if(body.success && body.result && (body.result).length>0){
                    status[`${device_id}`]= (body.result).reduce((result,ele)=>{
                        if((ele.code).indexOf('control')>-1 && (ele.value=='open'||ele.value=='stop') && !result.on){
                            result.on=true;
                        }
                        if(devices.online!=='0'){
                            result.online=true;
                        } 
                        return result
                    },{on:false,brightness:0,online:false,status:'SUCCESS'})  

                }else{
                    status[`${device_id}`]= {
                        "errorCode": "deviceOffline",
                        "status" : "ERROR"
                      }
                }
                reslove(status);
            }
            if(ZWAVE_SWITCH.includes(devices.category_id) || ZWAVE_OUTLET.includes(devices.category_id) || ZIGBEE_SWITCH.includes(devices.category_id)|| ZIGBEE_OUTLET.includes(devices.category_id) || WIFI_SOCKET.includes(devices.category_id) || WIFI_DUEL_RELAY.includes(devices.category_id)){
                let status={}
                let state={on:true,online:true,status:'SUCCESS'}
                if(devices.online==='0'){
                    state.online=false;
                }
                if(devices.state=='off' || devices.state=='0'){
                    state.on=false;
                }
                status[`${devices.device_id}`]=state ;
                reslove(status); 
            }
            if(ZWAVE_SIRAN.includes(devices.category_id) || ZIGBEE_SIRAN.includes(devices.category_id)){
                let status={}
                let state={on:true,online:true,status:'SUCCESS'}
                if(devices.online==='0'){
                    state.online=false;
                }
                if(devices.state=='siren_deactivated'){
                    state.on=false;
                }
                status[`${devices.device_id}`]=state ;
                reslove(status); 
            }
            if(ZWAVE_LOCK.includes(devices.category_id)|| ZIGBEE_LOCK.includes(devices.category_id)){
                let status={}
                let state={isLocked:true,isJammed:true,online:true,status:'SUCCESS'}
                if(devices.online==='0'){
                    state.online=false;
                }
                if(devices.state=='unlocked'){
                    state.isLocked=false;
                }
                status[`${devices.device_id}`]=state ;
                reslove(status);

            }
            if(ZWAVE_DIMMER.includes(devices.category_id) || ZIGBEE_DIMMER.includes(devices.category_id)){
                let status={}
                let state={on:true,brightness:0,online:true,status:'SUCCESS'}
                if(devices.online==='0'){
                    state.online=false;
                }
                if(devices.state=='off'){
                    state.on=false;
                }
                let keyname=`device_${devices.device_id}`;
                let [states, result] = await redis.getStringData(keyname, true);
                if (states && result && Object.keys(result).length > 1) {
                    if(result.dimming){
                        state.brightness=result.dimming;  
                    }
                }else{
                    let [state, history] = await UtilsServices.getMongoState('state', {
                        device_id: devices.device_id
                    }, 1); 
                    if(state){
                        if(history.length>0){
                            let stateres=JSON.parse(JSON.stringify(history[0]))
                            await redis.setDataWithTTL(`device_${devices.device_id}`, stateres, (2 * 24 * 60 * 60));
                            if(stateres.dimming){
                                state.brightness=stateres.dimming;  
                            }
                        }
                    } 
                }
                status[`${devices.device_id}`]=state ;
                reslove(status); 
            }
            if(ZWAVE_CURTAIN.includes(devices.category_id) || ZIGBEE_CURTAIN.includes(devices.category_id)){
                let status={}
                let state={on:true,online:true,status:'SUCCESS'}
                state.openPercent= 100
                if(devices.online==='0'){
                    state.online=false;
                }
                if(devices.state=='close'){
                    state.openPercent=0;
                    state.on=false;
                }
                status[`${devices.device_id}`]=state ;
                reslove(status); 
            }
            if(ZWAVE_THERMOSTAT.includes(devices.category_id) || ZIGBEE_THERMOSTAT.includes(devices.category_id)){
                let status={}
                let state={thermostatMode:'on',thermostatTemperatureSetpoint:0,thermostatTemperatureAmbient:0,thermostatHumidityAmbient:0,online:true,status:'SUCCESS'}
                if(devices.online==='0'){
                    state.online=false;
                }
                let keyname=`device_${devices.device_id}`;
                let [states, result] = await redis.getStringData(keyname, true);
                if (states && result && Object.keys(result).length > 1) {
                    if(result.mode){
                        if(result.mode=='auto'){
                            result.mode='heatcool'
                        }
                        state.thermostatMode=result.mode; 
                        if(result.mode=='cool'){
                            state.thermostatTemperatureSetpoint=((stateres.cooling-32)*5/9);
                        }
                        if(result.mode=='heat'){
                            state.thermostatTemperatureSetpoint=((stateres.heating-32)*5/9);
                        } 
                    }
                    if(result.temperature_f){
                        state.thermostatTemperatureAmbient=((result.temperature_f-32)*5/9);  
                    }
                }else{
                    let [state, history] = await UtilsServices.getMongoState('state', {
                        device_id: devices.device_id
                    }, 1); 
                    if(state){
                        if(history.length>0){
                            let stateres=JSON.parse(JSON.stringify(history[0]))
                            await redis.setDataWithTTL(`device_${devices.device_id}`, stateres, (2 * 24 * 60 * 60));
                            if(stateres.mode){
                                if(stateres.mode=='auto'){
                                    stateres.mode='heatcool'
                                }
                                state.thermostatMode=stateres.mode;  
                                if(stateres.mode=='cool'){
                                    state.thermostatTemperatureSetpoint=((stateres.cooling-32)*5/9);
                                }
                                if(stateres.mode=='heat'){
                                    state.thermostatTemperatureSetpoint=((stateres.heating-32)*5/9);
                                }
                            }
                            if(stateres.temperature_f){
                                state.thermostatTemperatureAmbient=((result.temperature_f-32)*5/9);  
                            }
                        }
                    } 
                }
                status[`${devices.device_id}`]=state ;
                reslove(status); 
            }
            if(ZWAVE_PSE03_THERMOSTAT.includes(devices.category_id)){
                let status={}
                let state={thermostatMode:'on',thermostatTemperatureSetpoint:0,online:true,status:'SUCCESS'}
                if(devices.online==='0'){
                    state.online=false;
                }
                let keyname=`device_${devices.device_id}`;
                let [states, result] = await redis.getStringData(keyname, true);
                if (states && result && Object.keys(result).length > 1) {
                    if(result.mode){
                        if(result.mode=='auto'){
                            result.mode='heatcool'
                        }
                        if(result.mode=='fan only'){
                            result.mode='fan'
                        }
                        state.thermostatMode=result.mode; 
                        if(result.mode=='cool'){
                            state.thermostatTemperatureSetpoint=((result.cooling-32)*5/9);
                        }
                        if(result.mode=='heat'){
                            state.thermostatTemperatureSetpoint=((result.heating-32)*5/9);
                        }
                        if(result.mode=='dry'){
                            state.thermostatTemperatureSetpoint=((result.dry_air-32)*5/9);
                        } 
                    }
                    if(result.temperature_f){
                        state.thermostatTemperatureAmbient=((result.temperature_f-32)*5/9);  
                    }
                }else{
                    let [state, history] = await UtilsServices.getMongoState('state', {
                        device_id: devices.device_id
                    }, 1); 
                    if(state){
                        if(history.length>0){
                            let stateres=JSON.parse(JSON.stringify(history[0]))
                            await redis.setDataWithTTL(`device_${devices.device_id}`, stateres, (2 * 24 * 60 * 60));
                            if(stateres.mode){
                                if(stateres.mode=='auto'){
                                    stateres.mode='heatcool'
                                }
                                if(stateres.mode=='fan only'){
                                    stateres.mode='fan'
                                }
                                state.thermostatMode=stateres.mode;  
                                if(stateres.mode=='cool'){
                                    state.thermostatTemperatureSetpoint=((stateres.cooling-32)*5/9);
                                }
                                if(stateres.mode=='heat'){
                                    state.thermostatTemperatureSetpoint=((stateres.heating-32)*5/9);
                                }
                                if(stateres.mode=='dry'){
                                    state.thermostatTemperatureSetpoint=((stateres.dry_air-32)*5/9);
                                }
                            }
                            
                            if(stateres.temperature_f){
                                state.thermostatTemperatureAmbient=((stateres.temperature_f-32)*5/9);  
                            }
                        }
                    } 
                }
                status[`${devices.device_id}`]=state ;
                reslove(status); 
            }
            if(QuickAction.includes(devices.category_id)){
                let status={}
                let state={online:true,status:'SUCCESS'}
                if(devices.online==='0'){
                    state.online=false  
                }
                status[`${devices.device_id}`]=state ;
                reslove(status); 
            } 
            if(ZWAVE_DOOR_SENSOR.includes(devices.category_id) || ZIGBEE_DOOR_SENSOR.includes(devices.category_id)){
                let status={}
                let state={online:true,status:'SUCCESS'}
                if(devices.online==='0'){
                    state.online=false  
                }
                // state.openStaate=[{
                //     openPercent:0,
                //     openDirection:"OUT"
                // }]
                 state.openPercent=0;
                 if(devices.state=='open' || devices.state=='1'){
                    state.openPercent=100;
                        // state.openStaate=[{
                        //     openPercent:100,
                        //     openDirection:"IN"
                        // }]
                 }
                status[`${devices.device_id}`]=state ;
                reslove(status);

            }
            if(ZIGBEE_MOTION_SENSOR.includes(devices.category_id)||ZWAVE_MOTION_SENSOR.includes(devices.category_id)){
                let status={};
                let state={online:true,status:'SUCCESS'}
                   state.occupancy='UNOCCUPIED'
                if(devices.state=='motion_detected'){
                    state.occupancy='OCCUPIED'
                }
                status[`${devices.device_id}`]=state ;
                reslove(status);

            }
            if(Temp_Humidity_Sensor.includes(devices.category_id)){
                let status={};
                let state={online:true,status:'SUCCESS'};
                if(devices.online==='0'){
                    state.online=false  
                }
                let keyname=`device_${devices.device_id}`;
                let [states, result] = await redis.getStringData(keyname, true);
                if(states && result && Object.keys(result).length > 1){
                    state["humidityAmbientPercent"]= parseInt(result.humidity);
                    state["temperatureAmbientCelsius"]=parseFloat(result.temperature_f);
                }else{
                    let [state, history] = await UtilsServices.getMongoState('state', {
                        device_id: devices.device_id
                    }, 1); 
                    if(state && history.length>0){
                        let statedata=JSON.parse(JSON.stringify(history[0]))
                        redis.setDataWithTTL(`device_${devices.device_id}`, statedata, (2 * 24 * 60 * 60));
                        state["humidityAmbientPercent"]= parseInt(statedata.humidity);
                        state["temperatureAmbientCelsius"]=parseFloat(statedata.temperature_f);
                    }
                }
                
                status[`${devices.device_id}`]=state ;
                reslove(status);
            }
            if(AC_REMOTE.includes(devices.category_id)){
                let status={}
                let state={thermostatMode:'off',on:false,thermostatTemperatureSetpoint:0,online:true,status:'SUCCESS'}
                if(devices.online==='0'){
                    state.online=false  
                }
                let [acstate,result]=await getStateCollections(devices.device_id,'state','device');
                if(acstate){
                    let mode='auto'
                    state.on=true;
                    if(result.current_mode=='5'){
                        state.on=false;
                        state.thermostatMode='off';
                    }
                    else if(result.current_mode=='1'){
                        mode='cool'
                        state.thermostatMode='cool';
                    }
                    else if(result.current_mode=='2'){
                        mode='dry'
                        state.thermostatMode='dry';
                    }
                    else if(result.current_mode=='3'){
                        mode='fan'
                        state.thermostatMode='fan-only';
                    }
                    else if(result.current_mode=='0'){
                        mode='auto'
                        state.thermostatMode='auto';
                    }
                    else if(result.current_mode=='4'){
                        mode='heat'
                        state.thermostatMode='heat';
                    }else{
                        state.thermostatMode='auto';
                    }
                    let last_state=(result.last_status_ac_remote).split(',');
                    if(last_state[2]==0){
                        state.currentFanSpeedSetting= "speed_auto";
                    }
                    if(last_state[2]==1){
                        state.currentFanSpeedSetting= "speed_low";
                    }
                    if(last_state[2]==2){
                        state.currentFanSpeedSetting= "speed_mid";
                    }
                    if(last_state[2]==3){
                        state.currentFanSpeedSetting= "speed_high";
                    }
                    state.thermostatTemperatureSetpoint=parseFloat(result[`temp_${mode}`]);
                }else{
                    status[`${device_id}`]= {
                        "errorCode": "deviceOffline",
                        "status" : "ERROR"
                      } 
                }
                status[`${devices.device_id}`]=state ;
                reslove(status); 
            }
            if(TV_REMOTE.includes(devices.category_id)){
                let status={}
                let state={on:false,currentVolume:6,"isMuted": false,online:true,status:'SUCCESS'}
                status[`${devices.device_id}`]=state ;
                reslove(status); 
            }
            if(HubSecurity.includes(devices.category_id)){
                let status={}
                let state={online:true,status:'SUCCESS'}
                    state.online=devices.online;
                    state.isArmed=false;
                    let keyname=`device_${devices.device_id}`;
                    let [states, result] = await redis.getStringData(keyname, true);
                    if (states && result && Object.keys(result).length > 1) {
                        if(result.security_mode=='Arm'){
                            state.isArmed=true;
                            state.currentArmLevel= "away_key";
                        }
                        if(result.security_mode=='Inhouse'){
                            state.isArmed=true;
                            state.currentArmLevel= "home_key";
                        }
                        status[`${devices.device_id}`]=state ;
                        reslove(status); 
                        
                    }else{
                        let [state, history] = await UtilsServices.getMongoState('state', {
                            device_id: devices.device_id
                        }, 1); 
                        if(state){
                            if(history.length>0){
                                let stateres=JSON.parse(JSON.stringify(history[0]))
                                await redis.setDataWithTTL(`device_${devices.device_id}`, stateres, (2 * 24 * 60 * 60));
                                if(stateres.security_mode=='Arm'){
                                    state.isArmed=true;
                                    state.currentArmLevel= "away_key";
                                }
                                if(stateres.security_mode=='Inhouse'){
                                    state.isArmed=true;
                                    state.currentArmLevel= "home_key";
                                }
                            }
                        }
                        status[`${devices.device_id}`]=state ;
                        reslove(status);  
                    }       
            }
            
        })
    },
    getCheckCategorys: (category_id)=>{
        return new Promise((reslove)=>{
            if(LIGHT_LIFX_GROUP.includes(category_id) 
            || LIGHT_LIFX.includes(category_id) 
            || LIGHT_TUYA.includes(category_id)
            || TUYA_LIGHT_COLOR.includes(category_id)
            || ZWAVE_SWITCH.includes(category_id)
            || ZWAVE_OUTLET.includes(category_id)
            || WIFI_SOCKET.includes(category_id)
            || WIFI_DUEL_RELAY.includes(category_id)
            || ZWAVE_DIMMER.includes(category_id)
            || ZWAVE_LOCK.includes(category_id)
            || ZIGBEE_LOCK.includes(category_id)
            || ZWAVE_CURTAIN.includes(category_id)
            || ZWAVE_SIRAN.includes(category_id)
            || ZWAVE_THERMOSTAT.includes(category_id)
            || ZIGBEE_THERMOSTAT.includes(category_id)
            || ZWAVE_PSE03_THERMOSTAT.includes(category_id)
            || ZIGBEE_OUTLET.includes(category_id)
            || ZIGBEE_SWITCH.includes(category_id)
            || ZIGBEE_SIRAN.includes(category_id)
            || ZIGBEE_DIMMER.includes(category_id)
            || OUTLET_TUYA.includes(category_id)
            || SWITCH_TUYA.includes(category_id)
            || CURTAIN_TUYA.includes(category_id)
            || AC_REMOTE.includes(category_id)
            || ZIGBEE_CURTAIN.includes(category_id)
            || ZIGBEE_MOTION_SENSOR.includes(category_id)
            || ZWAVE_MOTION_SENSOR.includes(category_id)
            || Temp_Humidity_Sensor.includes(category_id)
            || ZWAVE_DOOR_SENSOR.includes(category_id)
            || ZIGBEE_DOOR_SENSOR.includes(category_id)){
                reslove(true);
            }else{
                reslove(false)
            }
            
        })
    }
}
async function sendEvent(topic,datas){
    UtilsServices.sendPublishMessageOnMqtt(topic, datas).then(result => {})
}
async function sendThEvent(device_id,cert_id,requestObj,params,result,devices,command){
    return new Promise(async(reslove)=>{
        let status={}
        let commands={}
       let mode='off';
       let temp_value=18;
       let temindor=178
       if(result.temperature_f){
            temindor=((result.temperature_f-32)*5/9);  
        }
        
       if(result.mode){
            mode=result.mode
          if(result.mode=='auto'){
            mode='heatcool'  
          }
          if(result.mode=='fan only'){
            mode='fan'  
          } 
       }
       if(command==`action.devices.commands.OnOff` || command=='OnOff'){
            commands={mode:'off'}
            if(params.on){
                commands={mode:'cool'}
                if(result.previous_mode != undefined){
                    commands.mode = result.previous_mode
                }
                
            }else{
                mode='off';
            }
        }
       if(result.temperature_f){
        temp_value=((result.temperature_f-32)*5/9);  
        }
        if(command=='action.devices.commands.ThermostatSetMode'  || command=='ThermostatSetMode'){
            mode=params.thermostatMode
            if(params.thermostatMode==='heatcool'){
                mode='auto'
            }
            commands={mode:mode}
            mode=params.thermostatMode
        }
        if(command=='action.devices.commands.ThermostatTemperatureSetpoint'  || command=='ThermostatTemperatureSetpoint'){
            temp_value=params.thermostatTemperatureSetpoint
            let fharnet=`${(temp_value*(9/5))+32}`;
            let setkey="heating"
            if(mode=='cool'){
                setkey="cooling";
            }
            if(mode=='dry'){
                setkey="dry_air";
            }
            commands={setpoint:setkey,value:fharnet}
        }
        if(command=='action.devices.commands.ThermostatSetFanMode'  || command=='ThermostatSetFanMode'){
           let fanmode=params.thermostatSetFanMode
            commands={fanmode:fanmode}
        }
        requestObj.command=commands
        requestObj.path=`POST:/devices/${device_id}/thermostat`;
        let topic=`mqtt/hubapp/hubid_${cert_id}/command/v1`;
        sendEvent(topic,requestObj); 
        status['ids']=[`${devices.device_id}`];
        status['status']='SUCCESS';
        status['states']={
            thermostatMode:mode,
            thermostatTemperatureSetpoint: temp_value,
            thermostatTemperatureAmbient:temindor,
            online:true
        }
        reslove(status) 
    })

}
async function getDeviceMapValue(ele,comp_id){
    return new Promise(async(reslove)=>{
        let reqObject = {};
        reqObject.comp_id = comp_id;
        if (LIGHT_TUYA.includes(ele.category_id) || TUYA_LIGHT_COLOR.includes(ele.category_id)) {
            reqObject.tuyaurl = ele.remote_model;
            reqObject.tp_id = '1';
            reqObject.op = 'status';
            reqObject.dev_id = `${ele.node_id}`;
            let device = {};
            device.id = ele.device_id;
            device.name = {
                name: ele.name
            };
            device.type = `${types.light}`;
            device.roomHint = ele.room_name;
            device.traits = [`${triles.onoff}`,`${triles.brightness}`];
            device.name = {
                name: ele.name
            };
            device.deviceInfo = {
                manufacturer: "Tuya",
                model: "Lights"
            }
            let state = true;
            device.willReportState = state;
            let [states,device_id,body]= await UtilsServices.callLambdhaFunction(reqObject,ele.device_id);
            if(body.success && body.result && (body.result).length>0){
                (body.result).forEach(eles=>{
                    if(eles.code=='colour_data' || eles.code=='colour_data_v2'){
                        device.traits.push(`${triles.color}`)
                        device.attributes={};
                        device.attributes.colorModel='hsv';
                        device.deviceInfo = {
                            manufacturer: "Tuya",
                            model: "Color Lights"
                        }
                    }
                })     
                reslove(device); 
            }else{
                reslove({});
            }
           
        }else if (LIGHT_LIFX_GROUP.includes(ele.category_id) || LIGHT_LIFX.includes(ele.category_id)) {
            let group=false;
            let device = {};
            reqObject.hub_id = ele.hubid;
            reqObject.tp_id = '2';
            reqObject.op = 'device';
            reqObject.dev_id = `id:${ele.node_id}`;
            if (LIGHT_LIFX_GROUP.includes(ele.category_id)) {
                group=true;
                reqObject.dev_id = `group_id:${ele.node_id}`;
                device.deviceInfo = {
                    manufacturer: "Lifx",
                    model: "Group Lights"
                }
            }else{
                device.deviceInfo = {
                    manufacturer: "Lifx",
                    model: "Lights"
                } 
            }
            let [states,device_id,body]= await UtilsServices.callLambdhaFunction(reqObject,ele.device_id)
            device.id = ele.device_id;
            device.name = {
                name: ele.name
            };
            device.type = `${types.light}`;
            device.roomHint = ele.room_name;
            device.traits = [`${triles.onoff}`, `${triles.brightness}`];
            device.name = {
                name: ele.name
            };
            let state = true;
            device.willReportState = state;
            if(body.status && body.data && (body.data).length>0){
                let colors={};
                (body.data).forEach(eles=>{
                    let capabilities=eles.product.capabilities
                    if(capabilities.has_color){
                        colors.color='hsv';
                        device.traits.push(`${triles.color}`)
                        device.attributes={};
                        device.attributes.colorModel='hsv';
                        if(!group){
                            device.deviceInfo = {
                                manufacturer: "Lifx",
                                model: "Color Lights"
                            }
                        }
                    }
                    if(capabilities.has_variable_color_temp){
                        device.attributes.colorModel='hsv';
                        colors.colorTemperatureRange={min:capabilities.min_kelvin,max:capabilities.max_kelvin};
                        device.attributes.commandOnlyColorSetting= true
                        device.attributes.colorTemperatureRange={
                            temperatureMinK:capabilities.min_kelvin,
                            temperatureMaxK:capabilities.max_kelvin
                        }
                    }
                })
                reslove(device);
            }else{
                reslove({});
            }
        }else if(OUTLET_TUYA.includes(ele.category_id)){
            let device = {};
            device.id = ele.device_id;
            device.name = {
                name: ele.name
            };
            device.type = `${types.outlet}`;
            device.roomHint = ele.room_name;
            device.traits = [`${triles.onoff}`];
            device.name = {
                name: ele.name
            };
            let state = true;
            device.willReportState = state;
            device.deviceInfo = {
                manufacturer: "Tuya",
                model: "Outlets"
            }
            reslove(device);
        }else if(SWITCH_TUYA.includes(ele.category_id)){
            let device = {};
            device.id = ele.device_id;
            device.name = {
                name: ele.name
            };
            device.type = `${types.switch}`;
            device.roomHint = ele.room_name;
            device.traits = [`${triles.onoff}`];
            device.name = {
                name: ele.name
            };
            let state = true;
            device.willReportState = state;
            device.deviceInfo = {
                manufacturer: "Tuya",
                model: "Outlets"
            }
            reslove(device);
        }else if(CURTAIN_TUYA.includes(ele.category_id)){
            let device = {};
            device.id = ele.device_id;
            device.name = {
                name: ele.name
            };
            device.type = `${types.switch}`;
            device.roomHint = ele.room_name;
            device.traits = [`${triles.onoff}`];
            device.name = {
                name: ele.name
            };
            let state = true;
            device.willReportState = state;
            device.deviceInfo = {
                manufacturer: "Tuya",
                model: "Outlets"
            }
            reslove(device);
        }else if(ZWAVE_SWITCH.includes(ele.category_id) || ZWAVE_SIRAN.includes(ele.category_id) || ZIGBEE_SWITCH.includes(ele.category_id) || ZIGBEE_SIRAN.includes(ele.category_id)){
            let device = {};
            device.id = ele.device_id;
            device.name = {
                name: ele.name
            };
            device.type = `${types.switch}`;
            device.roomHint = ele.room_name;
            device.traits = [`${triles.onoff}`];
            device.name = {
                name: ele.name
            };
            let state = true;
            device.willReportState = state;
            device.deviceInfo = {
                manufacturer: "Z-Wave",
                model: "Outlets"
            }
            if(ZIGBEE_SWITCH.includes(ele.category_id) || ZIGBEE_SIRAN.includes(ele.category_id)){
                device.deviceInfo.manufacturer="ZIGBEE"
            }
            reslove(device);
        }else if(ZWAVE_OUTLET.includes(ele.category_id) || ZIGBEE_OUTLET.includes(ele.category_id) || WIFI_SOCKET.includes(ele.category_id) || WIFI_DUEL_RELAY.includes(ele.category_id)){
            let device = {};
            device.id = ele.device_id;
            device.name = {
                name: ele.name
            };
            device.type = `${types.outlet}`;
            device.roomHint = ele.room_name;
            device.traits = [`${triles.onoff}`];
            device.name = {
                name: ele.name
            };
            let state = true;
            device.willReportState = state;
            device.deviceInfo = {
                manufacturer: "Z-Wave",
                model: "Outlets"
            }
            if( ZIGBEE_OUTLET.includes(ele.category_id)){
                device.deviceInfo.manufacturer="ZIGBEE"
            }
            if(WIFI_SOCKET.includes(ele.category_id)){
                device.deviceInfo.manufacturer="Wi-Fi"
            }
            reslove(device);
        }else if(ZWAVE_DIMMER.includes(ele.category_id) || ZIGBEE_DIMMER.includes(ele.category_id)){
            let device = {};
            device.id = ele.device_id;
            device.name = {
                name: ele.name
            };
            device.type = `${types.light}`;
            device.roomHint = ele.room_name;
            device.traits = [`${triles.onoff}`,`${triles.brightness}`];
            let state = true;
            device.willReportState = state;
            device.deviceInfo = {
                manufacturer: "Z-Wave",
                model: "Dimmer"
            }
            if(ZIGBEE_DIMMER.includes(ele.category_id)){
                device.deviceInfo.manufacturer="ZIGBEE"
            }
            reslove(device);
        }else if(ZWAVE_LOCK.includes(ele.category_id)|| ZIGBEE_LOCK.includes(ele.category_id)){
            let device = {};
            device.id = ele.device_id;
            device.name = {
                name: ele.name
            };
            device.type = `${types.lock}`;
            device.roomHint = ele.room_name;
            device.traits = [`${triles.lockunlock}`];
            let state = true;
            device.willReportState = state;
            device.deviceInfo = {
                manufacturer: "Z-Wave",
                model: "LOCK"
            }
            if( ZIGBEE_LOCK.includes(ele.category_id)){
                device.deviceInfo.manufacturer= "Zigbee"               
            }
            reslove(device); 
        }else if(ZWAVE_CURTAIN.includes(ele.category_id) || ZIGBEE_CURTAIN.includes(ele.category_id)){
            let device = {};
            device.id = ele.device_id;
            device.name = {
                name: ele.name
            };
            device.type = `${types.shutter}`;
            device.roomHint = ele.room_name;
            device.traits = [`${triles.openclose}`];
            device.name = {
                name: ele.name
            };
            let state = true;
            device.attributes={
                discreteOnlyOpenClose: true
            }
            device.willReportState = state;
            device.deviceInfo = {
                manufacturer: "Z-Wave",
                model: "CURTAIN"
            }
            reslove(device); 
        }else if(ZWAVE_THERMOSTAT.includes(ele.category_id) || ZIGBEE_THERMOSTAT.includes(ele.category_id)){
            let device = {};
            device.id = ele.device_id;
            device.name = {
                name: ele.name
            };
            device.type = `${types.thermostat}`;
            device.roomHint = ele.room_name;
            device.traits = [`${triles.temperature}`,`${triles.onoff}`];
            device.name = {
                name: ele.name
            };
            let state = true;
            device.willReportState = state;
            device.attributes= {
                "availableThermostatModes": [
                  "off",
                  "heat",
                  "cool",
                  "heatcool"
                ],
                "thermostatTemperatureRange": {
                  "minThresholdCelsius": 18,
                  "maxThresholdCelsius": 30
                },
                "thermostatTemperatureUnit": "C"
              }
            device.deviceInfo = {
                manufacturer: "Z-Wave",
                model: "THERMOSTAT"
            }
            reslove(device);
        }else if(ZWAVE_PSE03_THERMOSTAT.includes(ele.category_id)){
            let device = {};
            device.id = ele.device_id;
            device.name = {
                name: ele.name
            };
            device.type = `${types.thermostat}`;
            device.roomHint = ele.room_name;
            device.traits = [`${triles.temperature}`];
            device.name = {
                name: ele.name
            };
            let state = true;
            device.willReportState = state;
            device.attributes= {
                "availableThermostatModes": [
                  "off",
                  "cool",
                  "dry",
                  "fan"
                ],
                "thermostatTemperatureRange": {
                  "minThresholdCelsius": 18,
                  "maxThresholdCelsius": 30
                },
                "thermostatTemperatureUnit": "C"
              }
            device.deviceInfo = {
                manufacturer: "Z-Wave",
                model: "THERMOSTAT"
            }
            reslove(device);
        }else if(QuickAction.includes(ele.category_id)){
            let device = {};
            device.id = ele.device_id;
            device.type = `${types.scenes}`;
            device.traits = [`${triles.scene}`];
            device.name = {
                name: ele.name
            };
            let state = true;
            device.willReportState = state;
            device.attributes= {
                "sceneReversible": true
              }
            device.deviceInfo = {
                manufacturer: "Action",
                model: "Quick Action"
            }
            reslove(device);
        }else if(ZWAVE_DOOR_SENSOR.includes(ele.category_id) || ZIGBEE_DOOR_SENSOR.includes(ele.category_id)){
            let device = {};
            device.id = ele.device_id;
            device.name = {
                name: ele.name
            };
            device.type = `${types.door}`;
            device.traits = [`${triles.openclose}`];
            device.name = {
                name: ele.name
            };
            let state = true;
            device.attributes={
                discreteOnlyOpenClose:true,
                queryOnlyOpenClose:true,
                openDirection:['IN','OUT']
            }
            device.willReportState = state;
            device.deviceInfo = {
                manufacturer: "Door Sensor",
                model: "Z-Wave"
            }
            if(ZIGBEE_DOOR_SENSOR.includes(ele.category_id)){
                device.deviceInfo.model='Zigbee'
            }
            reslove(device);

        }else if(ZIGBEE_MOTION_SENSOR.includes(ele.category_id)||ZWAVE_MOTION_SENSOR.includes(ele.category_id)){
            let device = {};
            device.id = ele.device_id;
            device.name = {
                name: ele.name
            };
            device.type=`${types.sensor}`
            device.traits=[`${triles.sensor}`]
            device.willReportState=true
            device.attributes={
                occupancySensorConfiguration: [{
                    "occupancySensorType": "PIR",
                    "occupiedToUnoccupiedDelaySec": 10,
                    "unoccupiedToOccupiedDelaySec": 10,
                    "unoccupiedToOccupiedEventThreshold": 2
                  }]
            }
            device.deviceInfo = {
                manufacturer: "Motion Sensor",
                model: "Z-Wave" 
            }
            if(ZIGBEE_MOTION_SENSOR.includes(ele.category_id)){
                device.deviceInfo.model= 'Zigbee'
            } 
            reslove(device);

        }else if(Temp_Humidity_Sensor.includes(ele.category_id)){
            let device={}
            device.id=ele.device_id;
            device.name={
                name:ele.name
            }
            device.type=`${types.sensor}`
            device.traits=[`${triles.temphumidity}`,`${triles.humidity}`];
            device.willReportState = true;
            device.attributes={
                "queryOnlyTemperatureControl":true,
                "queryOnlyHumiditySetting":true}
            device.deviceInfo = {
                manufacturer: "T&H Sensor",
                model: "Zigbee" 
            }
            reslove(device);
        }else if(AC_REMOTE.includes(ele.category_id)){
            let attributesModes=['off']
            let attributesFAN=[]
            let [rstate,result]= await getStateCollections(ele.device_id,'irstate','device_ir');
            if(rstate){
                let remoteData=JSON.parse(result.remoteData);
                let mode=remoteData.reduce((prv,curr)=>{
                    if(!prv.mode.includes(curr.mode)){
                        prv.mode.push(curr.mode)
                        if(curr.mode=='COOL'){
                            attributesModes.push('cool') 
                        }
                        if(curr.mode=='FAN'){
                            attributesModes.push('fan-only') 
                        }
                        if(curr.mode=='HEAT'){
                            attributesModes.push('heat') 
                        }
                        if(curr.mode=='AUTO'){
                            attributesModes.push('auto') 
                        }
                        if(curr.mode=='DRY'){
                            attributesModes.push('dry') 
                        }
                    }
                    if(!prv.fan.includes(curr.fan)){
                        prv.fan.push(curr.fan)
                        if(curr.fan=='FAN AUTO'){
                            attributesFAN.push({
                                "speed_name": "speed_auto",
                                "speed_values": [
                                  {
                                    "speed_synonym": [
                                      "auto"
                                    ],
                                    "lang": "en"
                                  }
                                ]
                              }) 
                        }
                        if(curr.fan=='FAN LOW'){
                            attributesFAN.push({
                                "speed_name": "speed_low",
                                "speed_values": [
                                  {
                                    "speed_synonym": [
                                      "low",
                                      "slow"
                                    ],
                                    "lang": "en"
                                  }
                                ]
                              }) 
                        }
                        if(curr.fan=='FAN HI'){
                            attributesFAN.push({
                                "speed_name": "speed_high",
                                "speed_values": [
                                  {
                                    "speed_synonym": [
                                      "high",
                                      "fast"
                                    ],
                                    "lang": "en"
                                  }
                                ]
                              }) 
                        }
                        if(curr.fan=='FAN MID'){
                            attributesFAN.push({
                                "speed_name": "speed_mid",
                                "speed_values": [
                                  {
                                    "speed_synonym": [
                                      "mid"
                                    ],
                                    "lang": "en"
                                  }
                                ]
                              }) 
                        }
                    }
                    return prv;
                  },{mode:[],fan:[]});
            }else{
                attributesModes=[
                    "off",
                    "heat",
                    "cool",
                    "fan-only",
                    "dry",
                    "auto",
                  ]
            }
            let device = {};
            device.id = ele.device_id;
            device.name = {
                name: ele.name
            };
            device.type = `${types.thermostat}`;
            device.roomHint = ele.room_name;
            device.traits = [`${triles.temperature}`,`${triles.fanspeed}`,`${triles.onoff}`];
            device.name = {
                name: ele.name
            };
            let state = true;
            device.willReportState = state;
            device.attributes= {
                "availableThermostatModes": attributesModes,
                "thermostatTemperatureRange": {
                  "minThresholdCelsius": 18,
                  "maxThresholdCelsius": 30
                },
                "thermostatTemperatureUnit": "C",
                "availableFanSpeeds": {
                    "speeds": attributesFAN,
                    "ordered": true
                  },
                  "reversible": false,
                  "supportsFanSpeedPercent": false
              }
            device.deviceInfo = {
                manufacturer: "AC",
                model: "IR Remote"
            }
            reslove(device);
        }else if(TV_REMOTE.includes(ele.category_id)){
            let device = {};
            device.id = ele.device_id;
            device.name = {
                name: ele.name
            };
            device.type = `${types.tv}`;
            device.roomHint = ele.room_name;
            device.traits = [`${triles.onoff}`,`${triles.volume}`];
            device.name = {
                name: ele.name
            };
            let state = true;
            device.willReportState = state;
            device.attributes= {
                volumeMaxLevel:10,
                volumeCanMuteAndUnmute: true,
                levelStepSize: 5,
                commandOnlyVolume:true
              }
            device.deviceInfo = {
                manufacturer: "TV",
                model: "IR Remote"
            }
            reslove(device);
        }else if(HubSecurity.includes(ele.category_id) && ele.remote_model==2){
            let device = {};
            device.id = ele.device_id;
            device.name = {
                name: ele.name
            };
            device.type = `${types.security}`;
            device.roomHint = ele.room_name;
            device.traits = [`${triles.armdisarm}`];
            device.name = {
                name: ele.name
            };
            let state = true;
            device.willReportState = state;
            device.attributes= {
                "availableArmLevels": {
                    "levels": [
                      {
                        "level_name": "home_key",
                        "level_values": [
                          {
                            "level_synonym": [
                              "InHouse",
                              "level 1",
                              "home",
                              "SL1"
                            ],
                            "lang": "en"
                          }
                        ]
                      },
                      {
                        "level_name": "away_key",
                        "level_values": [
                          {
                            "level_synonym": [
                              "Armed",
                              "level 2",
                              "away",
                              "SL2"
                            ],
                            "lang": "en"
                          }
                        ]
                      }
                    ],
                    "ordered": true
                  }
              }
            device.deviceInfo = {
                manufacturer: "Edge Hub",
                model: "Security"
            }
            reslove(device);
        }
        else{
            reslove({})
        }
    })
}
async function getDeviceMapValueAlexa(ele,comp_id){
    return new Promise(async(reslove)=>{
        let reqObject = {};
        reqObject.comp_id = comp_id;
        if (LIGHT_TUYA.includes(ele.category_id) || TUYA_LIGHT_COLOR.includes(ele.category_id)) {
            reqObject.tuyaurl = ele.remote_model;
            reqObject.tp_id = '1';
            reqObject.op = 'status';
            reqObject.dev_id = `${ele.node_id}`;
            let [states,device_id,body]= await UtilsServices.callLambdhaFunction(reqObject,ele.device_id);
            if(body.success && body.result && (body.result).length>0){
                let colors={};
                (body.result).forEach(eles=>{
                    if(eles.code=='colour_data' || eles.code=='colour_data_v2'){
                        colors.color='hsv';
                    }
                })
                if(Object.keys(colors).length>0){
                    ele.colordevice=colors
                }
                reslove(ele);
            }else{
                reslove({});
            }
           
        }else if (LIGHT_LIFX_GROUP.includes(ele.category_id) || LIGHT_LIFX.includes(ele.category_id)) {
            let group=false;
            reqObject.hub_id = ele.hubid;
            reqObject.tp_id = '2';
            reqObject.op = 'device';
            reqObject.dev_id = `id:${ele.node_id}`;
            if (LIGHT_LIFX_GROUP.includes(ele.category_id)) {
                group=true;
                reqObject.dev_id = `group_id:${devices.node_id}`;
            }
            let [states,device_id,body]= await UtilsServices.callLambdhaFunction(reqObject,ele.device_id)
            if(body.status && body.data && (body.data).length>0){
                let colors={};
                (body.data).forEach(eles=>{
                    let capabilities=eles.product.capabilities
                    if(capabilities.has_color){
                        colors.color='hsv';
                    }
                    if(capabilities.has_variable_color_temp){
                        colors.colorTemperatureRange={min:capabilities.min_kelvin,max:capabilities.max_kelvin};
                    }
                })
                if(Object.keys(colors).length>0){
                    ele.colordevice=colors
                }
                reslove(ele);
            }else{
                reslove({});
            }
        }else {
            reslove(ele);
        }
    })
}
async function getStateCollections(device_id,collection,type='device'){
    return new Promise(async (reslove)=>{
        let keyname=`${type}_${device_id}`;
        let [states, result] = await redis.getStringData(keyname, true);
        if(states && result && Object.keys(result).length > 1){
            reslove([true,result])
        }else{
            let [state, history] = await UtilsServices.getMongoState(`${collection}`, {
                device_id: device_id
            }, 1);
            if(state && history.length>0){
                let stateres=JSON.parse(JSON.stringify(history[0]))
                await redis.setDataWithTTL(`${keyname}`, stateres, (2 * 24 * 60 * 60));
                reslove([true,stateres])
            }else{
                reslove([false,{}])
            }
        }
    })
}
async function RemoteDateFilter(remoteDate,type,query){
    return new Promise(async (reslove)=>{
        if(type){
            let [state,result]= await filterIt(remoteDate,query);
            if(state){
                reslove([true,result])
            }else{
                reslove([false,{}])
            }
        }else{
            let filetrTv=((item)=>{
                if (item.key_number==query.key_number) {
                    return true;
                  }
                  return false;
            })
            const IrData = remoteDate.filter(filetrTv);
            if(IrData.length>0){
                reslove([true,IrData[0]])
            }else{
                reslove([false,{}])
            }
            reslove([false,{}])
        }
    })   
}
function filterIt(items,quary) {
    return new Promise((reslove)=>{
        let filetrall=((item)=>{
            if (item.mode==quary.mode && item.power==quary.power && item.fan==item.fan && item.temp==quary.temp && item.swing==quary.swing) {
                return true;
              }
              return false;
        })
        let filetrnoSwing=((item)=>{
            if (item.mode==quary.mode && item.power==quary.power && item.fan==item.fan && item.temp==quary.temp) {
                return true;
              }
              return false;
        })
        let filetrnoSwingandfan=((item)=>{
            if (item.mode==quary.mode && item.power==quary.power && item.temp==quary.temp) {
                return true;
              }
              return false;
        })
        let PowerOff=((item)=>{
            if (item.power==quary.power) {
                return true;
              }
              return false;
        })
        if(quary.power=='ON'){
            const IrData = items.filter(filetrall);
            if(IrData.length>0){
                reslove([true,IrData[0]])
            }else{
                const IrData1 = items.filter(filetrnoSwing); 
                if(IrData1.length>0){
                    reslove([true,IrData1[0]])
                }else{
                    const IrData2 = items.filter(filetrnoSwingandfan); 
                    if(IrData2.length>0){
                        reslove([true,IrData2[0]])
                    }else{
                        reslove([false,{}])
                    }
                }
            }
        }else{
            const IrData = items.filter(PowerOff);
            if(IrData.length>0){
                reslove([true,IrData[0]])
            }else{
                reslove([false,{}])
            } 
        }
        
    })
    
    
  }

