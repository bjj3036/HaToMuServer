const twitchAPI = require('twitch-api-v5');
const twitchConfig = require('../config/twitchConfig');
const UserModel = require('../models/userModel'); // mongoose model
const PostModel = require('../models/postModel');

let api = {
    getAccessToken: (code, cb) => {
        twitchAPI.auth.getAccessToken({
            clientSecret: twitchConfig.clientSecret,
            redirectURI: twitchConfig.redirectURI,
            code: code
        }, (err, res) => {
            if (err) {
                cb({
                    status: false,
                    message: 'Failed Get Access Token',
                    data: err
                })
            } else {
                cb({
                    status: true,
                    message: 'Success Get Access Token',
                    data: res
                })
            }
        })
    },
    getUserInfo: (token, cb) => {
        twitchAPI.users.user({ auth: token }, (err, res) => {
            if (res)
                twitchAPI.channels.channelByID({ channelID: res._id }, (err, res2) => {
                    UserModel.findOneAndUpdate({ _id: res2._id }, { ...res2, token }, { upsert: true, new: true }, (err, result) => {
                        if (result) {
                            return cb({
                                status: true,
                                message: 'Find User by Access Token',
                                data: result
                            })
                        }
                    })
                })
        })
    },
    getUserInfoById: (userId, cb) => {
        UserModel.findOne({ _id: userId }).exec(async (err, user) => {
            let posts = await PostModel.find({writer: user._id}).select('images').sort({index: -1}).exec()
            user.set('posts', posts, {strict: false})
            cb({
                status: true,
                message: '사용자 검색',
                data: user
            })
        })
    }
};

module.exports = api;