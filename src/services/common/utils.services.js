let mongo = require('../../database/mongodb');
let { logger } = require('../../../logger');
const axios = require('axios');
let MessageService = require('../../messages/message.controllers');
let MailDetails = require('../company/maildetail.service');
let Mail = require('../../Worker/Mail/Mail')
let LocationPrefService = require('../locpref.service');
let mysql = require('../../database/mysql');
let redis = require('../../database/redis');
let Notification = require('../../Worker/Notification/Notification');
let config = require('../../../config/config').getEnvDetails();
let SocketCatgory=['b875114a-71d9-4131-b6ed-1b083f59b9e3','14569f26-22eb-4f4b-b378-d5d90ea08911'];
let HubCategory=['70a2bbe3-505c-4828-8311-2c2fc3bbc755'];
let SecurityDevice=['4667e719-9e5a-4985-8afa-383bbac18240','79207a3a-fc94-4a4e-91f8-ed1afa21ae65','e6c63bf9-a8a8-427c-b441-74c5a3cfa0a4','c70ba3bb-6e46-43f1-8b1a-2f70f9a65282'];
const getMongoState=async (collection, quary, limit) => {
    return new Promise(reslove => {
        var keyName = {
            device_id: 0,
            location_id:0,
            _id: 0,
            modifed: 0
        }
        if (limit > 1 && collection.indexOf("location_configiration")==-1) {
            delete keyName.modifed
        }
        mongo.findSortedObjectsFields(collection, quary, keyName, {
            ts: -1
        }, limit).then((results) => {
            reslove(results);
        }).catch(err => {
            logger.error(err);
            reslove({
                state: false,
                result: error
            })
        });
    })
}

