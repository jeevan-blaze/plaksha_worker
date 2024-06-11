const { getModels } =require('../../database/mysql');
const {logger} = require('../../../logger/index')
module.exports = {
    add: (body)=>{
        return new Promise(resolve=>{
            getModels().MailDetails.build(body).save().then(details=>{
                resolve({
                    status: 1,data:details
                })
            }).catch(err=>{
                logger.error(err)
                resolve({
                    status: 0,message:err.message
                })
            })
        })
    },
    get: (id,company_id)=>{
        return new Promise(resolve=>{
            var quary = {
                attributes: {exclude:['is_active','deleted_at','company_id']}
            }
            quary.where={is_active:true};
            if(id){
                quary.where['id']= id 
            }
            if(company_id){
                quary.where['company_id']= company_id 
            }
            getModels().MailDetails.findAll(quary).then(details=>{
                if(details.length>0){
                //    if(id) details=details[0];
                    resolve({status: 1,
                        data: details
                    })
                }else{
                    resolve({status:0})
                }
                
            }).catch(err=>{
                logger.error(err)
                resolve({
                    status: 0,message:err.message
                })
            })
        })
        
    },
    getmail: (id,company_id,user_type,login_type)=>{
        return new Promise(resolve=>{
            var quary = {
                attributes: {exclude:['is_active','deleted_at','company_id']}
            }
            quary.where={is_active:true};
            if(id){
                quary.where['id']= id;
            }
            if(company_id){
                quary.where['company_id']= company_id;
            }
            if(user_type){
                quary.where['user_type']= user_type;
            }
            if(login_type){
                quary.where['login_type']= login_type; 
            }
            getModels().MailDetails.findAll(quary).then(details=>{
                if(details.length>0){
                //    if(id) details=details[0];
                    resolve({status: 1,
                        data: details
                    })
                }else{
                    resolve({status:0})
                }
                
            }).catch(err=>{
                logger.error(err)
                resolve({
                    status: 0,message:err.message
                })
            })
        })
        
    },
    update:(id,body)=>{
        return new Promise(resolve=>{
            getModels().MailDetails.findOne({where:{id:id}}).then(details=>{
                if(details){
                    details.update(body).then(result=>{
                        resolve({
                            status: 1,message:"updated successfully",data:result
                        })
                    }).catch(err=>{
                        logger.error(err)
                        resolve({status:0,message:err.message})
                    })
                }else{
                    resolve({status:0,message:"details not found"})
                }
            }).catch(err=>{
                logger.error(err)
                resolve({
                    status: 0,message:err.message
                })
            })
        })
        
    },
    delete:(id)=>{
        return new Promise(resolve=>{
            getModels().MailDetails.findOne({where:{id:id}}).then(details=>{
                if(details){
                    details.update({is_active:false}).then(result=>{
                        resolve({
                            status: 1,message:"updated successfully",data:result
                        })
                    })
                }else{
                    resolve({status:0,message:"details not found"})
                }
            }).catch(err=>{
                logger.error(err)
                resolve({
                    status: 0,message:err.message
                })
            })
        })
        
    }
}