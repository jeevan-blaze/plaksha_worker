const { createClient } = require('redis');
const config = require('../../config/config');
const {logger} = require('../../logger');
let client = null;
let publisher = null;
let subscriber= null;
exports.connect = async function (url,db,password=undefined) {
    return new Promise((resolve)=>{
        try{
        let opt={url:url,pingInterval: 60000};
        if(password!=undefined){
            opt.password=password
        }
        if(db>0){
            opt.database=db
        }
        client= createClient(opt);
        client.connect()
        client.on('connect', function () {        
            logger.info('Redis connected');
        });
        client.on('reconnecting', () => logger.info('Redis reconnecting'));
        client.on('ready', () => {logger.info('Redis ready!');})
        client.on('error', (err)=> {logger.error("Error in redis connect: "+err.message)});
        resolve([true, client]);
    }catch(err){
        logger.error("Error in redis connect: "+err.message)
        resolve([false, err]);
    }
    })
}
exports.setData =(key, obj)=> {
    return new Promise((resolve)=> {
        try{
        client.set(key,obj).then((object)=>{
            resolve([true, object]);
        }).catch(err=>{
            logger.error(`Error in redis set data Key:- ${JSON.stringify({key})} Value:- ${JSON.stringify({obj})} error:- `+err.message)
            resolve([false, err])
        })
    }catch(err){
        logger.error(`Error in redis set data Key:- ${JSON.stringify({key})} Value:- ${JSON.stringify({obj})} error:- `+err.message)
        resolve([false, err]);
    }
    })
}
exports.getData =async (key)=> {
    return new Promise(function (resolve) {
        try{
        client.get(key).then((object)=> {
            if(object){
                resolve([true, object]);
            }else{
                resolve([false, object]); 
            }
            
        }).catch(err=>{
            logger.error(`Error in Redis getData ${JSON.stringify({key})}: `+err.message)
            resolve([false, err])
        });
    }catch(err){
        logger.error(`Error in Redis getData ${JSON.stringify({key})}: `+err.message)
        resolve([false, err])
    }
    })
};
exports.setDataWithTTL =async function (key, obj, ttlInSec) {
    return new Promise(function (resolve) {
        try{ 
        client.set(key, JSON.stringify(obj), {'EX': ttlInSec}).then(()=>{
            resolve([true, obj])
        }).catch(err=>{
            logger.error('Error in Redis setDataWithTTL '+err.message);
            resolve([false, err])
        });
        }catch(err){
            logger.error('Error in Redis setDataWithTTL '+err.message);
            resolve([false, err])
        }
        
    })
};
exports.getKeys = async function(keys){
    return new Promise((reslove)=>{
        try{
        client.keys(keys).then((object)=> {
                reslove([true,object]);  
        }).catch(err=>{
            logger.error("Error in redis get keys "+err.message+" for key: " + keys );
            reslove([false, err])
        });
    }catch(err){
        logger.error("Error in redis get keys "+err.message+" for key: " + keys )
        reslove([false , err ])
    }
    })
}
exports.getStringData =async (key,json)=> {
    return new Promise(function (resolve) {
        try{
        client.get(key).then((object)=> {
            if(object){
                if(json){
                    resolve([true, JSON.parse(object)]);
                }else{
                    resolve([true, object]);
                }
            }else{
                resolve([false, object]); 
            }
        }).catch(err=>{
            logger.error("Error in redis getStringData "+err.message+" for key: " + key )
            resolve([false, err])
        });
    }catch(err){
        logger.error("Error in redis getStringData "+err.message+" for key: " + key  )
        resolve([ false, err ]);
    }
    })

};
exports.isKeyExists =async (key)=> {
    return new Promise(function (resolve) {
        try{
        client.exists(key).then((object)=> {
            if(object){
                resolve([true, object]);
            }else{
                resolve([false, null]);
            }
        }).catch(err=>{
            logger.error("Error in redis isKeyExists "+err.message);
            resolve([false, err])
        });
    }catch(err){
        logger.error("Error in redis isKeyExists "+err.message);
        resolve([false, err])
    }
    })
};
exports.delData =async (key)=> {
    return new Promise(function (resolve) {
        try{ 
        client.del(key).then((object)=> {
            if(object){
                resolve([true, object]);
            }else{
                resolve([false, null]);
            }
        }).catch(err=>{
            logger.error('Error in redis delData '+err.message+'for key:'+key );
            resolve([false, err])
        });
    }catch(err){
        logger.error('Error in redis delData '+err.message+'for key:'+key );
        resolve([false ,err ])
    }
    })
};
exports.close = async function () {
    return new Promise(function (resolve) {
        try{
        client.quit().then((status) => {
            resolve([true, status])
        }).catch(err=>{
            logger.error(`Redis connection error: ${err}`);
            resolve([false, err])
        })
        } catch(err){
            logger.error(`Redis connection error: ${err}`);
            resolve([false, err])
        }
    })
}
exports.redisPublish = async (topic,message) =>{
    return new Promise(async(reslove,)=>{
        try {
        if(publisher){
            await publisher.publish(topic,message);
            reslove(true)
        }else {
            logger.error(`Redis Publish client not available`)
            reject(`Redis Publish client not available`)
        }
        }catch(err){
        logger.error(err);
        }
    })
};
exports.publishconnect = async function (url,db,password=undefined) {
    return new Promise((resolve)=>{
        try{
        let opt={url:url,pingInterval: 60000};
        if(password!=undefined){
            opt.password=password
        }
        if(db>0){
            opt.database=db
        }
        publisher= createClient(opt);
        publisher.connect()
        publisher.on('connect', function () {   
            resolve([true, publisher]);
        });
        publisher.on('reconnecting', () => logger.info('Redis reconnecting'));
        publisher.on('ready', () => {logger.info('Redis ready!');})
        publisher.on('error', function (err) {
            logger.error("Error in redis connect: "+err.message)
            resolve([false, err]);
        });
    }catch(err){
        logger.error("Error in redis connect: "+err.message)
        resolve([false, err]);
    }
    })
}
exports.subscriberconnect = async function (url,db,password=undefined) {
    return new Promise((resolve)=>{
        try{
        let opt={url:url,pingInterval: 60000};
        if(password!=undefined){
            opt.password=password
        }
        if(db>0){
            opt.database=db
        }
        subscriber = createClient(opt);
        subscriber.connect()
        subscriber.on('connect', function () { 
            config.setKey('redis_subscriber', subscriber);  
            resolve([true, subscriber]);
        });
        subscriber.on('reconnecting', () => logger.info('Redis reconnecting'));
        subscriber.on('ready', () => {logger.info('Redis ready!');})
        subscriber.on('error', function (err) {
            logger.error("Error in redis connect: "+err.message)
            resolve([false, err]);
        });
    }catch(err){
        logger.error("Error in redis connect: "+err.message)
        resolve([false, err]);
    }
    })
}
exports.publishdisconnect = async function () {
    return new Promise(function (resolve) {
        try{
        if(publisher){
            publisher.quit().then((status) => {
                resolve([true, status])
            }).catch(err=>{
                logger.error(`Redis publisher connection error: ${err}`);
                resolve([false, err])
            })
        }else{
            resolve([true, 'No Redis publisher connection to close']) 
        }
        } catch(err){
            logger.error(`Redis connection error: ${err}`);
            resolve([false, err])
        }
    })
};
exports.subscriberdisconnect = async function () {
    return new Promise(function (resolve) {
        try{
        if(subscriber){
            subscriber.quit().then((status) => {
                resolve([true, status])
            }).catch(err=>{
                logger.error(`Redis subscriber connection error: ${err}`);
                resolve([false, err])
            })
        }else{
            resolve([true, 'No Redis subscriber connection to close']) 
        }
        } catch(err){
            logger.error(`Redis connection error: ${err}`);
            resolve([false, err])
        }
    })
};