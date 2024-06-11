const {
    UserService,
    UtilsService,
    LocationService,
    LocationRoomService,
    VoiceActTokenService,
    DeviceService,
    GhomeService,
    HubService,
    PushService
} = require('../../services');
let { logger } = require('../../../logger');
const {
    Op
} = require('sequelize');
const redis = require('.././../database/redis');
const {google} = require('googleapis');
const homegraph = google.homegraph('v1');
module.exports = {
    login: async (req, res) => {
        let data = JSON.parse(JSON.stringify(req.body));
        data.name = `${req.body.company_name}`;
        data.title = `${req.body.company_name}`;
        if(req.body.device_type && req.body.device_type=='3'){
            data.title='Google'
        }
        if(req.body.device_type && req.body.device_type=='4'){
            data.title='Alexa'
        }
        data.logoimage = `${req.body.company_id}`;
        data.brandcolor=`${req.body.company_color}`
        let attributes = ['user_id', 'password', 'company_id', 'user_type', 'phone_code']
        let usersDetails = await UserService.get(null, req.body.company_id, req.body.email_id, req.body.user_type, attributes)
        if (usersDetails.status == 1 && usersDetails.data) {
            let users = usersDetails.data[0];
            let password = await UtilsService.hmacpassword(req.body.password, 'password');
            if (users.password === password) {
                var result = JSON.parse(JSON.stringify(users));
                result.device_type = req.body.device_type;
                result.login_type = 1;
                delete result.password;
                const code = await UtilsService.hmac(`${result.user_id}_${result.company_id}_${result.user_type}_${req.body.device_type}_${new Date().getTime()}`, 0);
                await redis.setDataWithTTL(`auth_code${code}`, result, 600);
                delete data.password;
                data.user_id = result.user_id;
                data.code = code;
                if (data.scope) {
                    delete data.scope
                }
                let location = await LocationService.get(null, {
                    user_id: result.user_id,
                    is_active: true
                }, ['location_id', 'location_name']);
                if (location.status) {
                    data.data = location.data;
                    res.render('locations', data)

                } else {
                    data.message = "Location details not found,Please try after sometime"
                    res.render('login', data)
                }

            } else {
                data.message = "password incorrect"
                res.render('login', data)
            }
        } else {
            data.message = "Email address not found"
            res.render('login', data)
        }

    },
    locations: async (req, res) => {
        let [state, result] = await redis.getStringData(`auth_code${req.body.code}`, true);
        if (state) {
            result.location_id = req.body.location_id;
        }
        await redis.setDataWithTTL(`auth_code${req.body.code}`, result, 600);
        res.redirect(`${req.body.redirect_uri}?code=${req.body.code}&state=${req.body.state}`);
    },
    processintent: async (request, response) => {
        var reqdata = request.body;
        if (!reqdata.inputs) {
            response.status(401).set({
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Content-Type': 'application/json'
            }).json({
                error: "missing inputs"
            }).send();
        }
        if (reqdata &&  reqdata.inputs && reqdata.inputs.length>0 && reqdata.inputs[0].intent) {
            let syncResponse = {
                requestId: reqdata.requestId,
                payload: {
                    agentUserId: `${request.headers.user_id}$${request.headers.loc_id}`,
                },
            };
            let ele = reqdata.inputs[0];
            if (ele.intent == 'action.devices.SYNC') {
                let devices = await getDevices(request.headers.user_id, request.headers.loc_id, null);
                syncResponse.payload.devices = [];
                if (devices.status) {
                    let device = await GhomeService.getDevices(JSON.parse(JSON.stringify(devices.data)),request.headers.company_id);
                    syncResponse.payload.devices = device
                }
                logger.info(JSON.stringify(syncResponse))
                response.status(200).send(syncResponse);
            } else if (ele.intent == 'action.devices.QUERY') {
                let devices_id = (ele.payload.devices).map((els) => {
                    return els.id
                })
                let devices = await getDeviceState(request.headers.user_id, devices_id, request.headers.loc_id, true);
                if (devices.status) {
                    let DevicArr = [];
                    (devices.data).forEach((ele) => {
                        DevicArr.push(GhomeService.getQuary(ele, request.headers.company_id))
                    })
                    Promise.all(DevicArr).then(results => {
                        syncResponse.payload.devices = results.reduce((reslu, ele) => {
                            reslu = Object.assign(reslu, ele);
                            return reslu;
                        }, {});
                        response.status(200).send(syncResponse);
                    })
                }else{
                    syncResponse.payload.devices =devices_id.map(ele=>{
                        let status={}
                        status[`${ele}`]= {
                            "errorCode": "deviceOffline",
                            "status" : "ERROR"
                          }
                        return status;
                    })
                    response.status(200).send(syncResponse); 
                }

            } else if (ele.intent == 'action.devices.EXECUTE') {
                logger.info(JSON.stringify(ele));
                let devices_id = (ele.payload.commands[0].devices).map((els) => {
                    return els.id
                })
                let devices = await getDeviceState(request.headers.user_id, devices_id, request.headers.loc_id, true);
                if (devices.status) {
                    let DevicArr = [];
                    (ele.payload.commands[0].execution).forEach(eles => {
                        (devices.data).forEach((ele) => {
                            DevicArr.push(GhomeService.getExecute(ele, request.headers.company_id, eles.command, eles.params))
                        })
                    })
                    Promise.all(DevicArr).then(results => {
                        syncResponse.payload.commands = results;
                        response.status(200).send(syncResponse);
                    })
                }else{
                    syncResponse.payload.devices =devices_id.map(ele=>{
                        let status={}
                        status[`${ele}`]= {
                            "errorCode": "deviceOffline",
                            "status" : "ERROR"
                          }
                        return status;
                    })
                    response.status(200).send(syncResponse); 
                }
            } else if (ele.intent == 'action.devices.DISCONNECT') {
                await VoiceActTokenService.delete({access_token:request.headers.token})
                response.status(200).send({});
            }
        } else {
            response.status(401).set({
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Content-Type': 'application/json'
            }).json({
                error: "missing inputs"
            }).send();
        }
    },
    getDevice: async (req, res) => {
        let devices = await getDevices(req.headers.user_id, req.headers.loc_id, null);
        if(devices.status){
            devices.data = await GhomeService.getDevicesAlexa(JSON.parse(JSON.stringify(devices.data)),req.headers.company_id);
            res.send(devices)
        }else{
            res.send(devices) 
        } 
    },
    getDeviceState: async (req, res) => {
        if (req.params.dev_id) {
            let devices = await getDeviceState(req.headers.user_id, [`${req.params.dev_id}`], req.headers.loc_id, null);
            if (devices.status) {
                let DevicArr = [];
                (devices.data).forEach((ele) => {
                    DevicArr.push(GhomeService.getQuary(ele, req.headers.company_id))
                })
                Promise.all(DevicArr).then(results => {
                    let syncResponse = results.reduce((reslu, ele) => {
                        reslu = Object.assign(reslu, ele);
                        return reslu;
                    }, {});
                    res.status(200).send({
                        status: 1,
                        data: syncResponse
                    });
                })
            } else {
                res.status(200).send({
                    status: 2
                });
            }
        } else {
            res.status(200).send({
                status: 0
            });
        }
    },
    controller: async (req, res) => {
        if (req.body && req.params.dev_id) {
            let devices = await getDeviceState(req.headers.user_id, [`${req.params.dev_id}`], req.headers.loc_id, null);
            if (devices.status) {
                let DevicArr = [];
                (devices.data).forEach((ele) => {
                    DevicArr.push(GhomeService.getExecute(ele, req.headers.company_id, req.body.command, req.body.params))
                })
                Promise.all(DevicArr).then(results => {
                    let syncResponse = results
                    res.status(200).send({
                        status: 1,
                        data: syncResponse
                    });
                })
            }

        }
    },
    ghomedeviceSync:async(user_id,room_id,device_id,type)=>{
        return new Promise(async (reslove)=>{
            try{
                let quary=`SELECT vat.company_id,vat.location_id,vat.user_id FROM voiceact_access_token as vat join location_rooms as lr on lr.location_id=vat.location_id where lr.room_id='${room_id}' and vat.user_id='${user_id}' and device_type=3;`
                let result= await UtilsService.QuaryMysql(quary);
                if(result.length>0){
                    let [state,credentials]= await getGoogleCredentials(result[0].company_id);
                    if(state){
                        let agentUserId=`${result[0].user_id}$${result[0].location_id}`
                        if(type=='sync'){
                           gogleHomeUtils(credentials,agentUserId,null,type).catch(err=>{
                            logger.error(err);
                           })
                            reslove(true);
                        }
                        else if(type=='state'){
                            let devices = await getDeviceState(user_id, [`${device_id}`], result[0].location_id, null);
                            if (devices.status) {
                                let DevicArr = [];
                                (devices.data).forEach((ele) => {
                                    DevicArr.push(GhomeService.getQuary(ele, result[0].company_id))
                                })
                                Promise.all(DevicArr).then(async (results) => {
                                    let syncResponse = results.reduce((reslu, ele) => {
                                        reslu = Object.assign(reslu, ele);
                                        return reslu;
                                    }, {});
                                    gogleHomeUtils(credentials,agentUserId,syncResponse,type).catch(e=>{
                                        logger.info(e);
                                    })
                                    reslove(true)
                                }).catch(err=>{
                                    logger.error(err);
                                    reslove(false)
                                })
    
                            }else{
                                reslove(false)
                            }
     
                        }else{
                            reslove(false);
                        }
                        
                    }else{
                        reslove(false)
                    }
                }
                else{
                    reslove(false)
                }
            }
            catch(err){
                logger.error(err);
                reslove(false)
            }
            
        })
    }
}
const getDevices = ((user_id, loc_id, dev_id) => {
    return new Promise(async (reslove) => {
        let HubData = await HubService.get(null, {
            user_id: user_id,
            location_id: loc_id,
            is_active: true
        }, ['id', 'hub_id', 'hub_type']);
        let hub_ids = (HubData.data).reduce((hudIds, ele) => {
            hudIds[ele.id] = ele.hub_id;
            return hudIds
        }, {})
        let hub_types = (HubData.data).reduce((hudIds, ele) => {
            hudIds[ele.id] = ele.hub_type;
            return hudIds
        }, {})
        let attrubits = ['device_id', 'name', 'category_id','remote_model', 'node_id','room_id', 'hub_id', 'state', 'online']
        let RoomData = await LocationRoomService.get(null, loc_id, user_id, ['room_id', 'room_name'], null);
        if (RoomData.status) {
            let room_ids = (RoomData.data).map(ele => {
                return ele.room_id
            })
            let room_name = (RoomData.data).reduce((roomd, ele) => {
                roomd[ele.room_id] = ele.room_name;
                return roomd
            }, {})
            let devices = await DeviceService.get(dev_id, {
                user_id: user_id,
                room_id: {
                    [Op.in]: room_ids
                },
                device_state: 'ADDED'
            }, attrubits)
            if (devices.status) {
                devices.data = (JSON.parse(JSON.stringify(devices.data))).reduce((results, ele) => {
                    ele.room_name = room_name[ele.room_id];
                    ele.hubid = hub_ids[ele.hub_id];
                    ele.hubtype = hub_types[ele.hub_id];
                    results.push(ele);
                    return results;
                }, [])
            }
            reslove(devices);
        } else {
            reslove([]);
        }
    })
})

