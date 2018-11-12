var inPath = global.gConfig.in_path,
    outPath = global.gConfig.out_path,
    ext = global.gConfig.allowed_ext;

var fs = require('fs'),
    path = require('path'),
    cb = require('./callback.js');

module.exports = {
    StartScan: function(callback)
    {
        let log = [];
        let errors = [];
        let file = require('file-system');
        let cnt = 0;
        file.recurse(inPath, null, function(fpath, rel, filename) {
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
                result.LineNo = j + 1;
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
    var patterns = global.gConfig.regex_pattern;
    var rs = null;
    for(var i = 0; i < patterns.length; i++) {
        var reqex = new RegExp(patterns[i]);
        if(reqex.test(line)) {
            rs = {
                    LineText: line,
                    MatchedPattern: patterns[i],
                    LineNo: null
                 };
        }
    }
    return rs;
}



















// function saveFileToOutFolder(fName, callback) {
//     var srcPath = global.gConfig.in_path + "\\" + fName;
//     var destPath = global.gConfig.out_path + "\\" + fName;

//     fs.copyFile(srcPath, destPath, (err) => {
//         if (err) {
//             callback('FAILED to copy to out folder' )
//             console.log('error - ' + err);
//             return;
//         }
//     });
// }