const { getModels } =require('../../database/mysql');
const { logger } = require('../../../logger/index')
module.exports = {
    add: (body)=>{
        return new Promise(resolve=>{
            getModels().PushNotification.build(body).save().then(details=>{
                resolve({
                    status: 1,data:details
                })
            }).catch(err=>{
                logger.error(err);
                resolve({
                    status: 0,message:err.message
                })
            })
        })
    },
    get: (id,company_id,login_type,user_type,device_type,state)=>{
        return new Promise(resolve=>{
            let quary = {attributes:{exclude:['is_active','deleted_at','company_id']}}
            if(state){
                quary = {attributes:{exclude:['login_type','user_type','device_type','is_active','deleted_at','company_id','created_at']}}
            }
            quary.where={is_active:true};
            if(id){
                quary.where['id']= id 
            }
            if(company_id){
                quary.where['company_id']= company_id 
            }
            if(login_type){
                quary.where['login_type']= login_type 
            }
            if(user_type){
                quary.where['user_type']= user_type 
            }
            if(device_type){
                quary.where['device_type']= device_type 
            }
            getModels().PushNotification.findAll(quary).then(details=>{
                if(details.length>0){
                    resolve({status: 1,
                        data: details
                    })
                }else{
                    resolve({status:0})
                }
                
            }).catch(err=>{
                logger.error(err);
                resolve({
                    status: 0,message:err.message
                })
            })
        })
        
    },
    update:(id,body)=>{
        return new Promise(resolve=>{
            getModels().PushNotification.findOne({where:{id:id}}).then(details=>{
                if(details){
                    details.update(body).then(result=>{
                        resolve({
                            status: 1,message:"updated successfully",data:result
                        })
                    }).catch(err=>{
                        logger.error(err);
                        resolve({status:0,message:err.message})
                    })
                }else{
                    resolve({status:0,message:"details not found"})
                }
            }).catch(err=>{
                logger.error(err);
                resolve({
                    status: 0,message:err.message
                })
            })
        })

    }
}