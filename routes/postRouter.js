const express = require('express');
const router = express.Router();
const PostModel = require('../models/postModel');
const PostApi = require('../api/postAPI');
const UserModel = require('../models/userModel');
const LikeModel = require('../models/likeModel');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('file-system');
const uuid = require('uuid/v1');
const sizeOf = require('image-size');
const serverUrl = 'http://hatomu.kro.kr:3000/';

//multer storage
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let now = new Date()
        let path
        if (req.user)
            path = `postImage/${req.user.name}/${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`
        else
            path = 'postImage/error'
        //resize폴더랑 original폴더 생성
        fs.mkdir(path + '/resize600')
        fs.mkdir(path, { recursive: true }, function (err) {
            cb(null, path)
        })
    },
    filename: function (req, file, cb) {
        console.log(file)
        cb(null, uuid() + regExp_replace(file.originalname))
    }
})

router.post('/upload', multer({ storage: storage, limits: { fieldSize: 25 * 1024 * 1024 } }).array('postImage'), (req, res) => {
    if (!req.user)
        return res.status(404).send('404 사용자를 찾을 수 없습니다.')
    let post = new PostModel()
    post.writer = req.user._id
    post.content = req.body.content
    post.images = []
    req.files.forEach(e => {
        //multer로 저장된 path와 리사이즈 할 path
        let path = e.destination + '/' + e.filename
        let resizePath = e.destination + '/resize600/' + e.filename
        //image-size npm, 이미지 크기 불러오기
        let dimension = sizeOf(path)
        //resize될 가로
        let resizeWidth = 600
        //600보다 클 때만 resize
        if (dimension.width > resizeWidth) {
            let resizeHeight = parseInt(dimension.height * (resizeWidth / dimension.width))
            const readStream = fs.createReadStream(path)
            const writeStream = fs.createWriteStream(resizePath)
            const transformer = sharp().resize(resizeWidth, resizeHeight).withMetadata()
            readStream.pipe(transformer).pipe(writeStream)
            post.images.push(serverUrl + resizePath)
        } else {
            post.images.push(serverUrl + path)
        }
    })
    post.written = new Date().getTime()
    post.modified = new Date().getTime()
    post.save((err, post2) => {
        post2.populate('writer').execPopulate().then((post3) => {
            res.json({
                status: true,
                message: '성공적으로 작성하였습니다',
                data: post3
            })
        })
    })
})

router.get('/load/:lastIndex', function (req, res) {
    const loadPostFunc = function (id) {
        PostApi.findPosts(req.params.lastIndex, id, function (response) {
            res.json(response)
        })
    }
    loadPostFunc(req.user && req.user._id)
})

router.get('/loadOne/:postId', function (req, res) {
    PostApi.findPost(req.params.postId, req.user && req.user._id, function (response) {
        res.json(response)
    })
})

router.put('/like/:postId', function (req, res) {
    if (!req.user)
        return res.status(404).send('404 사용자를 찾을 수 없습니다.')
    PostApi.likePost(req.params.postId, req.user, (response) => {
        res.json(response)
    })
})

router.get('/getTopIndex', function (req, res) {
    PostModel.findOne({}).sort({ index: -1 }).exec(function (err, post) {
        if (err)
            return res.status(500).json({
                status: 500,
                message: 'Mongo DB error',
                data: err
            })
        if (!post)
            return res.status(404).json({
                status: 404,
                message: 'Post Not Exists',
                data: null
            })
        return res.json({
            status: 200,
            message: 'Top Index of Posts',
            data: post.index
        })
    });
})

router.delete('/remove/:postId', (req, res) => {
    if (!req.user)
        return res.status(404).send('404 사용자를 찾을 수 없습니다.')
    PostApi.removePost(req.param.postId, req.user._id, (response) => res.json(response))
})

//특수문자 없애기
function regExp_replace(str) {
    var regExp = /[\{\}\[\]\/?,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi;
    return str.replace(regExp, "");
}

module.exports = router;