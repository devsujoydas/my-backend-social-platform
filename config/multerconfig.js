// i found this code from multer npm documentation
// website-links: https://www.npmjs.com/package/multer 


const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
// diskstorage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // img folder path
        cb(null, './public/images/uploads')
    },
    // create unique file name
    filename: function (req, file, cb) {
        crypto.randomBytes(12, (err, name) => {
            const fn = name.toString("hex") + path.extname(file.originalname)
            cb(null, fn)
        })
    }
})

const upload = multer({ storage: storage })

module.exports = upload;


