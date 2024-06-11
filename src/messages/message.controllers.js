let ServerMessage= new Map();
let mysql= require('../database/mysql');
module.exports={
    getServerMessageInit:async ()=>{
        let data= await mysql.getModels().ServerMessage.findAll({attributes:{exclude:['created_at']}})
        if(data.length>0){
            let {id,...rest} =data[0].dataValues
            let key_names=Object.keys(rest);
            data.forEach(ele=>{
                let data=JSON.parse(JSON.stringify(ele))
                key_names.forEach(ele1=>{
                    ServerMessage.set(`${ele1}_${ele.id}`,data[`${ele1}`]);
                })
            })
        }
    },
    getMessagesServer:async (lang,id)=>
    {
        return new Promise((reslove)=>{
            if(id!=undefined && id>0){
                if(lang==undefined || lang==null || lang.length==0 || lang==''){
                    lang='en';
                }
                let message= ServerMessage.get(`${lang}_msg_${id}`)
                reslove(message);
            }else{
                reslove('');  
            }
            
        })
        
    },
    responceServer:async(req,res,msg_id,status=0,data=undefined,others=undefined)=>{
        let responce={status:status}
        if(msg_id!=undefined && msg_id>0){
            let lang=req.headers.lang;
            if(lang==undefined || lang==null || lang.length==0 || lang==''){
                lang='en';
            }
            let message= ServerMessage.get(`${lang}_msg_${msg_id}`)
            responce.message=message;
        }
        if(data!=undefined){
            responce.data=data;
        }
        if(others!=undefined && Object.keys(others).length>0){
            responce=Object.assign(responce,others);
        }
        res.send(responce)
    }
}