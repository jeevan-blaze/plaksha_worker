const { getModels,getMySqlConnection } =require('../database/mysql');
module.exports = {
    getappNotify:async(room_id)=>{
        return new Promise((async(resolve)=>{
            let quary=`SELECT app_notify FROM location_preference as lp join location_rooms as lr on lr.location_id =lp.location_id where room_id='${room_id}'`
            let result=await QuaryMysql(quary);
            if(result.length>0){
                if(result[0].app_notify && result[0].app_notify==='1'){
                    resolve(true);
                }else{
                    resolve(false);
                }
                
            }else{
                resolve(true);
            }
        }))
    },
    getappNotifyGuest:async(device_id)=>{
        return new Promise((async(resolve)=>{
            let quary=`select gu.user_id,lp.app_notify from guest_users as gu join location_preference as lp on lp.user_id=gu.user_id join guest_locations_details as gld on gld.location_id=lp.location_id and gld.guest_id=gu.guest_id where gu.is_active=true and lp.master=0 and lp.app_notify="1" and gld.is_active=true and gld.devices like '%${device_id}%';`
            let result=await QuaryMysql(quary);
            if(result.length>0){
                resolve([true,result]);
            }else{
                resolve([false,[]]);
            }
        }))
    }
}

async function QuaryMysql(quary) {
    return new Promise(async (reslove) => {
        let mysqlConnection = getMySqlConnection();
        mysqlConnection.query(`${quary}`, {
            type: mysqlConnection.QueryTypes.SELECT
        }).then(results => {
            reslove(results)
        })
    })
}