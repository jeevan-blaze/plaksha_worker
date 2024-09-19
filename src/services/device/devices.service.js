const { getModels } =require('../../database/mysql');
const {getStringData,delData, getKeys} = require('../../database/redis');
const { setStateData,setActyData } = require('../common/utils.services');
let { logger } = require('../../../logger');
module.exports = {
    addDevices:async(uuid,body)=>{
        return new Promise(async (resolve)=>{
            let [keysstate,keys]= await getKeys(`adddevice_${uuid}`);
            if(keysstate && keys.length>0){
                let PromArr=[];
                keys.forEach(ele=>{
                    PromArr.push(addDevices(ele,body));
                })
                Promise.all(PromArr).then((result)=>{
                    let user_id=null;
                    result.forEach(ele=>{
                        if(ele.user_id!=undefined){
                            user_id=ele.user_id
                        }
                    })
                    resolve({status:1,user_id:user_id});
                })
            }else{
                resolve({status:0})
            }
            
        })
    },
    get: (id,quarybody,attributes, Order)=>{
        return new Promise(resolve=>{
            var quary = {}
            if(attributes){
                quary.attributes=attributes;
            }
            let params={}
            if(id && id.length>=36){
                params['device_id'] = id
            }
            if(quarybody){
                params=Object.assign(params,quarybody)
            }
            if(Order){
                quary.order=[Order]
            }
            quary.where=params;
            getModels().Devices.findAll(quary).then(details=>{
                if(details.length>0){
                    if(id) details=details[0];
                    resolve({status: 1,
                        data: details
                    })
                }else{
                    resolve({status:0,msg_count:102})
                }
                
            }).catch(err=>{
                logger.error(err)
                resolve({status:0,msg_count:5})
            })
        })
        
    }
}
let multiSwitch=['c48bfa8a-defe-4db8-a43e-102f23837f8f','de0e6cc5-840f-4888-abea-d04c5afeac0f','148a90c0-64c6-4c08-b40f-70e6e78407a1','1fe8c5bb-08fb-4037-b894-52945e95e13b','088d4b50-fda3-4d60-b0f2-6650724ae6f4','e81bfc43-61bc-4111-98a5-3a6edee58281','a735a916-b1a4-4514-acad-e4746b0ed8d9']
let quidSwith=['c48bfa8a-defe-4db8-a43e-102f23837f8f','1fe8c5bb-08fb-4037-b894-52945e95e13b']
const addDevices= async(uuid,body)=>{
    return new Promise(async(resolve)=>{
        let [state,result] = await getStringData(`${uuid}`,true);
                if(state){
                    if(result.category_id=='70a2bbe3-505c-4828-8311-2c2fc3bbc755'){
                        let {hub_status,device_id,...rest}=body;
                        if(hub_status){
                            hub_status.identifier=rest.mac_id;
                        }
                        let location = await getModels().Rooms.findOne({where:{room_id:result.room_id,is_active:true},attributes:['location_id','room_name']});
                        if(location){
                            if(result.remote_model==undefined){
                                result.remote_model='1';
                            }else{
                                result.remote_model=`${result.remote_model}`;
                            }
                                let hubInfo={user_id:result.user_id,hub_id:rest.mac_id,hub_type:result.remote_model,
                                    model:``,date_of_mfg:`${new Date()}`,software_version:"1.0.0",
                                    software_date:`${new Date()}`,state:1,state_date:`${new Date()}`,location_id:location.location_id};
                                    if(hub_status && hub_status.hardware_model){
                                        hubInfo.model=hub_status.hardware_model  
                                        hubInfo.software_version=hub_status.software_version
                                    }
                                    if(result.version){
                                        hubInfo.software_version=result.version
                                    }
                                    if(result.model){
                                        hubInfo.model=result.model  
                                    }
                                        let hustate= await checkHub(rest.mac_id);
                                        let hustate1= await checkHub(rest.mac_id);
                                        let hustate2= await checkHub(rest.mac_id);
                                        if(hustate2){
                                            let hubsinfo= await getModels().Hubs.build(hubInfo).save();
                                            let ssid=''
                                            if(hub_status){
                                                ssid=hub_status.wifi_connection['ssid'] || ''
                                            }else{
                                                ssid=result.ssid || '';
                                            }
                                            if(body.mesh_id!=undefined && body.mesh_layer!=undefined && body.parent_mac!=undefined){
                                                result.node_id=`${body.mesh_id}:${body.mesh_layer}:${body.parent_mac}`;
                                            }else {
                                                result.node_id=0
                                            }
                                            getModels().HubDef.build({hub_id:hubsinfo.id,name:result.name,ssid:ssid}).save().then(details=>{}) 
                                            let devices=[{
                                                device_id:result.device_id,
                                                device_b_one_id: '0000',
                                                name: result.name,
                                                mac_id:rest.mac_id,
                                                room_id:result.room_id,
                                                hub_id:hubsinfo.id,
                                                remote_model:`${result.remote_model}`,
                                                category_id: result.category_id,
                                                user_id: result.user_id,
                                                node_id: result.node_id,
                                                ssid:ssid,
                                                sortid:0
                                            }, {
                                                device_b_one_id: 'ACTY',
                                                name: 'ACTY',
                                                room_id:result.room_id,
                                                hub_id:hubsinfo.id,
                                                category_id: result.category_id,
                                                user_id: result.user_id,
                                                sortid:0
                                            }, {
                                                device_b_one_id: 'NOTI',
                                                name: 'NOTI',
                                                room_id:result.room_id,
                                                hub_id:hubsinfo.id,
                                                category_id: result.category_id,
                                                user_id: result.user_id,
                                                sortid:0
                                            }];
                                            if(result.type!=undefined){
                                                result.icon=result.type
                                            }
                                            let PorArr=[];
                                            devices.forEach((dev)=>{
                                                PorArr.push(getModels().Devices.build(dev).save()) 
                                            })
                                            Promise.all(PorArr).then(async (resultss)=>{

                                                if(hub_status){
                                                    setStateData('state',result.device_id,hub_status);
                                                }else{
                                                    setStateData('state',result.device_id,rest);
                                                }
                                                await delData(`${uuid}`)
                                                var setState={dev_id:result.device_id,room_id:result.room_id,type:2,state:'A',data:`${result.name}:$$:${location.room_name}`}
                                                setActyData(hubsinfo.id,setState);
                                                resolve({status:1,user_id:result.user_id});
                                            }).catch((err)=>{
                                                logger.error(err);
                                                resolve({status:1,user_id:result.user_id});
                                            })
                                        } else{
                                            resolve({status:1,user_id:result.user_id});
                                        }        
                        }else{
                            resolve({status:0})  
                        }  
                        
                    }else{
    
                        if(body.mac_id){
                            result.mac_id=body.mac_id;
                        }
                        if(body.category_id){
                            result.category_id=body.category_id;
                        }
                        if(body.node_id){
                            result.node_id=body.node_id;
                        }
                        if(body.mesh_id!=undefined && body.mesh_layer!=undefined && body.parent_mac!=undefined){
                            result.node_id=`${body.mesh_id}:${body.mesh_layer}:${body.parent_mac}`;
                        }
                        if(body.ssid!=undefined){
                            result.ssid=body.ssid;
                        }
                        try{
                            if(result.room_id && (result.room_id).length>30){
                                let location = await getModels().Rooms.findOne({where:{room_id:result.room_id,is_active:true},attributes:['location_id','room_name']});
                                if(location){
                                    if(result.category_id && multiSwitch.includes(result.category_id)){
                                        let keysdata=JSON.parse(JSON.stringify(result));
                                        keysdata.device_id=`${result.device_id}$1`
                                        keysdata.name=`${result.name} 1`
                                        keysdata.device_b_one_id=`${result.device_id}$1`
                                        await getModels().Devices.build(JSON.parse(JSON.stringify(keysdata))).save();
                                        let setState={dev_id:keysdata.device_id,room_id:result.room_id,type:2,state:'A',data:`${keysdata.name}:$$:${location.room_name}`}
                                        setActyData(keysdata.hub_id,JSON.parse(JSON.stringify(setState)));
                                        await setStateData('device_configiration',keysdata.device_id,JSON.parse(JSON.stringify(body)));
                                        let keysdata1=JSON.parse(JSON.stringify(result));
                                        keysdata1.device_id=`${result.device_id}$2`
                                        keysdata1.name=`${result.name} 2`
                                        keysdata1.device_b_one_id=`${result.device_id}$2`
                                        await getModels().Devices.build(JSON.parse(JSON.stringify(keysdata1))).save();
                                        setState.dev_id=keysdata1.device_id
                                        setState.data=`${keysdata1.name}:$$:${location.room_name}`
                                        setActyData(keysdata.hub_id,JSON.parse(JSON.stringify(setState)));
                                        await setStateData('device_configiration',keysdata1.device_id,JSON.parse(JSON.stringify(body)));
                                        if(quidSwith.includes(result.category_id)){
                                            let keysdata=JSON.parse(JSON.stringify(result));
                                            keysdata.device_id=`${result.device_id}$3`
                                            keysdata.name=`${result.name} 3`
                                            keysdata.device_b_one_id=`${result.device_id}$3`
                                            await getModels().Devices.build(JSON.parse(JSON.stringify(keysdata))).save();
                                            setState.dev_id=keysdata.device_id
                                            setState.data=`${keysdata.name}:$$:${location.room_name}`
                                            setActyData(keysdata.hub_id,JSON.parse(JSON.stringify(setState)));
                                            await setStateData('device_configiration',keysdata.device_id,JSON.parse(JSON.stringify(body)));
                                            let keysdata1=JSON.parse(JSON.stringify(result));
                                            keysdata1.device_id=`${result.device_id}$4`
                                            keysdata1.name=`${result.name} 4`
                                            keysdata1.device_b_one_id=`${result.device_id}$4`
                                            await getModels().Devices.build(JSON.parse(JSON.stringify(keysdata1))).save();
                                            setState.dev_id=keysdata1.device_id
                                            setState.data=`${keysdata1.name}:$$:${location.room_name}`
                                            setActyData(keysdata.hub_id,JSON.parse(JSON.stringify(setState)));
                                            await setStateData('device_configiration',keysdata1.device_id,JSON.parse(JSON.stringify(body)));
                                        }
                                        
                                        await delData(`${uuid}`)
                                        resolve({status:1,user_id:result.user_id});
                                    }else  if(result.category_id){
                                        await getModels().Devices.build(result).save();
                                        await delData(`${uuid}`)
                                        let setState={dev_id:result.device_id,room_id:result.room_id,type:2,state:'A',data:`${result.name}:$$:${location.room_name}`}
                                        setActyData(result.hub_id,JSON.parse(JSON.stringify(setState)));
                                        if(result.setObject!=undefined){
                                            setStateData('state',result.device_id,result.setObject); 
                                        }
                                        if(result.irObject!=undefined){
                                            setStateData('irstate',result.device_id,result.irObject); 
                                        }
                                        let {setObject,irObject,configObject,...restdata}=body
                                        if(configObject!=undefined){
                                            restdata=Object.assign(restdata,configObject);
                                            setStateData('device_configiration',result.device_id,restdata);
                                        }else{
                                            setStateData('device_configiration',result.device_id,restdata);
                                        }
                                       
                                        resolve({status:1,user_id:result.user_id});
                                    }else{
                                    logger.info("category_id not found")
                                    resolve({status:0,user_id:result.user_id});  
                                    }
                                }else{
                                    logger.info("room not found")
                                    resolve({status:0,user_id:result.user_id});  
                                }
                                
                            }else{
                                logger.info("room id not found")
                                resolve({status:0,user_id:result.user_id});  
                            }
                            
                            
                        }
                        catch(err){
                            logger.error(err);
                            resolve({status:1,user_id:result.user_id});
                        }
                        
                    }    
                }else{
                    resolve({status:0}) 
                }
    })
}
const checkHub=async(mac_id)=>{
    return new Promise(async(reslove)=>{
        let hubs= await getModels().Hubs.findAll({where:{hub_id:mac_id,is_active:true}});
        if(hubs.length>0){
            hubs[0].update({hub_id:`${mac_id}_${new Date().getTime()}`,is_active:false}).then(()=>{
                reslove(true)
            });
        }else{
            reslove(true);
        }
    })
}