const getDeviceState = ((user_id, dev_id, loc_id, types) => {
    return new Promise(async (reslove) => {
        let HubData = await HubService.get(null, {
            user_id: user_id,
            location_id: loc_id,
            is_active: true
        }, ['id', 'hub_id', 'hub_type']);
        let hub_ids = (HubData.data).reduce((hudIds, ele) => {
            hudIds[ele.id] = ele.hub_id;
            return hudIds
        }, {})
        let hub_types = (HubData.data).reduce((hudIds, ele) => {
            hudIds[ele.id] = ele.hub_type;
            return hudIds
        }, {})
        let attrubits = ['name','device_id', 'category_id', 'device_b_one_id', 'remote_model', 'node_id', 'hub_id', 'state', 'online','noti','timeline','room_id','user_id','mac_id']
        let devices = await DeviceService.get(null, {
            user_id: user_id,
            device_id: {
                [Op.in]: dev_id
            },
            device_state: 'ADDED'
        }, attrubits);
        if (devices.status) {
            devices.data = (JSON.parse(JSON.stringify(devices.data))).reduce((results, ele) => {
                ele.hubid = hub_ids[ele.hub_id];
                ele.hubtype = hub_types[ele.hub_id];
                results.push(ele);
                return results;
            }, [])
        }
        reslove(devices);
    })
})
const getGoogleCredentials =(async (company_id)=>{
    return new Promise(async (reslove)=>{
        let [state,result]= await redis.getStringData(`googlehome_${company_id}`,true);
        if(state){
            reslove([true,result])
        }else{
            let datas= await PushService.get(null,company_id,1,4,3,true);
            if(datas.status==1){
                let data=datas.data[0]
                await redis.setDataWithTTL(`googlehome_${company_id}`,{client_email:data.kid,private_key:data.host},(2*24*60*60))
                reslove([true,{client_email:data.kid,private_key:data.host}])
            }else{
                reslove([false,{}])
            }
        }
    })
})
const gogleHomeUtils = (async (credentials,agentUserId,states,type)=>{
        credentials.private_key=(credentials.private_key).replace(/\\n/g,'\n')
        const auth = new google.auth.GoogleAuth({
            credentials:credentials,
            scopes: ['https://www.googleapis.com/auth/homegraph'],
          });
          const authClient = await auth.getClient();
          google.options({auth: authClient});
          if (type === 'sync') {
              const res = await homegraph.devices.requestSync({
                  requestBody: {
                        agentUserId:agentUserId,
                        async: false
                       },
              });
              logger.info(JSON.stringify(res.data));
          }
          else if(type==='state'){
              Object.keys(states).forEach(ele=>{
                delete states[ele].status;
              })
            let ts=`googlehome_${new Date().getTime()}`
            logger.info(JSON.stringify(states));
            const res = await homegraph.devices.reportStateAndNotification({
                requestBody: {
                    agentUserId: agentUserId,
                    requestId: ts,
                    payload: {
                      devices: {
                        states: states
                      }
                    }
                  },
            });
            logger.info(JSON.stringify(res.data));
          }

})