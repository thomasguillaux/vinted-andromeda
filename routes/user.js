const express = require("express");
const router = express.Router();
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");
const cloudinary = require("cloudinary").v2;

const User = require("../models/User");
const Offer = require("../models/Offer");
const Payment = require("../models/Payment");

router.post("/user/signup", async (req, res) => {

   try {

    const user = await User.findOne({ email: req.fields.email });
    
    const password = req.fields.password;
    const salt = uid2(64);
    const hash = SHA256(password + salt).toString(encBase64);
    const token = uid2(64);

    if (!user) {

        if (req.fields.email && req.fields.username && req.fields.password) {

            const newUser = new User({

                email: req.fields.email,
                account: {
                    username: req.fields.username,
                    phone: req.fields.phone,
                },
                token: token,
                salt: salt,
                hash: hash,
            });

        // Send picture to Cloudinary
        const avatarToUpload = await cloudinary.uploader.upload(req.files.avatar.path, {
        folder: `/vinted/users/${newUser._id}`
        });

        // Add the upload result to newUser
        newUser.avatar = avatarToUpload;
    
            await newUser.save();
    
            res.json({
                _id: newUser._id,
                token: newUser.token,
                account: {
                    username: newUser.account.username,
                    phone: newUser.account.phone,
                    avatar: avatarToUpload
                }
            });
     } else {
        res.status(400).json({ message: "Missing parameters" });
     }
    } else {
        res.status(400).json({ message: "User already exists" });
    };
       
   } catch (error) {
       res.status(404).json({ error: error.message})
   }
});

router.post("/user/login", async (req, res) => {
    
    try {

        const userToLog = await User.findOne({ email: req.fields.email });

        if (userToLog) {
            
            // const userToLog = await User.findOne({ email: req.fields.email });
            const userPassword = req.fields.password;
            const salt = userToLog.salt;
            const hash = SHA256(userPassword + salt).toString(encBase64);
            
            if (userToLog.hash === hash) {
                res.json({
                    _id: userToLog._id,
                    token: userToLog.token,
                    account: {
                        username: userToLog.account.username,
                        phone: userToLog.account.phone,
                    }
                });
            } else {
                res.json("Invalid email or password, please try again")
            }  
        } else {
            res.status(401).json({ message: "Unauthorized" });
          } 
    }
        catch (error) {
            res.status(404).json({ error: error.message})
    }
})

module.exports = router;