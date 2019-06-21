const PostModel = require('../models/postModel');
const LikeModel = require('../models/likeModel');

let api = {
    findPosts: function (lastIndex, userId, cb) {
        let message;
        if (lastIndex == 0) {
            lastIndex = Number.MAX_SAFE_INTEGER
            message = 'Find Posts from latest'
        }
        else
            message = 'Find Posts from ' + lastIndex
        PostModel.find({})
            .populate({ path: 'writer', select: 'channelId display_name logo url' })
            .where('index')
            .lt(lastIndex)
            .sort({ index: -1 })
            .limit(5)
            .exec(async (err, posts) => {
                if (err)
                    return cb({
                        status: false,
                        message: 'MongoDB error',
                        data: err
                    })
                if (!posts)
                    return cb({
                        status: false,
                        message: 'Can not find Post',
                        data: null
                    })
                let postArr = posts.map(async e => {
                    let count = await LikeModel.countDocuments({ post: e._id }).exec()
                    let isLiked = await LikeModel.findOne({ post: e._id, user: userId }).then() ? true : false
                    e.set('likeCnt', count, { strict: false })
                    e.set('isLiked', isLiked, { strict: false })
                    return e
                })
                await Promise.all(postArr)
                cb({
                    status: true,
                    message: message,
                    data: posts
                })
            })
    },
    findPost: function (postId, userId, cb) {
        PostModel.findOne({ _id: postId })
            .populate({ path: 'writer', select: 'channelId display_name logo url' })
            .exec(async (err, post) => {
                if (err)
                    return cb({
                        status: false,
                        message: 'MongoDB error',
                        data: err
                    })
                if (!post)
                    return cb({
                        status: false,
                        message: 'Can not find Post',
                        data: null
                    })
                let count = await LikeModel.countDocuments({ post: post._id }).exec()
                let isLiked = await LikeModel.findOne({ post: post._id, user: userId }).then() ? true : false
                post.set('likeCnt', count, { strict: false })
                post.set('isLiked', isLiked, { strict: false })
                cb({
                    status: true,
                    message: 'Find Post',
                    data: post
                })
            })
    },
    likePost: (postId, user, cb) => {
        const likeInfo = { post: postId, user: user._id }
        LikeModel.findOne(likeInfo, (err, result) => {
            if (result) {
                LikeModel.findOneAndDelete(likeInfo).exec((err, result) => {
                    return cb({
                        status: true,
                        message: '좋아요를 취소하였습니다',
                        data: false
                    })
                })
            }
            else {
                let like = new LikeModel(likeInfo)
                like.save().then((err, result) => {
                    return cb({
                        status: true,
                        message: '좋아요를 표시하였습니다',
                        data: true
                    })
                })
            }
        })
    },
    removePost: (postId, userId, cb) => {
        PostModel.findOneAndDelete({ post: postId, writer: userId }).exec((err, result) => {
            if (err)
                return cb({
                    status: false,
                    message: '알 수 없는 오류'
                })
            if (!result)
                return cb({
                    status: false,
                    message: '게시물을 삭제할 수 없습니다',
                    data: false
                })
            cb({
                status: true,
                message: '게시물을 삭제하였습니다',
                data: true
            })
        })
    }
}

function copyObject(o) {
    if (typeof o === 'object')
        return eval('(' + JSON.stringify(o) + ')')
    return {}
}

module.exports = api