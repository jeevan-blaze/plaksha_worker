const config = require('../../config/config').getEnvDetails();
const { logger } = require('../../logger');
let redis = require('../database/redis');
const {generatePdfEmail} = require('../services/reports/reports.service');
let event_types = ['EnergyReportEvent']
exports.init=async ()=>{
    try{
    logger.info('Energy Report initialized');
    let [redisStatus] = await redis.connect(config.redis_url,0,config.redis_password);
    let [redisSubStatus] = await redis.subscriberconnect(config.redis_url,null,config.redis_password);
    if(redisStatus && redisSubStatus){
        await RedisListener()
    }else {
        logger.info(`redisStatus State: ${redisStatus}`);
        logger.info(`redisSubStatus State: ${redisSubStatus}`);
    }
    }catch(e){
        logger.error(e);
    }

}
exports.Close = async ()=>{
    try {
      [redisStatus] = await redis.close();  
      if (redisStatus == true) {
        logger.info(`Closed all DB connections`);
      }
      else {
        logger.info(`Redis connection closed status===> ${redisStatus} `);
      }
    }
    catch (err) {
      logger.error(err);
    }
  }
const RedisListener=async () => {
    try{
    let subscriber = config.redis_subscriber;
    if (subscriber) {
        logger.info('redis Listener initialized')
        await subscriber.subscribe('c2c_messaging', async (message) => {
            let [state,JsonData]= await CheckJson(message);
            logger.info(JsonData);
            if(state === true && Object.keys(JsonData).length>0){
            if (event_types.includes(JsonData.event_type)) {
                if (JsonData.event_type == 'EnergyReportEvent' && JsonData?.data && JsonData?.data?.PdfConfig && JsonData?.data?.MailConfig) {
                    try {
                        logger.info('Energy Report received')
                        await generatePdfEmail(JsonData.data);
                    } catch (e) {
                        logger.error('EnergyReports Error', e);
                    }
                }
            }
        }else{
            logger.info(`checked:- ${message}`)
        }
        });
    } else {
        logger.error('No subscriber specified for Redis subscription')
    }
    }catch(err){
        logger.error('EnergyReports Worker Error', err);
    }
}
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