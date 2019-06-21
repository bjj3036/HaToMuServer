const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const Schema = mongoose.Schema;

let postSchema = new Schema({
    user: { type: String, ref: 'User' },
    post: { type: Schema.Types.ObjectId, ref: 'Post' },
});

module.exports = mongoose.model('Like', postSchema);
