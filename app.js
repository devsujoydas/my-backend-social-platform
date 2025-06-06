const express = require('express');
const path = require('path');

const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userModel = require('./models/user');
const postModel = require('./models/post');
const upload = require('./config/multerconfig');

const app = express()
const port = process.env.PORT || 5000;

app.set("view engine", "ejs");

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "public")))


// all get and render pages
app.get("/", async (req, res) => {
    res.render("index")
})

app.get("/signup", (req, res) => {
    res.render("signup")
})

app.get("/login", (req, res) => {
    res.render("login")
})

app.get("/profile", isLoggedIn, async (req, res) => {
    let user = await userModel.findOne({ email: req.user.email }).populate("posts");
    res.render("profile", { user })
})

app.get("/like/:id", isLoggedIn, async (req, res) => {
    let post = await postModel.findOne({ _id: req.params.id }).populate("user");
    let userId = req.user.userid;
    if (post.likes.indexOf(userId) === -1) { post.likes.push(userId) }
    else { post.likes.splice(post.likes.indexOf(userId), 1) }
    await post.save();
    res.redirect("/profile")
})

app.get("/edit/:id", isLoggedIn, async (req, res) => {
    let post = await postModel.findOne({ _id: req.params.id }).populate("user");
    res.render("postEdit", { post })
})

app.get("/profile/upload", (req, res) => {
    res.render("profileupload")
})

app.post("/uploadpp", isLoggedIn, upload.single("image"), async (req, res) => {
    let user = await userModel.findOne({ email: req.user.email })
    user.profilepic = req.file.filename;
    await user.save();
    res.redirect("/profile")
})



app.post("/register", async (req, res) => {
    let { firstName, lastName, username, phone, email, password } = req.body;

    let userEmail = await userModel.findOne({ email })
    if (userEmail) return res.status(500).send("User already Registered");

    let userName = await userModel.findOne({ username })
    if (userName) return res.send("This Username is already taken");

    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, async (err, hash) => {
            let createdUser = await userModel.create({
                firstName, lastName, username, phone, email, password: hash
            })
            res.redirect("/login")
        })
    })
})

app.post("/login", async (req, res) => {
    let { email, password } = req.body;

    let user = await userModel.findOne({ email })
    if (!user) return res.status(500).send("Something is Wrong");

    bcrypt.compare(password, user.password, async (err, result) => {
        if (result) {
            let token = jwt.sign({ email, userid: user._id }, "secretekey")
            res.cookie("token", token)
            res.status(200).redirect("/profile")
        }
        else {
            res.status(400).send("Something is wrong")
        }
    })
})

app.post("/logout", (req, res) => {
    res.cookie("token", "")
    res.redirect("/login")
})



app.post("/post", isLoggedIn, async (req, res) => {
    let { postImage, content } = req.body;
    let user = await userModel.findOne({ email: req.user.email })
    let post = await postModel.create({
        user: user._id,
        postImage,
        content
    })
    user.posts.push(post._id);
    await user.save();
    res.redirect("/profile")
})



app.post("/update/:id", isLoggedIn, async (req, res) => {
    let { content } = req.body;
    let post = await postModel.findOneAndUpdate({ _id: req.params.id }, { content: content })

    res.redirect("/profile")
})

function isLoggedIn(req, res, next) {
    if (req.cookies.token === "") {
        res.redirect("/login")
    }
    else {
        let data = jwt.verify(req.cookies.token, "secretekey")
        req.user = data;
        next()
    }
}

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`)
})