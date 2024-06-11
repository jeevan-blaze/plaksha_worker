const { WebPubSubServiceClient } = require('@azure/web-pubsub');
const { logger } = require('../../../logger');
let serviceClient=null;
let serviceClientLogging=null;
module.exports ={
    init:async(HostUrl,hub,logging)=>{
        try{
            serviceClient = new WebPubSubServiceClient(HostUrl, hub);
            serviceClientLogging= new WebPubSubServiceClient(HostUrl, logging);
        }catch(err){
            logger.error(err);
        }
        
    },
    getUrl:async(req,res)=>{
        try{
            let mins=180
            let user_id =req.headers.user_id;
            if (req.query.user_id) user_id = req.query.user_id;
            if (req.headers.parent_user_id) user_id = req.headers.parent_user_id;
            user_id=user_id.split('-')
            let token = await serviceClient.getClientAccessToken({userId:user_id[0],expirationTimeInMinutes:mins});
            if(token.url){
                token.expire_time=mins;
            }
            res.send({status:1,data:token});  
        }catch(err){
            logger.error(err);
            res.send({status:0,data:err.message});  
        }
        
    },
    getloggerUrl:async(req,res)=>{
        let mins=180
        let token = await serviceClientLogging.getClientAccessToken({userId:req.headers.mac_id,expirationTimeInMinutes:mins});
        if(token.url){
            token.expire_time=mins;
        }
        res.send({status:1,data:token});
    },
    sendPubSubCommand :async(mac_id,data)=>{
        try{
            serviceClientLogging.sendToUser(mac_id,JSON.stringify(data), { contentType: "text/plain" });
        }catch(err){
            logger.error(err);
        }
        
    },
    sendPubSub:async(user_id,data)=>{
        try{
            serviceClient.sendToUser(user_id,JSON.stringify(data), { contentType: "text/plain" });
        }
        catch(err){
            logger.error(err);
        }
        
    },
}