const sendPushNotification= async (user_id, login_type, user_type, body, hub_id, setObject, user) => {
    try{
        let tokens = await getAppTokens(user_id, login_type);
        if (tokens.state == 1) {
            let key_name = `pushnotificationdetails_${login_type}_${user_type}_${tokens.company_id}`;
            let pushInfo = await redis.getStringData(key_name, true);
            if (!pushInfo[0]) {
                pushInfo = await getPushDetailsDatabase(login_type, user_type, tokens.company_id)
                if (pushInfo[0]) {
                    await redis.setDataWithTTL(key_name, pushInfo[1], (10 * 24 * 60 * 60))
                }
            }
            if (pushInfo[0]) {
                let pushinfo = pushInfo[1];
                if (tokens.android && (tokens.android).length > 0) {
                    (tokens.android).forEach(async (ele) => {
                        if (ele.tokens.length > 0) {
                            let message = body.message;
                            if (ele.lang == 'gr' && body.messageid > 0) {
                                let messagekey = await MessageService.getMessagesServer('gr', body.messagekeyid)
                                if(body.messagekeyid!=undefined && body.messagekeyid==92){
                                    messagekey= `${messagekey} ${body.switchtype} `
                                }
                                if(messagekey.length>0){
                                    messagekey=`${messagekey} `
                                }
                                message = await MessageService.getMessagesServer('gr', body.messageid)
                                if(body.name==undefined){
                                    body.name='';
                                }
                                let noti = {
                                    device_id: body.device_id,
                                    message: `${messagekey}${body.name} ${message}`
                                }
                                let payload={
                                    push: pushinfo.android,
                                    tokens: ele.tokens,
                                    body: noti
                                }
                                payload.body.title=payload.push.title
                                Notification.sendAndroidPushNotification(payload.tokens,payload.body)
    
                            } else {
                                let noti = {
                                    device_id: body.device_id,
                                    message: `${message}`
                                }
                                let payload={
                                    push: pushinfo.android,
                                    tokens: ele.tokens,
                                    body: noti
                                }
                                payload.body.title=payload.push.title
                                Notification.sendAndroidPushNotification(payload.tokens,payload.body)
                            }
                        }
                    })
                }
                if (tokens.ios && (tokens.ios).length > 0) {
                    if (pushinfo.iosauth !== 'failed') {
                        (tokens.ios).forEach(async (ele) => {
                            if(ele.tokens.length>0){
                                let message = body.message;
                                if (ele.lang == 'gr' && body.messageid > 0) {
                                    let messagekey = await MessageService.getMessagesServer('gr', body.messagekeyid)
                                    if(body.messagekeyid!=undefined && body.messagekeyid==92){
                                        messagekey= `${messagekey} ${body.switchtype} `
                                    }
                                    message = await MessageService.getMessagesServer('gr', body.messageid)
                                    let noti = {
                                        device_id: body.device_id,
                                        message: `${messagekey}${body.name} ${message}`
                                    }
                                    let payload={
                                        push: pushinfo.ios,
                                        secret: pushinfo.iosauth,
                                        tokens: ele.tokens,
                                        body: noti
                                    }
                                    payload.body.title=payload.push.title
                                    var secret= Buffer.from(payload.secret,'base64');
                                    Notification.sendIOSPushNotification(payload.push.host,payload.tokens,payload.push.kid,payload.push.iss,payload.push.topic,payload.body,secret);
                                    return true
                                }else{
                                    let noti = {
                                        device_id: body.device_id,
                                        message: `${message}`
                                    }
                                    let payload={
                                        push: pushinfo.ios,
                                        secret: pushinfo.iosauth,
                                        tokens: ele.tokens,
                                        body: noti
                                    }
                                    payload.body.title=payload.push.title
                                    var secret= Buffer.from(payload.secret,'base64');
                                    Notification.sendIOSPushNotification(payload.push.host,payload.tokens,payload.push.kid,payload.push.iss,payload.push.topic,payload.body,secret);
                                }
                            }  
                        })
                    } else {
                        logger.info('ios token error');
                    }
                }
    
            }
            if (user) {
                delete setObject._id;
                setNotiData(hub_id, setObject)
            }
            return true;
        } else {
            return true;
        }
    }catch(err){
        logger.error(err);
        return true
    }
    

}
const setActyData=async (hub_id, setObject) => {
    return new Promise(function (resolve) {
        try{
            mysql.getModels().Devices.findAll({
                where: {
                    device_b_one_id: 'ACTY',
                    hub_id: hub_id
                },
                attributes: ['device_id']
            }).then(devices => {
                if (devices.length > 0) {
                    setObject.device_id = devices[0].device_id;
                    setObject.ts = new Date().getTime();
                    mongo.save('state', setObject).then((result => {
                        resolve(result)
                    }))
                } else {
                    resolve(false)
                }
            })
        }catch(err){
            logger.error(err);
            resolve(false)
        }
        
    })

}
module.exports = {
    setStateData: async (collection, device_id, setObject) => {
        try{
            setObject.device_id = device_id;
            setObject.ts = new Date().getTime();
            mongo.save(collection, setObject).then((result => {
                return true
            }))
        }catch(err){
            logger.error(err);
            return false
        }
        
    },
    getMongoState:getMongoState,
    UpdateAndPushMessage:async(body,device)=>{
        return new Promise(async(resolve)=>{
            let messageid=0;
            let updateObject = {}
            let noti = false;
            let message = null;
            if(body.name){
                updateObject.name = body.name   
            }
            if (body.power) {
                noti = true;
                messageid=89
                message = `Turned OFF`
                updateObject.state = "0";
                if (body.power == 'on') {
                    updateObject.state = "1";
                    messageid=90
                    message = `Turned ON`
                }
                updateObject.state_date = new Date()
            }
            if (body.state != undefined) {
                updateObject.state = body.state,
                updateObject.state_date = new Date()
            }
            if (body.noti != undefined) {
                updateObject.noti = body.noti
            }
            if (body.timeline != undefined) {
                updateObject.timeline = body.timeline
            }
            if (body.icon != undefined) {
                updateObject.icon = body.icon
            }
            if (body.st_th != undefined) {
                updateObject.icon = body.st_th
            }
            if (body.ssid != undefined) {
                updateObject.ssid = body.ssid
            }
            if (body.online != undefined) {
                noti = true;
                messageid=87
                message = `Offline`;
                let online = '0'
                if (body.online == 'online' || body.online == true || body.online == '1') {
                    messageid=88
                    online = '1'
                    message = `Online`;
                }
                body.online = online;
                updateObject.online = online;
            }
            if(body.security_mode && HubCategory.includes(device.category_id)){
                updateObject.security_mode = body.security_mode;
                updateObject.state = "0";
                body.state="0";
                let setObject = {
                    dev_id: device.device_id,
                    type: 6,
                    state: `${body.security_mode}`
                };
                var notimessage = {
                    device_id: device.device_id,
                    messageid:0
                }
                if(updateObject.security_mode=='Arm'){
                    notimessage.messageid=185
                    notimessage.message='Security Set to Arm Mode'
                }
                if(updateObject.security_mode=='Disarm'){
                    notimessage.messageid=184
                    notimessage.message='Security Set to Disarm Mode'
                }
                if(updateObject.security_mode=='Inhouse'){
                    notimessage.messageid=186
                    notimessage.message='Security Set to In-House Mode'
                }
                setActyData(device.hub_id, setObject).then((result) => {});
                sendPushNotification(device.user_id, 1, 4, notimessage, device.hub_id, setObject,true);
            }
            if(body.security_alert && HubCategory.includes(device.category_id)){
                updateObject.state = body.security_alert;
                updateObject.security_alert=body.security_alert;
                body.state=body.security_alert;
            }
            if(body.deviecs && HubCategory.includes(device.category_id)){
                await redis.delData(`security_${device.hub_id}`);   
            }
            if(body.vtype && SocketCatgory.includes(device.category_id)){
                updateObject.node_id = body.vtype;
            }
            if (body.message != undefined && (body.message).length > 3) {
                
                let messagekey = "";
                let emergencyState=false;
                if(body.isEmergency && body.isEmergency==1){
                    emergencyState=true
                }
                let state = body.state;
                if (body.status) {
                    state = body.status
                }
                if (body.state) {
                    state = body.state
                }
                
                message = body.message;
                let setObject = {
                    dev_id: device.device_id,
                    type: 2,
                    data: `${device.name}:$$:${message}`,
                    state: state,
                    room_id: device.room_id
                }
                if (device.timeline || emergencyState) {
                    setActyData(device.hub_id, setObject).then((result) => {})
                }
                let notivalue=await LocationPrefService.getappNotify(device.room_id);
                if ((device.noti && notivalue) || emergencyState) {
                    
                    let notimessage = {
                        device_id: device.device_id,
                        name:device.name,
                        messageid:messageid,
                        message: `${messagekey}${device.name} ${message}`
                    }
                    sendPushNotification(device.user_id, 1, 4, notimessage, device.hub_id, setObject,true);
                }
                let notivalueguest=await LocationPrefService.getappNotifyGuest(device.device_id);
                if ((device.noti && notivalueguest!=undefined && notivalueguest[0]) || emergencyState ) {
                    let notimessage = {
                        device_id: device.device_id,
                        message: `${messagekey}${device.name} ${message}`
                    }
                    notivalueguest[1].forEach(ele=>{
                        sendPushNotification(ele.user_id, 1, 4, notimessage, device.hub_id, setObject,true);
                    })  
                }
                delete body.message
            }
            if (device.noti && noti) {
                let notivalue=await LocationPrefService.getappNotify(device.room_id);
                let notival = true;
                let setObject = {
                    dev_id: device.device_id,
                    room_id: device.room_id,
                    type: 2,
                    data: `${device.name}:$$:${message}`
                };
                if (updateObject.state) {
                    setObject.state = updateObject.state;
                }
                if (updateObject.online != undefined) {
                    setObject.online = updateObject.online;
                }
                if (updateObject.online == device.online) {
                    notival = false;
                }
                
                if (notival && notivalue) {
                    var notimessage = {
                        device_id: device.device_id,
                        messageid:messageid,
                        name:device.name,
                        message: `${device.name} ${message}`
                    }
                    if (device.timeline) {
                        setActyData(device.hub_id, setObject).then((result) => {})
                    }
                    sendPushNotification(device.user_id, 1, 4, notimessage, device.hub_id, setObject,true);
                   
                }
                let notivalueguest=await LocationPrefService.getappNotifyGuest(device.device_id);
                if ((device.noti && notivalueguest!=undefined && notivalueguest[0])) {
                    let notimessage = {
                        device_id: device.device_id,
                        name:device.name,
                        messageid:messageid,
                        message: `${device.name} ${message}`
                    }
                    notivalueguest[1].forEach(ele=>{
                        notivalueguest[1].forEach(ele=>{
                            sendPushNotification(ele.user_id, 1, 4, notimessage, device.hub_id, setObject,true);
                        })  
                    })  
                }
            }
            if (body.message) {
                delete body.message;
            }
            if(body.temp !== undefined && body.user_id !== undefined) {
                let setObject = {
                    dev_id: device.device_id,
                    type: 2,
                    devtype: "th"
                };
                let notimessage = {
                    device_id: device.device_id,
                   message: "🌡️ Attention! Your room temperature is below 24°C. 🔆 setting your AC's temperature to 24°C or higher can save energy and reduce electricity bills 🔆"
                }
                sendPushNotification(body.user_id, 1, 4, notimessage, device.hub_id, setObject, true)
            }
            if(body.mesh_id!=undefined && body.mesh_layer!=undefined && body.parent_mac!=undefined){
                updateObject.node_id=`${body.mesh_id}:${body.mesh_layer}:${body.parent_mac}`
            }
            resolve(updateObject);
        })
    },
    QuaryMysql:async(quary)=> {
        return new Promise(async (reslove) => {
            let mysqlConnection = mysql.getMySqlConnection();
            mysqlConnection.query(`${quary}`, {
                type: mysqlConnection.QueryTypes.SELECT
            }).then(results => {
                reslove(results)
            })
        })
    },
    setActyData:setActyData,
    SendMail: async (type, email_id, name, user_type, company_id, code, login_type,objdata) => {
        try{
        let details = null;
        const key_name = `mail_${company_id}_${user_type}_${login_type}`
        let [state, reply] = await redis.isKeyExists(key_name);
        if (state) {
            let [status, info] = await redis.getStringData(key_name, true);
            if (status) {
                details = info;
            } else {
                let mailinfo = await MailDetails.getmail(null, company_id, user_type, login_type);
                if (mailinfo.status == 1) {
                    details = mailinfo.data[0];
                    await redis.setDataWithTTL(key_name, details, (2 * 24 * 60 * 60));
                } else {
                    return false;
                }
            }
        } else {
            let mailinfo = await MailDetails.getmail(null, company_id, user_type, login_type);
            if (mailinfo.status == 1) {
                details = mailinfo.data[0];
                await redis.setDataWithTTL(key_name, details, (2 * 24 * 60 * 60));
            } else {
                return false;
            }

        }
        if (details) {
            let Subject = `${details.title} - Signup`;
            let templet = 'everify.pug'
            if(objdata.lang!=undefined && objdata.lang=='gr'){
                templet = 'everify_gr.pug'
            }
            if (type === 1) {
                Subject = `${details.title} - Forgot Passsword`;
                templet = 'forgotverify.pug'
                if(objdata.lang!=undefined && objdata.lang=='gr'){
                    templet = 'forgotverify_gr.pug'
                }
            }
            if (type == 3) {
                Subject = `${details.title} - Change Email ID`;
                templet = 'oldmail.pug'
            }
            if (type == 4) {
                Subject = `${details.title} - Verify your Email ID`;
                templet = 'newmail.pug'
            }
            if (type == 5) {
                Subject = `${details.title} - Temporary Password`;
                templet = 'tempPassword.pug'
            }
            if (type == 6) {
                Subject = `${details.title} - Support Team Access Request`;
                templet = 'supportoldmail.pug'
            }
            if (type === 7) {
                Subject = `${details.title} - Forgot Passsword`;
                templet = 'webforgotpassword.pug'
            }
            if(type=== 8){
                Subject = `${details.title} - Admin Access Request`;
                templet = 'supportadmin.pug'
            }
            if(type=== 9){
                Subject = `${details.title} - One-time password`;
                templet = 'deleteaccount.pug'
                if(objdata.lang!=undefined && objdata.lang=='gr'){
                    templet = 'deleteaccount_gr.pug'
                }
            }
            if (type == 10) {
                Subject = `${details.title} - Support Dashboard Temporary Password`;
                templet = 'supporttempPassword.pug'
            }
            if(type=== 11){
                Subject = `${details.title} -User Deletion: One-time password`;
                templet = 'deleteaccount_user.pug'
            }
            
            if(type=== 12){
                Subject = `${details.title} - One-time password`;
                templet = 'authorizationaccount.pug'
            }
            if(type=== 13){
                Subject = `${objdata.subject}`;
                templet = 'statement.pug'
            }
            if(type=== 14){
                Subject = `Your single-use code for ${details.title} account`;
                templet = 'otp.pug'
            }
            let maildata = {
                from: `"${details.title}" <${details.from}>`,
                to: email_id, // list of receivers
                subject: Subject, // Subject line
                templateData: {
                    logo: details.logo,
                    name: name,
                    title: details.title,
                    web: details.web,
                    support: details.support
                },
                template: templet
            }
            if (type == 0 || type == 1) {
                if(objdata.lang==undefined){
                    objdata.lang='en';
                }
                maildata.templateData.link = `${config.baseUrl}/v1/user/${code}/verify?log_id=${company_id}&ts=${objdata.ts}&lang=${objdata.lang}`;
            }
            if (type == 3 || type == 4 || type == 5 || type == 6 || type == 7 || type == 8 || type == 9 || type == 10 || type == 11  || type == 12 || type == 14) {
                maildata.templateData.otp = `${code}`;
            }
            if(type == 11){
                maildata.templateData.cname = `${objdata.name}`;
                maildata.templateData.c_email = `${objdata.email_id}`;
            }
            if(type == 13){
                maildata.attachments=[{
                    filename:`${objdata.filename}.pdf`,
                    content:objdata.pdfBuffer
                }];
                maildata.templateData.type = `${objdata.type}`;
                maildata.templateData.typeOfStatement=`${objdata.statement_type}`;
                maildata.templateData.datesAre=`${objdata.date}`;
                maildata.templateData.dev_name=`${objdata.dev_name}`;
                maildata.templateData.location_name=`${objdata.location_name}`;
                maildata.templateData.settingsMessage='';
                if(objdata.message){
                    maildata.templateData.settingsMessage=`If you wish to stop receiving this email,select the Energy Meter-> go to the Settings-> Notification and disable ${objdata.statement}`;
                } 
            }
            let mail = {
                host: details.host,
                port: details.port,
                secure: details.secure,
                service: details.service,
                pass: details.pass,
                user: details.user,
                tls: details.tls
            }
            var dsts = {
                json: maildata,
                mail: mail
            };
            Mail.SendMailer(dsts.json,dsts.mail);
            return true;
        } else {
            return false;
        }
    }catch(err){
        logger.error("error in sending email", err );
        return false ;
    }

    },

}
const setNotiData = async (hub_id, setObject) => {
    mysql.getModels().Devices.findAll({
        where: {
            device_b_one_id: 'NOTI',
            hub_id: hub_id
        },
        attributes: ['device_id']
    }).then(devices => {
        if (devices.length > 0) {
            setObject.device_id = devices[0].device_id;
            setObject.ts = new Date().getTime();
            mongo.save('state', setObject, (err, result) => {
                return true
            })
        } else {
            return false
        }
    })
}

