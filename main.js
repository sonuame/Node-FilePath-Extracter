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
    let readableTxtReportPath = path.join(global.gConfig.out_path, 'report.txt');
    WriteToFile(bodyStr, readableTxtReportPath);

    let htmlStr = '';
    htmlStr += '<html>';

        // #region 'Report HTML - Head'
        htmlStr += `<head>
                        <link href='https://fonts.googleapis.com/css?family=Ubuntu+Condensed' rel='stylesheet'>
                        <style>
                            body {
                                padding: 0;
                                margin: 0;
                                font-family: 'Ubuntu Condensed', sans-serif;
                                background-color: #f9f7f7;
                            }
                            .head-container {
                                padding: 10px;
                                background-color: #e6e6e6;
                                border-bottom: 1px solid #bbbaba;
                            }
                            .head-container p {
                                margin: 0;
                                padding: 5px;
                                font-size: 16px;
                                font-weight: bold;
                            }
                            .dir-path {
                                font-size: 14px;
                                background-color: #d0cbcb;
                                padding: 5px 8px 5px 5px;
                                border-radius: 8px;
                                margin-left: 5px;
                            }
                            .success-cnt {
                                background-color: #cad4ca;
                                padding: 3px 5px;
                                border-radius: 8px;
                                margin-left: 5px;
                                color: #446d44;
                            }
                            .error-cnt {
                                background-color: #d4cccc;
                                padding: 3px 5px;
                                border-radius: 8px;
                                margin-left: 5px;
                                color: #5f2a2a;
                            }
                            .report-container {
                                padding: 15px 10px 0 10px;
                                font-size: 14px;
                            }
                            .report-item-head {
                                padding: 5px;
                                margin: 0;
                                font-size: 18px;
                                background-color: #e4e1e1;
                            }
                            .url-cnt {
                                color: #710303;
                                margin-right: 5px;
                            }
                            .word-cnt {
                                float: right;
                                color: #710303;
                                margin-right: 5px;
                            }
                            .report-item-body {
                                padding: 2px 5px 0 5px;
                                margin: 0;
                                background-color: #232323;
                            }
                            .report-item-linetext {
                                margin: 0;
                                width: 100%;
                                border: none;
                                background-color: transparent;
                                padding: 2px 0;
                                color: #ffffff;
                            }
                        </style>
                    </head>`;
        // #endregion

        // #region 'Report HTML - Body'
        htmlStr += '<body>';
            htmlStr += "<div class='head-container'>";
                htmlStr += "<p> Input Directory Path <span class='dir-path'>" + global.gConfig.in_path + "</span></p>";
                htmlStr += "<p> Successful scans <span class='success-cnt'>" + rs.length + "</span></p>";
                htmlStr += "<p> Errors <span class='error-cnt'>" + err.length + "</span></p>";
                htmlStr += "<p> Total word count <span class='dir-path'>{total-word-cnt}</span></p>";
            htmlStr += "</div>";

            let totalWordCnt = 0;
            for(var i = 0; i < rs.length; i++) {
                htmlStr += "<div class='report-container'>";
                    htmlStr += "<h1 class='report-item-head'>";
                        htmlStr += "<span class='url-cnt'>[" + rs[i].Result.length + " URLs Found]</span>";
                        htmlStr += "in " + rs[i].FileName + "<span class='word-cnt'>[Word Count - " + rs[i].WordCount + "]</span>";
                    htmlStr += "</h1>";

                    totalWordCnt += rs[i].WordCount;

                    let matches = "";
                    for(var j = 0; j < rs[i].Result.length; j++) {
                        matches += rs[i].Result[j].LineText + "\n";
                    }
                    htmlStr += "<div class='report-item-body'>";
                        htmlStr += "<textarea class='report-item-linetext' type='text' readonly rows='" + (rs[i].Result.length + 2) + "'>" + matches + "</textarea>";
                    htmlStr += "</div>";
                htmlStr += "</div>";
            }
            htmlStr = htmlStr.replace('{total-word-cnt}', totalWordCnt);
        htmlStr += "</body>";
        // #endregion

    htmlStr += "</html>";

    let readableHTMLReportPath = path.join(global.gConfig.out_path, 'report.html');
    WriteToFile(htmlStr, readableHTMLReportPath);
}