const http2 = require('http2');
let { logger } = require('../../../logger');
const config = require("../../../config/config").getEnvDetails();
const { Client } = require('firebase-fcm-v1-http2');

exports.sendIOSPushNotification = function(host,tokens,kid,iss,topic,body,secrat){
    return new Promise((resolve,reject)=>{
        try{
            body.alert = body.message;
            body.sound = "default";
            body["content-available"]=1;
            var pushBody={ "aps":body}
            var header={
                "alg": "ES256",
                "kid": kid
              }
            var payload={
                "iss":iss,
                "iat": 1437179036
                }
            payload.iat = Math.floor(Date.now() / 1000);
            const token = jwt.sign(payload,secrat,{header:header })
            const client = http2.connect(host);
            client.on('error', (err) => logger.error(err));
            client.on('connect',(connectionDetails)=> {
                var headersArr=[]
            tokens.forEach(appid=>{
                if(appid.length>10){
                    var headers = {
                        ':method': 'POST',
                        'apns-topic': `${topic}`,
                        'authorization':`bearer ${token}`,
                        ':scheme': 'https',
                        'apns-push-type': "alert",
                        ':path': `/3/device/${appid}`
                    }
                    headersArr.push(sendIos(client,headers,pushBody));
                }
            })
            Promise.all(headersArr).then(result=>{
                client.close();
                resolve(true);
            })
            });
        }catch(err){
            logger.error(err);
            resolve(true);
        }
        
    })
}

function sendIos(client,headers,body){
    return new Promise((resolve,reject)=>{
        try{
            const request = client.request(headers); 
            request.on('response', (headers, flags) => {
                for (const name in headers) {
                    logger.info(`${name}: ${headers[name]}`);
                }
            });
            request.setEncoding('utf8');
            let data = ''
            request.on('data', (chunk) => { data += chunk; });
            request.write(JSON.stringify(body))
            request.on('end', () => {
            });
            request.end();
            resolve(1);
        }catch(err){
            logger.error(`Notification IOS:${err}`);
            resolve(1);
        }
        
    })
    
}

let firebaseClient;

const getFirebaseClient = () => {
    if (!firebaseClient)
        firebaseClient = new Client( {serviceAccount: config.FCM_SERVICE_JSON} );
    return firebaseClient;
};

exports.sendAndroidPushNotification = (tokens, body) => {
    //initialize client
    const firebaseClient = getFirebaseClient();
    // Send a notification to multiple devices
    const message = {
        notification: {
            title: body.title,
            body: body.message
        },
        data: {
            title: body.title,
            message: body.message
        }
    };
    firebaseClient.sendMulticast(message, tokens)
        .then(unregisteredTokens => {
            console.log('Unregistered tokens:', unregisteredTokens);
        })
        .catch(error => {
            console.error('Error sending notification:', error);
        });
};