function getPushDetailsDatabase(login_type, user_type, companyId) {
    return new Promise(reslove => {
        mysql.getModels().PushNotification.findAll({
            where: {
                login_type: login_type,
                user_type: user_type,
                company_id: companyId,
                is_active: true
            },
            attributes: ['host', 'kid', 'iss', 'topic', 'title', 'device_type']
        }).then(async (results) => {
            if (results.length > 0) {
                let resultData = (JSON.parse(JSON.stringify(results))).reduce((result, ele) => {
                    if (ele.device_type && ele.device_type == 1) {
                        result.ios = ele
                    } else if (ele.device_type == 2) {
                        result.android = ele
                    } 
                    return result;
                }, {})
                let options = null;
                if (resultData.ios) {
                    options = {
                        'method': 'GET',
                        'url': `${config.cloud_front}/iosnotificationfiles/AuthKey_${resultData.ios.kid}.p8`,
                    };
                }
                let result= await UrlData(options)
                if (result.length > 0 && result !== 'failed') {
                    resultData.iosauth = result.toString('base64');
                } else {
                    resultData.iosauth = 'failed';
                }
                reslove([true, resultData])
            } else {
                reslove([false, []])
            }
        }).catch((err)=>{
            logger.error(err);
        })
    })

}

function UrlData(option) {
    return new Promise((reslove, reject) => {
        axios.request(option).then((response) => {
    if(response.status==200){
        var buf = Buffer.from(response.data);
        reslove(buf);
    }else {
        reslove('failed')
    }
        }).catch((error) => {
            logger.error(error);
            reslove('failed')
        });
    })
}

