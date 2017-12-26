var express = require('express');
var router = express.Router();
var path = require("path");
const fs = require('fs');
var async = require('async');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/presdt";

var pv;
var totalDownload;
 
/* GET home page. */
router.get('/', function(req, res, next) {
  // 显示服务器文件 
  // 文件目录 
  var androidPath = path.join(__dirname, '../public/archives/latest/android/');
  var iosPath = path.join(__dirname, '../public/archives/latest/ios/');
  
  var androidArchives = [];
  var iosArchives = [];

  // MongoClient.connect(url, function(err, db) {
  // if (err) throw err;
  // var dbase = db.db("presdt");
  // var query = {_id: 1024};
  // dbase.collection("pv_statistics").findOneAndUpdate(query, {$inc:{pv:1}},function(err, result) {
  //    if (err) throw err;
  //    pv = result.pv;
  //    totalDownload = result.total_download;
  //    db.close();
  //  });
  // });

  // walk(androidPath, function(err, androidResults) {
  //   if (err) throw err;
  //   if(androidResults.length>0) {
  //     // androidArchives = results;
  //     // res.render('download.html', {title:"实地通发布平台", androidArchives:androidArchives, iosArchives:iosArchives});
  //   } 

  //   walk(iosPath, function(err, iosResults) {
  //     if (err) throw err;
  //     // if(iosResults.length>0) {
  //       console.log("totalDownload: " + totalDownload);
  //       res.render('index', {title:"主页", androidArchives:androidResults, iosArchives:iosResults, totalDownload: totalDownload});
  //     // } 
  //   });
  // });

//   async.waterfall([
//     function(callback){
//         callback(null, 'one', 'two');
//     },
//     function(arg1, arg2, callback){
//         console.log('arg1 => ' + arg1);
//         console.log('arg2 => ' + arg2);
//         callback(null, 'three');
//     },
//     function(arg3, callback){
//         console.log('arg3 => ' + arg3);
//         callback(null, 'done');
//     }
// ], function (err, result) {
//    console.log('err => ' + err);
//    console.log('result => ' + result);
// });


async.waterfall([
    function(callback){
        walk(androidPath, function(err, androidResults) {
        if (err) throw err;
        callback(null, androidResults);
      
      });
    },
    function(arg1, callback){
        walk(iosPath, function(err, iosResults) {
        if (err) throw err;
        callback(null, arg1, iosResults);
      });
    },
    function(arg1, arg2, callback) {
      MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbase = db.db("presdt");
        var query = {_id: 1024};
        dbase.collection("pv_statistics").findOne(query, function(err, result){
        if (err) throw err;
        totalDownload = result.total_download;
        console.log('======totalDownload====' + result.pv);
        db.close();
        res.render('index', {title:"主页", androidArchives:arg1, iosArchives:arg2, totalDownload: totalDownload});
      });
    });
    }
  ]);
});



// 实现文件下载
router.get('/download/:fileName', function(req, res, next) {
  // 实现文件下载 
  var fileName = req.params.fileName;
  var tmp;
  var update;
  var query = {_id: 1024};
  console.log('start download ' + fileName);
  if(fileName.indexOf('.apk') > -1) {
    tmp = '../public/archives/latest/android/';
    update = {$inc:{total_download:1, android_downlaod:1}};
  } else if(fileName.indexOf('.ipa') > -1){
    tmp = '../public/archives/latest/ios/';
    update = {$inc:{total_download:1, ios_downlaod:1}};
  }

 MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbase = db.db("presdt");
  dbase.collection("pv_statistics").findOneAndUpdate(query, update,function(err, result) {
     if (err) throw err;
     db.close();
   });
  });


  var filePath = path.join(__dirname, tmp + fileName);
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
            platform = 'Android';
            iconUrl = '/images/ic_android_release.png';
            downloadUrl = '/' + path.basename(file);
            andrReleaseUrl = '/' + path.basename(file);
            version = '6.5.34';
          } else if (path.basename(file).indexOf('debug.apk')!=-1) {
            type = 'debug';
            platform = 'Android';
            iconUrl = '/images/ic_android_debug.png';
            downloadUrl = '/' + path.basename(file);
            version = '6.5.31';
          } else if (path.basename(file).indexOf('ipa')!=-1){
            type = 'release';
            platform = 'iOS';
            iconUrl = '/images/ic_android_release.png';
            downloadUrl = 'itms-services://?action=download-manifest&url=https://sdt.seedland.cc/manifest.plist';
            iosReleaseUrl = 'itms-services://?action=download-manifest&url=https://sdt.seedland.cc/manifest.plist';
            version = '6.25';
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
