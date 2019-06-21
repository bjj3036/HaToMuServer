const twitchAPI = require('twitch-api-v5');
const twitchConfig = require('../config/twitchConfig');
const ViewerModel = require('../models/viewerModel');

let api = {
    getAccessToken: function (code, cb) {
        twitchAPI.clientID = twitchConfig.viewer.clientID
        twitchAPI.auth.getAccessToken({
            clientSecret: twitchConfig.viewer.clientSecret,
            redirectURI: twitchConfig.viewer.redirectURI,
            code: code
        }, function (err, res) {
            if (err) {
                cb({
                    status: 500,
                    message: 'Failed Get Access Token',
                    data: err
                })
            } else {
                cb({
                    status: 200,
                    message: 'Success Get Access Token',
                    data: res
                })
            }
        })
    },
    getViewerInfo: function (token, cb) {
        twitchAPI.clientID = twitchConfig.viewer.clientID
        twitchAPI.users.user({ auth: token }, function (err, res) {
            if (err) {
                cb({
                    status: 500,
                    message: 'Find User by Access Token Error',
                    data: err
                })
            }
            else {
            }
        })
    },
    getViewerInfoById: function (id, cb) {
        twitchAPI.clientID = twitchConfig.viewer.clientID
        twitchAPI.users.userByID({ userID: id }, function (err, res) {
            if (err)
                cb({
                    status: 500,
                    message: 'Can not found Viewer By Id',
                    data: err
                })
            else{}
        })
    }
};

module.exports = api;