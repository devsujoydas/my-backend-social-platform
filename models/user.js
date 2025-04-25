const mongoose = require('mongoose');

mongoose.connect(`mongodb://127.0.0.1:27017/miniauthproject`)


const userSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    username: String,
    image: String,
    phone: Number,
    email: String,
    password: String,
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "post" }]
})

module.exports = mongoose.model("user", userSchema)




