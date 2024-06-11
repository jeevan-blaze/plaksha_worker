
var Client = require('azure-iothub').Client;
var Message = require('azure-iot-common').Message;
let { logger } = require('../../logger');
let PubSubController = require('../controller/azuerpubsub/azurePubSub.controller');
let serviceClient=null;
let connected=false;
exports.connect = async (IOT_SHARED_URL)=>{
    serviceClient = Client.fromConnectionString(IOT_SHARED_URL);
    serviceClient.open(function (err) {
        if(err){
            logger.error('Could not connect: ' + err.message);
            connected=false;
        }else{
            logger.info('Service client connected');
            connected=true;
            serviceClient.getFeedbackReceiver(receiveFeedback);
        }
    }
    )
}
exports.sendCommand= async(targetDevice,message)=>{
  try{
    PubSubController.sendPubSubCommand(targetDevice,{type:'cmd',body:message});
    var message = new Message(message);
    message.expiryTimeUtc=new Date().getTime()+5000;
    message.ack='positive';
    logger.info('Sending message: ' + message.getData());
    serviceClient.send(targetDevice, message, printResultFor('send'));
  }catch(err){
    logger.error(err.message)
  }  
}
function printResultFor(op) {
    return function printResult(err, res) {
      if (err) logger.info(op + ' error: ' + err.toString());
      if (res) logger.info(op + ' status: ' + res.constructor.name);
    };
  }
const receiveFeedback  =async (err, receiver)=>{
    receiver.on('message', function (msg) {
      logger.info('Feedback message:')
      logger.info(msg.getData().toString('utf-8'));
    });
  }