function getAppTokens(user_id, login_type) {
    return new Promise((reslove, reject) => {
        mysql.getModels().UserAccessToken.findAll({
            where: {
                user_id: user_id,
                login_type: login_type
            },
            attributes: ['app_token', 'device_type', 'company_id', 'lang']
        }).then(results => {
            if (results.length > 0) {
                var androiden = [];
                var iosen = [];
                var androidgr = [];
                var iosgr = [];
                let company_id = null;
                results.forEach(resdata => {
                    company_id = resdata.company_id;
                    if (resdata.device_type === 1 && (resdata.app_token).length > 50) {
                        if (resdata.lang == 'gr') {
                            iosgr.push(resdata.app_token);
                        } else {
                            iosen.push(resdata.app_token);
                        }

                    }
                    if (resdata.device_type === 2 && (resdata.app_token).length > 50) {
                        if (resdata.lang == 'gr') {
                            androidgr.push(resdata.app_token);
                        } else {
                            androiden.push(resdata.app_token);
                        }
                    }
                })
                let android = [];
                android.push({
                    lang: 'gr',
                    tokens: androidgr
                })
                android.push({
                    lang: 'en',
                    tokens: androiden
                })
                let ios = [];
                ios.push({
                    lang: 'gr',
                    tokens: iosgr
                })
                ios.push({
                    lang: 'en',
                    tokens: iosen
                })
                reslove({
                    state: 1,
                    android: android,
                    ios: ios,
                    company_id: company_id
                });
            } else {
                reslove({
                    state: 0
                })
            }
        })
    })
}

