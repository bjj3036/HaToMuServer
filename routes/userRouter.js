let express = require('express');
let router = express.Router();
let userAPI = require('../api/userAPI');
let twitchConfig = require('../config/twitchConfig');
const UserModel = require('../models/userModel');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.get('/login', function (req, res) {
  res.redirect(twitchConfig.authAddress)
});

router.get('/redirect', function (req, res) {
  if (!req.query.code)
    res.status(404).render('LoginTemplate', {
      data: JSON.stringify({
        status: 404,
        message: 'Required code',
        data: null
      })
    })
  else {
    userAPI.getAccessToken(req.query.code, function (response) {
      if (!response.data)
        res.render('LoginTemplate', { data: JSON.stringify(response) })
      else {
        //저장 성공
        req.session.access_token = response.data.access_token
        userAPI.getUserInfo(response.data.access_token, function (response) {
          res.render('LoginTemplate', { data: JSON.stringify(response) })
        })
      }
    })
  }
})

router.get('/search', function (req, res) {
  if(!req.query.q)
    return res.json({
      status: false,
      message: '사용자 검색 결과',
      data: []
    })
  const query = new RegExp(req.query.q);
  UserModel.find({ $or: [{ name: { $regex: query } }, { display_name: { $regex: query } }] }).select('name display_name logo').exec((err, result) => {
    res.json({
      status: true,
      message: '사용자 검색 결과',
      data: result
    })
  })
})

router.get('/getInfoById/:userId', function (req, res) {
  userAPI.getUserInfoById(req.params.userId, function (response) {
    res.send(response)
  })
})


module.exports = router;
