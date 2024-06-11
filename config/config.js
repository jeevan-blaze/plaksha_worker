let env_details={}
exports.setEnvDetails = async function(envdata){
    env_details=envdata;     
}
    
exports.getEnvDetails = function(){
    return env_details;
}
exports.setKey = function(key,value){
    if(key){
        env_details[`${key}`]=value;
    }
}
