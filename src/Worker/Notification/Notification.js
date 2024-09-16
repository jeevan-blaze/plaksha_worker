const http2 = require('http2');
let { logger } = require('../../../logger');
const config = require("../../../config/config").getEnvDetails();
const { Client } = require('firebase-fcm-v1-http2');

let serviceAccount={
    "type": "service_account",
    "project_id": "aeee-3d6c5",
    "private_key_id": "6d6d57af1410c672601a0be54dcc3ca7675491dd",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQC8F+9djRz0VWB5\nzQN9cCuqVcsraYbxUstpOmUzh63ZfvgzB4QJUeaLHGQd5a81Vys/bRFxkoYyZui1\n1r2zEWNfhY58qdi34sa6NueEZ5I+JLcdWUdNlbIy4GWEm9XuEMzLFf4tZ8bTpo3A\nl49TdoT/uMOH5nYZA3gQeuspI9g5P4GgHvZFiz9pk0rjWlXV6oFvfTnBYT8R5pi/\neateDL1VTvL8uRZaqcA+KWI6eyqXisJKOyL6ZuHsq5UAAbZJkjWCi0JzQ6BS9wYf\nwPwQmCdYxRpD56XQ+RAhyylLS/2uJVUIQRoZohyL3Eq0mKMzgMU0UqJOY8CIATZH\n+1qu/WuvAgMBAAECggEAGNXa4odXY2DtNCfrELesNvl3shZk8vLzrhk/yOYJVnEl\nZIIsNO7TegVtqA+ZFXnvrphAIrbYxp7qldfyLvVaIaqzfae6Lc2LtTAQBwjbOR6v\n7vgdf2kHS8sanGqB0hqgb9BKQhnfGY3MTw8JUFk927tnAJ1gH+gNWl+13TYWaWMh\nvpo7tSjXqRqE+iDg0wj75fWdjSkJYcpsRjQVDARZoQkesBt3rD5Q6okr75RFu5LF\nKpIqJviG8GjpNR1r6c+o01uoNlcR8IQaBF4LtR0W3z43JCGdmgrxuTq9skraP2ZR\nMC5xuDnNQQ2v6uCGN6ZvOgjf9HiPAQZcdUL2aOqZQQKBgQDwCoNpYtFHVuqlFnBW\nonZ5Fj5K08lWdAGmsJu+3jjkFbu3prLxUpaTUqwxoIwrxeznV8FjPasb6tYtE96/\nbbXD7JjG7VLvEQVlt7+uRcyK28pnFB8E9gEhcaV5Nrtr5kF0PdvoLLwxaFcozQTn\nhdm/u1aGD1DtkkY42pXlmYrHOwKBgQDImUbVFqjdbd7m+/8NXUpo8ST0DYHIlRqR\nywKraWGbFLwvJowHTF/w8BTxEnjllBEr44GTwvcpOUxTO4qEaUj/f+IL6a3dIg0V\nn7MzMQOVp4Iz8hGhOHAM28ym8Bnc0WtQ3BPhp3L4dzcAhGYF6ML7XFgyGUUNr8Dm\n/n5HNmTuHQKBgQDlIFPx24aCfz+5V6Lhv3AxAv9w85ni8RbGYxw3Y+2QIgKuOevj\nGH9snuSI9oP2IJaS+Rw6u5nCKzZHjwj3VyTCoOvwLocUdf3d6ziHhE7LWSNpozY8\nyQmpP87A1nKuevqNl6J6i4ET9FIGOzTsPsLsFklv69zG+PIYwOWGZTqoEwKBgQCW\nWIMFLIGNzE43MwGbI6OkebAnloQCMPaD9PLgRBBaqjTM5ggnZC+4Jkib0it4bfxc\nt5wjggm7BO3WqBaOXVbP4CosoYyk42OJJHOr132HSc/FXRWnjuQ0TvzY1bWckfzr\n0ra39setv7QimBjbLvQMbs7PZa8irepXdsBwYS1OZQKBgQCeo4/M+OLSWw8Kuv5z\ndQSBkjGDJFHPotApPhLj3cDM2FwF/kaZy1KRdSR3c6ZabzYnnU7hlYyb4QusZUxh\nHx5NVqmkKD1K+q4z3SUJ4CTjUXkjvdPjegvyszHMOJd7ykfI+YBPWUD+vffIEWa7\neEGMlClClSMnDIa5bR+dkhsQbg==\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-qhpjv@aeee-3d6c5.iam.gserviceaccount.com",
    "client_id": "113041737727380356927",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-qhpjv%40aeee-3d6c5.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
  }
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