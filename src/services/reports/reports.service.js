const mysql = require('../../database/mysql');
const mongo = require('../../database/mongodb');
const UtilsService = require('../common/utils.services');
const { logger } = require('../../../logger/index');
const path = require('path');
const fs = require('fs');
const wkhtmltopdf = require('wkhtmltopdf');
const ejs = require('ejs');
const hb = require('handlebars');
const UserService= require('../users/users.services')

exports.EnergyReports = (req) => {
    return new Promise(async (reslove) => {
        try{
            let body=req.body;
            req.params.report_type='custom'
            if(body.email==undefined){
                body.email="true"
            }
            if(body.report_type!=undefined){
                req.params.report_type=body.report_type
            }
            let [dstate,dev_type,headers,import_color,export_color,type_dev]=await getgeviceType(req.params.category_id)
            if(body.start<body.end && ['active','netactive'].includes(type_dev) && ['hours','days','week','months','custom'].includes(req.params.report_type)){
                let type=`${req.params.report_type}`
                if(req.params.report_type=='hours'){
                    hours=true;
                    req.params.report_type='minutes'
                }
                if(req.params.report_type=='week' || req.params.report_type=='custom'){
                    req.params.report_type='days'
                }
                let collection=`energy_${req.params.report_type}`;
                let query={device_id:req.params.device_id,ts:{$gte:parseInt(`${body.start}`),$lte:parseInt(`${body.end}`)}}
                let keysName={_id:0,ts:1}
                let flag=false;
                let keyname=''
                if((type_dev)==='active'){
                    keyname='Pt'
                    keysName.Pt=1;
                    flag=true;
                }
                if((type_dev)==='netactive'){
                    keyname='Pt'
                    keysName.Pt=1;
                    keysName.PtN=1;
                    flag=true;
                }
                if(flag){
                    let [state,results] = await mongo.findSortedObjectsFields(collection,query,keysName,{ts:1},0);
                    if(state && results.length>0){
                        let reports={}
                        reports.headers=headers;
                        reports.name=`${req.params.name}`;
                        reports.dev_type=dev_type;
                        reports.type=type;
                        reports.export_val=0;
                        reports.import_val=0;
                        reports.net_val=0;
                        if(type=='months'){
                            reports.statement_type=`Yearly ${dev_type} Statement`
                            reports.graph_type=`Yearly ${dstate} Graph`
                        }
                        if(type=='days'){
                            reports.period=`${await getDateType(parseInt(body.start))} - ${await getDateType(parseInt(body.end))}`
                            reports.statement_type=`Monthly ${dev_type} Statement`
                            reports.graph_type=`Daily ${dstate} Graph`
                        }
                        if(type=='week'){
                            reports.period=`${await getDateType(parseInt(body.start))} - ${await getDateType(parseInt(body.end))}`
                            reports.statement_type=`Weekly ${dev_type} Statement`
                            reports.graph_type=`Daily ${dstate} Graph`
                        }
                        if(type=='hours'){
                            reports.period=`${await getDateType(parseInt(body.start))}`
                            reports.statement_type=`Daily ${dev_type} Statement`
                            reports.graph_type=`Hourly ${dstate} Graph`
                        }
                        if(type=='custom'){
                            reports.period=`${await getDateType(parseInt(body.start))} - ${await getDateType(parseInt(body.end))}`
                            reports.statement_type=`Custom ${dev_type} Statement`
                            reports.graph_type=`Daily Consumption`
                        }
                        let flag=true;
                        if(type!='custom' && dev_type!='Solar'){
                            reports.category_data={}
                            results.forEach(async (ele)=>{
                                let ts=ele.ts
                                if(type=='hours'){
                                    let tts= new Date(ele.ts)
                                    tts.setUTCMinutes(0,0,0);
                                    ts=tts.getTime()
                                }
                                let obj={}
                                obj.Pt=parseFloat(((ele.Pt).reduce((prv,curr)=> prv+curr)))
                                obj.PtN=parseFloat((ele.PtN).reduce((prv,curr)=> prv+curr))
                                reports.export_val+=obj.PtN;
                                reports.import_val+=obj.Pt;
                                let net=parseFloat((obj.Pt-obj.PtN))
                                let cat=reports.category_data[`${ts}`];
                                if(cat==undefined){
                                    cat=0;
                                }
                                reports.category_data[`${ts}`]=cat+net;
                            })
                            let category=Object.keys(reports.category_data).map((ele,index)=>{
                                let ts=new Date(parseInt(`${ele}`))
                                let valus=`${(reports.category_data[ele]/1000).toFixed(2)}`
                                let data=(ts.toUTCString()).split(' ');
                                let key_name=`${valus} kWh - ${data[2]} ${data[1]}`
                                if(type=='hours'){
                                    let hm='PM'
                                    if(ts.getUTCHours()<=11)hm='AM'
                                    let hours=ts.getUTCHours()
                                    if(hours==0){
                                        hours=12
                                    }
                                    if(ts.getUTCHours()>=13){
                                        hours=ts.getUTCHours()-12 
                                    }
                                    key_name=`${valus} kWh - `+parseFloat(Math.abs(hours)).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})+" "+hm
                                }
                                return key_name;
                            })
                            let srdata=Object.values(reports.category_data).map(ele=>{
                                let obj={y:parseFloat((ele/1000).toFixed(2)),color:export_color}
                                if(ele>=0){
                                    obj.color=import_color;
                                }
                                return obj;
                            })
                            reports.data=JSON.stringify(srdata);
                            reports.catgory=JSON.stringify(category);
                            reports.net_val=((reports.import_val-reports.export_val)/1000).toFixed(2)
                            reports.export_val=(reports.export_val/1000).toFixed(2)
                            reports.import_val=(reports.import_val/1000).toFixed(2)  
                        }else if(type=='custom' && dev_type!='Solar'){
                            reports.table=[]
                            results.forEach(async (ele)=>{
                                let obj={}
                                let datets= (new Date(ele.ts).toDateString()).split(" ");
                                obj.date=`${datets[1]} ${datets[2]} ${datets[3]}`
                                obj.Pt=(ele.Pt).reduce((prv,curr)=> prv+curr)
                                reports.import_val+=obj.Pt;
                                obj.Pt=parseFloat((obj.Pt/1000).toFixed(2))
                                obj.PtN=(ele.PtN).reduce((prv,curr)=> prv+curr)
                                reports.export_val+=obj.PtN;
                                obj.PtN=parseFloat((obj.PtN/1000).toFixed(2))
                                obj.net=parseFloat((obj.Pt-obj.PtN).toFixed(2))
                                reports.table.push(obj)
                            })
                            reports.data=JSON.stringify([]);
                            reports.catgory=JSON.stringify([]);
                            reports.net_val=((reports.import_val/1000)-(reports.export_val/1000)).toFixed(2) 
                            reports.export_val=(reports.export_val/1000).toFixed(2)
                            reports.import_val=(reports.import_val/1000).toFixed(2)
                        }else if(type!='custom' && dev_type=='Solar'){
                           reports.category_data={}
                            results.forEach(async (ele)=>{
                                let ts=ele.ts
                                if(type=='hours'){
                                    let tts= new Date(ele.ts)
                                    tts.setUTCMinutes(0,0,0);
                                    ts=tts.getTime()
                                }
                                let obj={}
                                obj.Pt=(ele.Pt).reduce((prv,curr)=> prv+curr)
                                reports.import_val+=obj.Pt;
                                let net=obj.Pt
                                let cat=reports.category_data[`${ts}`];
                                if(cat==undefined){
                                    cat=0;
                                }
                                reports.category_data[`${ts}`]=cat+net;
                       })
                            let category=Object.keys(reports.category_data).map((ele,index)=>{
                                let ts=new Date(parseInt(`${ele}`))
                                let valus=`${(reports.category_data[`${ele}`]/1000).toFixed(2)}`
                                let data=(ts.toUTCString()).split(' ');
                                let key_name=`${valus} kWh - ${data[2]} ${data[1]}`
                                if(type=='hours'){
                                    let hm='PM'
                                    if(ts.getUTCHours()<=11)hm='AM'
                                    let hours=ts.getUTCHours()
                                    if(hours==0){
                                        hours=12
                                    }
                                    if(ts.getUTCHours()>=13){
                                        hours=ts.getUTCHours()-12 
                                    }
                                    key_name=`${valus} kWh - `+parseFloat(Math.abs(hours)).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})+" "+hm
                                }
                                return key_name;
                            })
                            let srdata=Object.values(reports.category_data).map(ele=>{
                                let obj={y:parseFloat((ele/1000).toFixed(2)),color:export_color}
                                if(ele>=0){
                                    obj.color=import_color;
                                }
                                return obj;
                            })
                            reports.data=JSON.stringify(srdata);
                            reports.catgory=JSON.stringify(category);
                            reports.net_val=(reports.import_val*req.params.tree/1000).toFixed(2)
                            reports.import_val=(reports.import_val/1000).toFixed(2)
                            reports.export_val=(reports.import_val*req.params.co2/1000).toFixed(2)
                        }else{
                            flag=false;
                        }
                        if(flag){
                            let [state,pdfBuffer]= await generatePDF('statements',`${req.params.device_id}_${new Date().getTime()}`,reports);
                            if(state){
                                if(body.email!=undefined && body.email=='true'){
                                    let user= await UserService.get(req.params.user_id,null,null,4,['name','email_id','company_id','user_type'])
                                    if(user.status){   
                                       let Objdata={type:reports.dev_type,dev_name:reports.name,date:reports.period,statement_type:reports.statement_type,pdfBuffer:pdfBuffer}
                                       Objdata.subject=`${reports.statement_type} from ${reports.period} of your ${reports.name} Energy Meter.`;
                                       let quary=`select ld.location_name from locations_details as ld join location_rooms as lr on lr.location_id=ld.location_id where lr.room_id='${req.params.room_id}'`;
                                       let dataresult=await UtilsService.QuaryMysql(quary);
                                       if(dataresult.length>0){
                                        Objdata.location_name=dataresult[0].location_name;
                                       }
                                       let statement=(reports.statement_type).replace(`${reports.dev_type} `,'')
                                       Objdata.filename=`${statement} ${reports.period}`;
                                       if(reports.type!='custom'){
                                        Objdata.message=true;                                
                                        Objdata.statement=`${statement}`;
                                       }
                                       let email_id=user.data.email_id;
                                       if(body.email_id){
                                        email_id=body.email_id;
                                       }
                                       if(body.file_name){
                                        Objdata.filename=`${body.file_name} ${reports.period}`;
                                       }
                                       let data={
                                        template_id:13,
                                        email_id:email_id
                                       }
                                       UtilsService.SendMail(13,email_id,user.data.name,user.data.user_type,user.data.company_id,null,1,Objdata);
                                    }
                                }
                               // return res.send({status:1,message:"Report generated successfully "})
                               logger.info("Report generated successfully");
                               reslove({status:1,message:"Report generated successfully"})
                                // return MessageService.responceServer(req,res,114,1,null,null);
                            }else{
                                logger.warn("no report found");
                                reslove({status:0,message:"no report found"})
                                // return MessageService.responceServer(req,res,117);
                            }
                        }else{
                            logger.warn("invalid report type");
                            reslove({status:0,message:"invalid report type"})
                            // return MessageService.responceServer(req,res,118);
                        }
                        
                    }else{
                        logger.warn("no records found");
                        reslove({status:0,message:"no records found"})
                        // return MessageService.responceServer(req,res,104);
                    }
                }else{
                    logger.warn("invalid paramates");
                    reslove({status:0,message:"invalid paramates"})
                    // return MessageService.responceServer(req,res,107);
                }
                
            }else{
                logger.warn("invalid paramates");
                reslove({status:0,message:"invalid paramaters"})
                // return MessageService.responceServer(req,res,108);
            }  
        }catch(error){
            logger.error("Something went wrong. Please try again");
            reslove({status:0,message:"Something went wrong. Please try again"})
            // logger.error({path:req.path,query:req.query,body:req.body,message:error.message});
            // return MessageService.responceServer(req,res,5);
        } 
    });

}
// Function for getting templates Configs
const getgeviceType = (async (category_id) => {
    return new Promise(async (reslove) => {
        try {
            if (category_id == '53a7a03d-9429-4bb4-9cac-a5b1adda47e5') {
                reslove(['Usage', 'Grid', [{ name: 'Imported from grid', icon: 'downarrow', color: '#014FA4', keyname: 'import_val', value: 'kWh' }, { name: 'Exported to grid', icon: 'uparrow', color: '#42B4E6', keyname: 'export_val', value: 'kWh' }, { name: 'Net Consumption', icon: 'biarrow', color: '#19BED4', keyname: 'net_val', value: 'kWh' }], "#014FA4", "#42B4E6", "netactive"]);
            }
            if (category_id == '8f33faa9-ddbf-4171-be95-e75f895e1015') {
                reslove(['Charged', 'Battery', [{ name: 'Charged', icon: 'downarrow', color: '#353535', keyname: 'import_val', value: 'kWh' }, { name: 'Discharged', icon: 'uparrow', color: '#626469', keyname: 'export_val', value: 'kWh' }, { name: 'Net Charged', icon: 'biarrow', color: '#353535', keyname: 'net_val', value: 'kWh' }], "#353535", "#626469", "netactive"]);
            }
            if (category_id == 'c383046d-02e5-4eda-9940-e91fc8a31bf1') {
                reslove(['Charged', 'Electric Vehicle', [{ name: 'Charged', icon: 'downarrow', color: '#008486', keyname: 'import_val', value: 'kWh' }, { name: 'Discharged', icon: 'uparrow', color: '#008486', keyname: 'export_val', value: 'kWh' }, { name: 'Net Charged', icon: 'biarrow', color: '#008486', keyname: 'net_val', value: 'kWh' }], "#008486", "#008486", "netactive"]);
            }
            if (category_id == '9cc5a2b3-e818-4de9-aa9b-f4509604f70d') {
                reslove(['Production', 'Solar', [{ name: 'Total Production', icon: 'sun', color: '#C36D3C', keyname: 'import_val', value: 'kWh' }, { name: 'CO2 Saved', icon: 'co2', color: '#626469', keyname: 'export_val', value: 'KG' }, { name: 'Tree Saved', icon: 'tree', color: '#008a16', keyname: 'net_val', value: 'Trees' }], "#C36D3C", "#C36D3C", "netactive"]);
            }
            if (category_id == 'location') {
                reslove(['Total Home Consumption', 'Home', [{ name: 'From Grid', icon: 'grid', color: '#19BED4', keyname: 'import_val', value: 'kWh' }, { name: 'From Solar', icon: 'sun', color: '#77DD00', keyname: 'export_val', value: 'kWh' }, { name: 'From Battery', icon: 'battery', color: '#19BED4', keyname: 'net_val', value: 'kWh' }, { name: 'From EV', icon: 'car', color: '#13A50E', keyname: 'ev_value', value: 'kWh' }, { name: 'Total Home Consumption', icon: 'home', color: '#19BED4', keyname: 'th_value', value: 'kWh' }], "#FDD835", "#FDD835", "active"]);
            }
        } catch (error) {
            logger.error(`getgeviceType function error: ${error.message}`);
            reslove([]);
        }
    })
})
// 
const getDateType = (async (ts) => {
    try {
        let datets = (new Date(ts).toUTCString()).split(" ");
        return `${datets[2]} ${datets[1]} ${datets[3]}`;
    } catch (error) {
        logger.error(`getDateType function error: ${error.message}`);
        return '';
    }
})
exports.generatePdfEmail = async({PdfConfig,MailConfig})=>{
    try{
    const {template, filename, obj} = PdfConfig
    let [pdfState,pdfBuffer] =await generatePDF(template, filename, obj)
    if(pdfState){
        let {type, email_id, name, user_type, company_id, code, login_type,objdata} = MailConfig;
        objdata['pdfBuffer'] = pdfBuffer;
        await UtilsService.SendMail(type, email_id, name, user_type, company_id, code, login_type,objdata)
    }else {
        logger.error('Something went wrong with generatePDF Function')
    }
    }catch(e){
        logger.error('Something went wrong with generatePDF Function',e)
    }
} 
let generatePDF = async (template, filename, obj) => {
    return new Promise(async (resolve) => {
        try {
            const pathForPdf = path.join(__dirname, '../../../PDFFiles/');
            if (!fs.existsSync(pathForPdf)) {
                fs.mkdirSync(pathForPdf, { recursive: true });
            }

            let wkhtmltopdf_path = path.join(__dirname, './helpers/wkhtmltopdf/win64/wkhtmltopdf.exe');
            wkhtmltopdf.command = wkhtmltopdf_path
            ejs.renderFile(
                path.join(__dirname, '/templates/', `${template}.ejs`),
                obj,
                async (err, ress) => {
                    if (err) {
                        logger.info(err);
                        resolve([false, '']);
                    } else {
                        try {
                            const PDFpath = `${pathForPdf}${filename}.pdf`;
                            const data = {};
                            const template = hb.compile(ress, { strict: true });
                            const result = template(data);
                            const html = result;
                            // Use wkhtmltopdf NPM package to convert HTML to PDF
                            const pdfBuffer = await new Promise((resolve, reject) => {
                                const pdfStream = wkhtmltopdf(html, {
                                    pageSize: 'A4',
                                    marginTop: '10mm',
                                    marginBottom: '10mm',
                                    marginLeft: '1mm',
                                    marginRight: '1mm',
                                    encoding: 'utf8',
                                });
                    
                                const chunks = [];
                                pdfStream.on('data', (chunk) => chunks.push(chunk));
                                pdfStream.on('end', () => resolve(Buffer.concat(chunks)));
                            });    
                        resolve([true, pdfBuffer]);
                        } catch (err) {
                            logger.error(`PDF Error: ${err.message}`);
                            resolve([false, '']);
                        }
                    }
                }
            );

        } catch (error) {
            logger.error(`generatePDF function error: ${error.message}`);
            resolve([false, '']);
        }
    });
};