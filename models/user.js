const mongoose = require('mongoose');

mongoose.connect(`mongodb://127.0.0.1:27017/mini-p1-data-association`)


const userSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    username: String,
    profilepic: {
        type: String,
        default: "default.jpg"
    },
    phone: Number,
    email: String,
    password: String,
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "post" }]
})

module.exports = mongoose.model("user", userSchema)




