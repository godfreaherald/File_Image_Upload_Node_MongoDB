const express = require('express');
const multer = require('multer');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const dbConfig = require('./config');
const MongoClient = require('mongodb').MongoClient;
ObjectId = require('mongodb').ObjectId;
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

const upload = multer({ storage });

MongoClient.connect(dbConfig.URI, (err, client) => {
  if (err) return console.log(err);
  db = client.db('test');

  console.log('mongoDB connected ');
});

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

app.post('/uploadPhoto', upload.single('picture'), (req, res) => {
  var img = fs.readFileSync(req.file.path);
  var encode_image = img.toString('base64');
  // Define a JSONobject for the image attributes for saving to database

  var finalImg = {
    contentType: req.file.mimetype,
    image: new Buffer(encode_image, 'base64')
  };
  db.collection('quotes').insertOne(finalImg, (err, result) => {
    console.log(result);

    if (err) return console.log(err);

    console.log('saved to database');
    res.redirect('/');
  });
});

app.get('/photos', (req, res) => {
  db.collection('quotes')
    .find()
    .toArray((err, result) => {
      const imgArray = result.map(element => element._id);
      if (err) console.log(err);
      res.send(imgArray);
    });
});

app.get('/photo/:id', (req, res) => {
  db.collection('quotes').findOne(
    { _id: ObjectId(req.params.id) },
    (err, result) => {
      if (err) console.log(err);
      res.contentType('image/jpeg');
      res.send(result.image.buffer);
    }
  );
});

// define a route to download a file
app.get('/download/:file(*)', (req, res) => {
  var file = req.params.file;
  var fileLocation = path.join('./uploads', file);
  console.log(fileLocation);
  res.download(fileLocation, file);
});

app.listen(port, () => {
  console.log('Example app listening on port !', port);
});

//Run app, then load http://localhost:port in a browser to see the output.
