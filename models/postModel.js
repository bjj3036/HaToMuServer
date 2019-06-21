const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const Schema = mongoose.Schema;

let postSchema = new Schema({
    writer: { type: String, ref: 'User' },
    content: String,
    images: [String],
    written: Number,
    modified: Number
});

postSchema.plugin(autoIncrement.plugin, {
    model: 'Post',
    field: 'index'
})

module.exports = mongoose.model('Post', postSchema);
