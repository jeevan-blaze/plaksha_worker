const dotenv = require('dotenv');
let config = require('./config/config');
let { logger } = require('./logger');
dotenv.config();
let env = 'azureeventhistory';
process.setMaxListeners(0);
const { DefaultAzureCredential } = require("@azure/identity");
const { SecretClient } = require("@azure/keyvault-secrets");
const credential = new DefaultAzureCredential();
const client = new SecretClient(process.env.KEYVAULT_URI, credential);
const fs = require("fs");
client.getSecret(process.env.AZURE_AEEE_SECRET_KEY_NAME)
    .then(async(data) => {
        try {
            // Default worker is AzureEventWorker
            let envdata = JSON.parse(data.value);
            config.setEnvDetails(envdata);
            if(process.env?.FCM_SERVICE_JSON_KEY_NAME!=undefined){
                let getFcmServiceJson = await client.getSecret(process.env.FCM_SERVICE_JSON_KEY_NAME).catch((err)=>logger.error(`Error While getting FCM Service from key vault:- ${JSON.stringify(err)}`));
                getFcmServiceJson = JSON.parse(getFcmServiceJson.value);
                config.setKey("FCM_SERVICE_JSON", getFcmServiceJson)
            }else logger.warn(`In Env "FCM_SERVICE_JSON_KEY_NAME" Key is not Found Notification will not work!`)
            /*
            if you want to run 'energyreportsWorker',  
            you can just create a new file with the name 'runValidation.json' in parent directory,
            After add this json content {"pdfWorkerEnable":true}, save it,
            run command 'node run.js' 
            */
           if(fs.existsSync('./envrun.json')){
               const configData = require('./envrun.json');
               if (configData && configData?.pdfWorkerEnable === true) {
                   env = 'energyreports';
                }
            }
            // if(require('./runValidation.json')){
            //     // Here checking whether the configuration file contains 'Energy Report Generater Worker' enabled to run 
            //     let ConfigData = require('./runValidation.json') // Expacting {"pdfWorkerEnable":true}
            //     let {pdfWorkerEnable}= JSON.stringify(JSON.parse(ConfigData));
            //     if(Boolean(pdfWorkerEnable)) env = 'energyreports'
            // }
            runWorker(env); // Init the Worker
            process.on('SIGINT', function () {
                closeWorker(env) // close worker
                setTimeout(() => {
                    process.exit(1);
                }, 2000);

            });
            process.on('message', function (msg) {
                if (msg == 'shutdown' || msg.type == 'shutdown') {
                    closeWorker(env) // close worker
                    setTimeout(() => {
                        process.exit(1);
                    }, 2000);
                }
            });

        }
        catch (err) {
            logger.error(err);
            process.exit(0)
        }
    })
    .catch((error) => {
        logger.error(error);
    });

function runWorker(env='azureeventhistory'){
    if(env === 'azureeventhistory'){
        const AzureEventWorker = require('./src/Worker/AzureEventsHistory');
        AzureEventWorker.init(env);
    }else if(env === 'energyreports'){
        const EnergyReportGenWorker = require('./src/Worker/EnergyReportGen');
        EnergyReportGenWorker.init();
    }else{
        logger.error('Environment not specified')
    }
}
function closeWorker(env){
    if(env === 'azureeventhistory'){
        const AzureEventWorker = require('./src/Worker/AzureEventsHistory');
        AzureEventWorker.Close();
    }else if(env === 'energyreports'){
        const EnergyReportGenWorker = require('./src/Worker/EnergyReportGen');
        EnergyReportGenWorker.Close();
    }else{
        logger.error('Environment not specified')
    }
}