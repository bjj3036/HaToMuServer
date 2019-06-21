const twitchAPI = require('twitch-api-v5');
const twitchConfig = require('../config/twitchConfig');
const StreamerModel = require('../models/userModel'); // mongoose model

let api = {
    getAccessToken: function (code, cb) {
        twitchAPI.clientID = twitchConfig.streamer.clientID
        twitchAPI.auth.getAccessToken({
            clientSecret: twitchConfig.streamer.clientSecret,
            redirectURI: twitchConfig.streamer.redirectURI,
            code: code
        }, function (err, res) {
            if (err) {
                return cb({
                    status: 500,
                    message: 'Failed Get Access Token',
                    data: err
                })
            } else {
                return cb({
                    status: 200,
                    message: 'Success Get Access Token',
                    data: res
                })
            }
        })
    },
    getStreamerInfo: function (token, cb) {
        twitchAPI.clientID = twitchConfig.streamer.clientID
        twitchAPI.channels.channel({ auth: token }, function (err, res) {
            if (err) {
                cb({
                    status: 500,
                    message: 'Find Streamer by Access Token Error',
                    data: err
                })
            }
            else {
                StreamerModel.findOne({ channelId: res._id }, function (err, streamer) {
                    if (err)
                        return cb({
                            status: 500,
                            message: 'Mongo DB Error',
                            data: err
                        })
                    let userInfo = {}
                    userInfo.token = token
                    userInfo.url = res.url
                    userInfo.token = token
                    userInfo.channelId = res._id
                    userInfo.name = res.name
                    userInfo.display_name = res.display_name
                    userInfo.logo = res.logo
                    userInfo.profile_banner = res.profile_banner
                    userInfo.description = res.description
                    if (!streamer) {
                        let streamer2 = new StreamerModel(userInfo)
                        streamer2.save(function (err, streamer) {
                            if (err)
                                return cb({
                                    status: 500,
                                    message: 'Mongo DB Error',
                                    data: err
                                })
                            return cb({
                                status: 200,
                                message: 'New HaToMu Streamer',
                                data: userInfo
                            })
                        })
                    } else {
                        StreamerModel.updateOne({ channelId: res._id }, {
                            $set: {
                                name: res.name,
                                display_name: res.display_name,
                                logo: res.logo,
                                token: token,
                                profile_banner: res.profile_banner,
                                description: res.description
                            }
                        }, function (err) {
                            if (err)
                                return cb({
                                    status: 500,
                                    message: 'Mongo DB Error',
                                    data: err
                                })
                            return cb({
                                status: 200,
                                message: 'Update User Info',
                                data: userInfo
                            })
                        })
                    }
                })
            }
        })
    },
    getStreamerInfoById: function (channelId, cb) {
        StreamerModel.findOne({ channelId: channelId }).populate({ path: 'posts', select: 'images', options: { sort: { index: -1 } } }).exec(function (err, result) {
            if (err)
                return cb({
                    status: 500,
                    message: 'Mongo DB Error',
                    data: err
                })
            return cb({
                status: 200,
                message: 'Find Streamer by Channel Id',
                data: result
            })
        })
    },
    getStreamerInfoByToken: function(token, cb){
        StreamerModel.findByToken(token).exec(function(err, result){
            cb(result)
        })
    }
};

module.exports = api;