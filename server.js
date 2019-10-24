const express = require('express');
const multer = require('multer');
const dotenv = require('dotenv');
const app = express();

dotenv.config();

const port = process.env.SERVER_PORT;

// SET STORAGE
let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  fileName: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now());
  }
});

const upload = multer(storage);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/uploadFile', upload.single('myFile'), (req, res, next) => {
  const file = req.file;
  if (!file) {
    const error = new Error('Please upload a file');
    error.httpStatusCode = 400;
    return next(error);
  }

  res.send(file);
});

app.post('/uploadFiles', upload.array('myFiles', 12), (req, res, next) => {
  const files = req.files;
  if (!files) {
    const error = new Error('Please upload files');
    error.httpStatusCode = 400;
    return next(error);
  }

  res.send(files);
});

app.listen(port, () => {
  console.log('Example app listening on port !', port);
});

//Run app, then load http://localhost:port in a browser to see the output.
