const nodemailer = require('nodemailer');
let { logger } = require('../../../logger');
const pug = require('pug')
const Path = require('path');
const TPath=Path.resolve(__dirname);
exports.SendMailer = async function (jsonObject,mail){
    try{
        let transporter = nodemailer.createTransport(/*"SMTP",*/ {
            host: mail.host, // hostname
            secureConnection: mail.secure, // use SSL
            port: mail.port, // port for secure SMTP
            auth: {
                    user: mail.user,
                    pass: mail.pass
                },
            ignoreTLS: mail.tls,
            tls: {
                ciphers:'SSLv3',
                rejectUnauthorized: false
            }
        });
        // send mail with defined transport object
        if(jsonObject && jsonObject.hasOwnProperty("template")) {
            jsonObject.html = await genTemplate(jsonObject, TPath+'/template/'+jsonObject.template);
        }
        transporter.sendMail(jsonObject,(err,info)=>{
            if(err){
                logger.info(err.message);
            }
            else{
                logger.info(info.messageId);
            }
    
        });
    }catch(err){
        logger.error(err);
    }
    
}
async function genTemplate( jsonObject, template ){
    try{
        logger.info("genTemplate");
        var _template = pug.renderFile(template, jsonObject);
        if( _template )
            return _template;
        else
            return false;
    }
    catch(err){
        logger.error(err);
        return false; 
    }
    
};
