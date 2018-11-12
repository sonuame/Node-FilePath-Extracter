var inPath = global.gConfig.in_path,
    outPath = global.gConfig.out_path,
    ext = global.gConfig.allowed_ext,
    deepSearch = global.gConfig.deep_search;

var fs = require('fs'),
    path = require('path'),
    cb = require('./callback.js');

module.exports = {
    StartScan: function(success, error)
    {
        var log = [];
        var files = getFilesInDirectory(inPath, ext, deepSearch);
        for(var i = 0; i < files.length; i++) {
            cb.increment();
            var filename = files[i].split('\\')[files[i].split('\\').length-1];
            console.log('Processing ', i+1, ' of ', files.length, ' - ', filename);
            scanDocument(files[i], function(d) {
                if(d != null) {
                    log.push(d);
                }
                if(cb.decrement())
                {
                    success(log);
                }
            }, function(e) {
                error(e);
                cnt--;
            })
        }
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

// Get all files from specified directory
function getFilesInDirectory(dir, allowedExt, deepSearch = false) {
    if (!fs.existsSync(dir)) {
        console.log(`Specified directory: ${dir} does not exist`);
        return;
    }

    let files = [];
    fs.readdirSync(dir).forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.lstatSync(filePath);

        if (stat.isDirectory()) {
            if(deepSearch === true) {
                const nestedFiles = getFilesInDirectory(filePath, allowedExt);
                files = files.concat(nestedFiles);
            }
        } else {
            if (allowedExt.indexOf(path.extname(file)) != -1) {
                files.push(filePath);
            }
        }
    });

    return files;
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