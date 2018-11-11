
process.env.NODE_ENV = 'development';
const config = require('./config/config.js');

const express = require('express');
const app = express();
app.get('/', (req, res) => {
    res.json(global.gConfig);
});

const scanner = require('./helper/scanner.js');
scanner.StartScan(function (rs) {
    console.log("------- RESULT -------------\n")
    console.log(JSON.stringify(rs));
    WriteToFile(JSON.stringify(rs));
}, function (err) {
    console.log(err);
})

function WriteToFile(data) {
    var fs = require('fs'),
        path = require('path');
    var reportPath =  path.join(global.gConfig.out_path, 'report.txt');
    fs.writeFile(reportPath, data, function(err, data){
        if (err) { console.log(err); }
        console.log("\nReport file created successfully.");
    });
 }