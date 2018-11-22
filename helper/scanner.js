var inPath = global.gConfig.in_path,
    ext = global.gConfig.allowed_ext;

var fs = require('fs'),
    path = require('path'),
    cb = require('./callback.js');

module.exports = {
    StartScan: function(callback)
    {
        // For Regex Testing
        //regexTester(); return;

        let log = [];
        let errors = [];
        let file = require('file-system');
        let cnt = 0;
        let allFiles = 0;
        file.recurse(inPath, null, function(fpath, rel, filename) {
            allFiles++;
            if (ext.indexOf(path.extname(fpath)) != -1) {
                cnt++
                cb.increment();
                console.log('Processing file - ', cnt + 1,'- ', filename);
                scanDocument(fpath, function(d) {
                    if(d != null) {
                        log.push(d);
                    }
                    if(cb.decrement())
                    {
                        console.log("\n------- RESULT -------------")
                        console.log(" Total no of files under input directory - ", allFiles);
                        callback(log, errors);
                    }
                }, function(e) {
                    let rs = {
                        filename : filename,
                        filepath : fpath,
                        error: e.toString()
                    }
                    errors.push(rs);
                    if(cb.decrement())
                    {
                        console.log("------- RESULT -------------\n")
                        console.log(" Total no of files under input directory - ", allFiles);
                        callback(log, errors);
                    }
                })
            }
        });
    }
}

// Scan single document
function scanDocument(fPath, success, error) {
    var readline = require('readline'),
        textract = require('textract');
    
    textract.fromFileWithPath(fPath, { preserveLineBreaks: true}, function( err, txt ) {
        if (err) {
            error(err);
            return;
        }

        var rs = {
                    FileName: path.basename(fPath),
                    FullPath: fPath,
                    Result: []
                 };
        
        const lines = txt.split('\n');
        for(var j = 0; j < lines.length; j++) {
            var result = scanURL(lines[j]);
            if(result != null) {
                rs.Result.push(result);
            }
        }

        if(rs && rs.Result && rs.Result.length > 0) {
            success(rs);
        }
        else {
            success(null);
        }
    })
}

// Match regex patterns
function scanURL(line) {

    var patterns = [
        // For Windows Paths
        //new RegExp(/(([a-zA-Z]\:|\\)(\\w+)*\\[a-zA-Z0_9]+)/g),
        new RegExp(/(([a-zA-Z]\:|\\)(w+)*\\)/g),
        
        // For UNIX/Linux Paths
        new RegExp(/\/$|(^(?=\/)|^\.|^\.\.|^\~|^\~(?=\/))(\/(?=[^/\0])[^/\0]+)*\/?/g),
    ];

    var rs = null;
    for(var i = 0; i < patterns.length; i++) {
        var matchedResult = line.match(patterns[i]);
        if(matchedResult && matchedResult.length > 0) {
            rs = {
                    LineText: line,
                    MatchedPattern: patterns[i].toString()
                 };

            return rs;
        }
    }

    return rs;
}

// Testing Method for Regex Pattern Matching
function regexTester() {

    var inputs = [
        // Window
        'c:\\test\\test',
        'C:\\Program Files (x86)\\Button Shop 4',
        'C:\\Program Files (x86)\\Button Shop 4\\test.html',
        '\\\\shared\\test\\test\\abc.html',
        '\\\\192.168.0.1\\my.folder\\folder.2\\file.gif',

        // Linux
        '/test/test/test',
        '/usr/local/data/userdata.xls',
        '/home/userdata.doc',
        '/accounts.txt',
        '//usr/local/data/userdata.xls',
        '//usr/local/',
    ];
    
    console.log('\n Test Started....\n');

    let result = [];
    for(var i = 0; i < inputs.length; i++) {
        let line = inputs[i];
        let rs = scanURL(line);
        if(rs) {
            result.push(rs);
        } else if(result.findIndex(o => o.LineText == line) == -1) {
            console.log(' No Match [', i, '] - ', line)
        }
    }
    console.log(result);
    debugger;
}