process.env.NODE_ENV = 'beno';
const config = require('./config/config.js');

const express = require('express');
const app = express();
app.get('/', (req, res) => {
    res.json(global.gConfig);
});

const scanner = require('./helper/scanner.js');
var start = new Date().getTime();
scanner.StartScan(function (successlog, errorlog) {
    console.log("------- RESULT -------------\n")
    // let excTime = (new Date().getTime() - start) / 1000;
    // if(excTime >= 60) {
    //     console.log('\n Execution Time - ', Math.abs(excTime / 60), ' mins');
    // }
    // else {
    //     console.log('\n Execution Time - ', Math.abs(excTime), ' sec.');
    // }
    console.log(" Total no of files - ", successlog.length + errorlog.length);
    console.log(" Successful scans - ", successlog.length);
    console.log(" Errors - ", errorlog.length);
    console.log("\n ");

    let path = require('path');
    let outpath = path.join(global.gConfig.out_path, 'report.json');
    WriteToFile(JSON.stringify(successlog), outpath);

    let errorLogPath = path.join(global.gConfig.out_path, 'errorlog.json');
    WriteToFile(JSON.stringify(errorlog), errorLogPath);
})

function WriteToFile(data, outpath) {
    var fs = require('fs'),
        path = require('path');
    fs.writeFile(outpath, data, function(err, data){
        if (err) { console.log(err); }
        console.log(" Log file created successfully - ", outpath);
    });
 }