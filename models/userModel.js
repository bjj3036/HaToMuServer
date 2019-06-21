const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let userSchema = new Schema({
    _id: { type: String, required: true, unique: true },
    token: String,
    description: String,
    name: { type: String, required: true, index: true },
    display_name: String,
    logo: String,
    profile_banner: String,
    url: String
});

userSchema.statics.findByToken = function(token){
    return this.findOne({token})
}

module.exports = mongoose.model('User', userSchema);