var express = require('express');
var router = express.Router();
var multer = require('multer');
var bodyParser=require('body-parser');

/* GET home page. */
router.get('/', require('connect-ensure-login').ensureLoggedIn(), function(req, res, next) {	
  res.render('management', { title: '管理' });
});

var uploadDir='./public/archives/latest/android/';

//设置multer upload
var upload=multer({dest:uploadDir}).array('images');

//post请求 提交表单
router.post('/',function(req,res,next){
    //多个文件上传
    upload(req,res,function(err){
        if(err){
            console.error('[System] '+err.message);
        }else{
            //循环处理
            var fileCount=req.files.length;
             req.files.forEach(function(i){
                 //设置存储的文件路径
                 var uploadFilePath=uploadDir+i.originalname;
                 //获取临时文件的存储路径
                 var uploadTmpPath=i.path;
                 //读取临时文件
                 fs.readFile(uploadTmpPath,function(err,data){
                     if(err){
                         console.error('[System] '+err.message);
                     }else{
                         //读取成功将内容写入到上传的路径中，文件名为上面构造的文件名
                         fs.writeFile(uploadFilePath,data,function(err){
                             if(err){
                                 console.error('[System] '+err.message);
                             }else{
                                 //写入成功,删除临时文件
                                 fs.unlink(uploadTmpPath,function(err){
                                     if(err){
                                         console.error('[System] '+err.message);
                                     }else{
                                         console.log('[System] '+'Delete '+uploadTmpPath+' successfully!');
                                     }
                                 });
                             }
                         });
                     }
                 });
            });

            //所有文件上传成功
            //回复信息
            var reponse={
                message:'File uploaded successfully',
            };
            //返回
            res.end(JSON.stringify(reponse));
        }
    });
});

module.exports = router;
