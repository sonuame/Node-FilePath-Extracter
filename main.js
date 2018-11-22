process.env.NODE_ENV = 'beno';
const config = require('./config/config.js');
let path = require('path');

const express = require('express');
const app = express();
app.get('/', (req, res) => {
    res.json(global.gConfig);
});

const scanner = require('./helper/scanner.js');
var start = new Date().getTime();
scanner.StartScan(function (successlog, errorlog) {
    console.log(" Total no of allowed files - ", successlog.length + errorlog.length);
    console.log(" Successful scans - ", successlog.length);
    console.log(" Errors - ", errorlog.length);
    console.log("\n ");

    console.log(" Generating reports...");
    let outpath = path.join(global.gConfig.out_path, 'report.json');
    WriteToFile(JSON.stringify(successlog), outpath);

    let errorLogPath = path.join(global.gConfig.out_path, 'errorlog.json');
    WriteToFile(JSON.stringify(errorlog), errorLogPath);

    generateReadableReport(successlog, errorlog);
    console.log("\n ");
})

function WriteToFile(data, outpath) {
    var fs = require('fs');
    fs.writeFile(outpath, data, function(err, data){
        if (err) { console.log(err); }
        console.log(" File created successfully - ", outpath);
    });
}
 
// Generate report in readable format
function generateReadableReport(rs, err) {

    let bodyStr = '';
    bodyStr += '\n Input Directory Path - ' + global.gConfig.in_path;
    bodyStr += '\n Successful scans - ' + rs.length;
    bodyStr += '\n Errors - ' + err.length;
    bodyStr += '\n \n ';

    for(var i = 0; i < rs.length; i++) {
        bodyStr += '\n \n [' + rs[i].Result.length + ' URLs Found] in ' + rs[i].FileName;
        bodyStr += '\n ---------------------------------------------------------------------------------------------------------------------------';
        for(var j = 0; j < rs[i].Result.length; j++) {
            bodyStr += '\n  |-- ' + rs[i].Result[j].LineText;
        }
    }

    let readableReportPath = path.join(global.gConfig.out_path, 'report.txt');
    WriteToFile(bodyStr, readableReportPath);
}