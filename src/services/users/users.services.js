const { getModels } = require('../../database/mysql');
const { logger } = require('../../../logger');
module.exports ={
    get:(id,company_id,email_id,user_type,attributes)=>{
        return new Promise(resolve=>{
            var quary = {}
            quary.where={} 

            if(attributes){
                quary.attributes=attributes 
            }
            if (id) {
                quary.where.user_id= id;
            }
            if (company_id) {
                quary.where.company_id= company_id;
            }
            if (email_id) {
                quary.where.email_id= email_id;
            }
            if (user_type) {
                quary.where.user_type= user_type;
            }

        getModels().UserDetails.findAll(quary).then(result => {
            if (result.length > 0) {
                var arr=result;
                if(id) arr=result[0];
                resolve({
                    status: 1,
                    data: arr
                })
    
            } else {
                resolve({
                    status: 0,
                    message: 'User does not exist'
                })
            }
        }).catch(err=>{
            logger.error(err)
            resolve({status:0,message:err.message})
        })
        })
        
    },
}