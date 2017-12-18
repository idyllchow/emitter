var express = require('express');
var router = express.Router();
var path = require("path");
const fs = require('fs');
var qr = require('qr-image');
// var mongo = require("mongodb");
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/webapp";

var andrReCount = 0;
var andrDeDount = 0;
var iosCount = 0;

var stats = {
  downloadAndr : 0,
  downloadiOS : 0,
  pv : 0
};

/* 显示服务器文件. */
router.get('/', function(req, res, next) {
  // 显示服务器文件 
  // 文件目录 
  var androidPath = path.join(__dirname, '../archives/android/');
  var iosPath = path.join(__dirname, '../archives/ios/');
  
  var androidArchives = [];
  var iosArchives = [];

  // walk(filePath, function(err, results) {
  //   if (err) throw err;
  //   console.log(results);
  //   if(results.length>0) {
  //    res.render('download.html', {title:"实地通发布平台", android_archives:results});
  //  } else {
  //    res.end('当前目录下没有文件');
  //  }
  // });
  walk(androidPath, function(err, androidResults) {
    if (err) throw err;
    if(androidResults.length>0) {
      // androidArchives = results;
      // res.render('download.html', {title:"实地通发布平台", androidArchives:androidArchives, iosArchives:iosArchives});
    } 

    walk(iosPath, function(err, iosResults) {
      if (err) throw err;
      if(iosResults.length>0) {
        res.render('download.html', {title:"实地通发布平台", androidArchives:androidResults, iosArchives:iosResults});
      } 
    });
  });
  
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
          var platform;
          var downloadCount;
          var version;
          console.log('birth time: ' + stat.birthtime);
          // 修改时间, Date对象:
          console.log('modified time: ' + stat.mtime);
          if (path.basename(file).indexOf('release')!=-1) {
            type = 'release';
            platform = 'Android';
            iconUrl = '/images/ic_android_release.png';
            downloadCount = andrReCount;
            linkUrl = '/download/' + path.basename(file);
            version = '6.5.32';
          } else if (path.basename(file).indexOf('debug')!=-1) {
            type = 'debug';
            platform = 'Android';
            iconUrl = '/images/ic_android_debug.png';
            downloadCount = andrDeCount;
            linkUrl = '/download/' + path.basename(file);
            version = '6.5.32';
          } else {
            type = 'release';
            platform = 'ios';
            iconUrl = '/images/ic_android_release.png';
            downloadCount = iosCount;
            linkUrl = 'itms-services://?action=download-manifest&url=https://raw.githubusercontent.com/seedland-oa/OA/master/manifest.plist';
            version = '6.20';
          }
          var result = {
            platform: platform,
            type:type,
            name: path.basename(file),
            time: stat.birthtime,
            img: iconUrl,
            linkUrl: linkUrl,
            downloadCount: downloadCount,
            version: version
          };
          results.push(result);
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

/** 创建二维码*/
router.get('/create_qrcode', function (req, res, next) {
    var text = req.query.text;
    try {
        var img = qr.image(text,{size :10});
        res.writeHead(200, {'Content-Type': 'image/png'});
        console.log('create image');
        img.pipe(res);
    } catch (e) {
        res.writeHead(414, {'Content-Type': 'text/html'});
        res.end('<h1>414 Request-URI Too Large</h1>');
    }
})

/** 实现文件下载. */
router.get('/:fileName', function(req, res, next) {
  // 实现文件下载 
  var fileName = req.params.fileName;
  var tmp;
  if(fileName.indexOf('release.apk') > -1) {
    tmp = '../archives/android/release/';
  } else if (fileName.indexOf('debug.apk')) {
    tmp = '../archives/android/debug/';
  }
  var filePath = path.join(__dirname, tmp + fileName);
  var stats = fs.statSync(filePath); 
  var mineFile =  __dirname + '/upload-folder/dramaticpenguin.MOV';
  if(stats.isFile()){
    res.set({
      'Content-Type': 'application/octet-stream',
      // 'Content-type': 'application/vnd.android.package-archive',
      'Content-Disposition': 'attachment; filename='+fileName,
      'Content-Length': stats.size
    });
    res.setHeader("Access-Control-Allow-Origin", "*");
    fs.createReadStream(filePath).pipe(res);
    andrReCount = andrReCounts + 1;
  } else {
    res.end(404);
  } 
});


// MongoClient.connect(url, function(err, db) {
//   if (err) throw err;
//   // var record = {_id:1024, pv: 0, total_download: 0, android_download: 0, ios_download: 0 };
//   // db.collection("web_statistics").insertOne(record, function(err, res) {
//   //   if (err) throw err;
//   //   console.log("1 document created!");
//   //   db.close();
//   // });
//   var query = {_id: 1024};
//   var dbase = db.admin();
//   dbase.collection("web_statistics").updateOne(query, {$inc:{pv:1}},function(err, result) {
//     if (err) throw err;
//     db.close();
//   });

//    db.collection("web_statistics").find(query).toArray(function(err, result) {
//     if (err) throw err;
//     console.log('query result: \n' + result);
//     console.log('ios_download: ' + result[0].ios_download + '\n');
//     console.log('android_download: ' + result[0].android_download + '\n');
//     console.log('total_download: ' + result[0].total_download + '\n');
//     console.log('pv: ' + result[0].pv + '\n');
//     db.close();
//   });
// });

module.exports = router;
