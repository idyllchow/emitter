var express = require('express');
var router = express.Router();
var path = require("path");
const fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
  var androidPath = path.join(__dirname, '../public/archives/history/android/');
  var archives = [];

  walk(androidPath, function(err, androidResults) {
    if (err) throw err;
    res.render('android', {title:"Android历史版本", archives:androidResults});
  });
});

// 实现文件下载
router.get('/:fileName', function(req, res, next) {
  // 实现文件下载 
  var fileName = req.params.fileName;
  var tmp;
  if(fileName.indexOf('.apk') > -1) {
    tmp = '../public/archives/history/android/';
  } 

  var filePath = path.join(__dirname, tmp + fileName);
  console.log('filePath======' + filePath);
  var stats = fs.statSync(filePath);
  if(stats.isFile()){
    res.set({
      'Content-Type': 'application/octet-stream',
      // 'Content-type': 'application/vnd.android.package-archive',
      'Content-Disposition': 'attachment; filename='+fileName,
      'Content-Length': stats.size
    });
    res.setHeader("Access-Control-Allow-Origin", "*");
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.end(404);
  } 
});


var walk = function(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      file = path.resolve(dir, file);

      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          var type;
          var iconUrl;
          var iconSize;
          var platform = "";
          var version;
          var downloadUrl;
          // 修改时间, Date对象:
          if (path.basename(file).indexOf('release.apk')!=-1) {
            type = 'release';
            platform = 'android';
            iconUrl = '/images/ic_android_release.png';
            downloadUrl = '/' + path.basename(file);
            andrReleaseUrl = '/' + path.basename(file);
            
          } else if (path.basename(file).indexOf('debug.apk')!=-1) {
            type = 'debug';
            platform = 'android';
            iconUrl = '/images/ic_android_debug.png';
            downloadUrl = '/' + path.basename(file);
            
          } 
          if (platform.length != 0) {
            var result = {
              platform: platform,
              type:type,
              name: path.basename(file),
              time: stat.birthtime,
              img: iconUrl,
              downloadUrl: downloadUrl,
              version: version
            };
            results.push(result);
            }
            if (!--pending) done(null, results);
          
        }
      });
    });
  });
};

function fileDisplay(filePath){ 
    var files = []; 
    //根据文件路径读取文件，返回文件列表  
    fs.readdir(filePath,function(err,files){  
        if(err){  
            console.warn(err)  
        }else{  
            //遍历读取到的文件列表  
            files.forEach(function(filename){  
                //获取当前文件的绝对路径  
                var filedir = path.join(filePath,filename);  
                //根据文件路径获取文件信息，返回一个fs.Stats对象  
                fs.stat(filedir,function(eror,stats){  
                    if(eror){  
                        console.warn('获取文件stats失败');  
                    }else{  
                        var isFile = stats.isFile();//是文件  
                        var isDir = stats.isDirectory();//是文件夹  
                        if(isFile){  
                            files.push(stats);
                            // console.log(filedir);  
                        }  
                        if(isDir){  
                            fileDisplay(filedir);//递归，如果是文件夹，就继续遍历该文件夹下面的文件  
                        }  
                    }  
                })  
            });  
        }  
    });
    return files;  
}

module.exports = router;
