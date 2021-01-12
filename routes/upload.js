const express = require('express');
const router = express.Router();
const path = require('path')
const multer = require('multer')
const convertToPdf = require('../src/convert');
const createHttpError = require('http-errors');
const fs = require('fs')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + makeid(5) + '-' + Date.now() + path.extname(file.originalname));
  }
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10000000
  },
  fileFilter(req, file, cb) {
    checkFileType(file, cb);
  }
})
const imageUpload = upload.array('images', 20);
router.post('/', imageUpload, async function (req, res, next) {
  try {
    const fileNames = req.files.map(file => file.filename)
    const imageids = req.body.imageids
    const remotevalues = req.body.remotevalues


    if (!imageids) {
      return next(createHttpError.BadRequest("Please include image ids"))
    }
    if (!remotevalues) {
      return next(createHttpError.BadRequest(`Please include remote value, use 'none' as default`))
    }

    if (imageids.length != remotevalues.length) {
      return next(createHttpError.BadRequest('Image ids and remote values should have equal length'))
    }


    const mainFileNames = []

    const remoteValueIDPair = []
    let fileNameCounter = 0;
    for (let x = 0; x < imageids.length; x++) {
      const imageid = imageids[x]
      let remoteval = remotevalues[x];

      if (remoteval === 'none') {
        if (fileNameCounter < fileNames.length) {
          remoteval = fileNames[fileNameCounter]
          fileNameCounter++
        }
      }

      const imageRemoteVal = {}
      imageRemoteVal[imageid] = remoteval
      remoteValueIDPair.push(imageRemoteVal)
      mainFileNames.push(remoteval)

    }

    const fileExistenceResult = await doAllFilesExist(mainFileNames);
    const mDoAllFileExists = fileExistenceResult.filter(r => r === false).length < 1;

    if(!mDoAllFileExists){
      return next(createHttpError.BadRequest('Your files does not exists on the server, Refresh and try again'))
    }

      console.log("Do all Files exists", mDoAllFileExists);

    const pathUrl = '/pdfs' + "/convertjpegtopdf-" + makeid(5) + Date.now() + '.pdf'
    convertToPdf(mainFileNames, pathUrl)
      .then()
      .catch((error) => {
        console.log(error);
      })
    return res.json({ wait: pathUrl, idremotevaluepair: remoteValueIDPair })

  }
  catch (error) {
    next(error)
  }
});

function checkFileType(file, cb) {

  // Allowed ext
  const filetypes = /jpeg|jpg|png/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  //console.log(file);
  //console.log({ mimetype, extname });
  if (mimetype) {
    //console.log("No error");
    return cb(null, true);
  } else {
    console.log("There is error");
    cb(createHttpError.BadRequest('Invalid file type'));
  }
}
function makeid(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
const doAllFilesExist = async (fileNames) => {
  const promisesList = []
  for (const fileName of fileNames) {
    promisesList.push(checkFileExists(fileName))
  }
  return Promise.all(promisesList)
}

const checkFileExists = async (fileName) => {
  const filePath = path.join(__dirname, '..', '/public/images', fileName);
  return fs.promises.access(filePath, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false)
}

module.exports = router;
