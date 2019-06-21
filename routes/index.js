const express = require('express');
const router = express.Router();
const twitchAPI = require('twitch-api-v5');
const multer = require('multer');

let storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'tmp/upload');
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

/* GET home page. */
router.get('/', function (req, res, next) {
  res.send(req.session.token)
});

router.get('/test', function (req, res) {
  res.send(req.session.token)
})

router.post('/upload', multer({storage: storage}).single('myfile'), function(req, res){
  req.file.test = req.body.test
  res.send(req.file)
})

router.get('/saveSession/:value', function(req, res){
  req.session.sessionValue = req.params.value
  res.send(req.params.value)
})

router.get('/getSessionValue', function(req, res){
  res.send(req.session.sessionValue)
})

router.get('/hello', function(req, res){
  res.send('Hello, World!')
})

module.exports = router;