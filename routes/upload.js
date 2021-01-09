const express = require('express');
const router = express.Router();
const path = require('path')
const multer= require('multer')
const convertToPdf = require('../src/convert')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images')
    },
    filename: function(req, file, cb){
        cb(null,file.fieldname +'-'+makeid(5)+ '-' + Date.now() + path.extname(file.originalname));
      }
  })

const upload = multer({
    storage: storage,
    limit: {
        fileSize: 10000000
    },
    fileFilter(req, file, cb){
        checkFileType(file, cb);
    }
})
const imageUpload = upload.array('images', 20);
router.post('/', imageUpload,  async function(req, res, next) {
    try{
    const fileNames = req.files.map(file => file.filename)
    console.log(fileNames);
    const returnPath = await convertToPdf(fileNames)
    console.log("Done -------------- DONE");
    return res.json({url: returnPath})
    }
    catch(error){
        return res.json({error: error.message})
    }
});

function checkFileType(file, cb){
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);
  
    if(mimetype && extname){
      return cb(null,true);
    } else {
      cb('Error: Images Only!');
    }
  }
  function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }

module.exports = router;
