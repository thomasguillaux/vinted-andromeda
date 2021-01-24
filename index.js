// Ref to packages

const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
const cors = require("cors");
const cloudinary = require("cloudinary");
require('dotenv').config();

const app = express();
app.use(formidable());
app.use(cors());

// Import of models

const userRoutes = require("./routes/user");
const offerRoutes = require("./routes/offer")
app.use(userRoutes);
app.use(offerRoutes);

// Connection to DB

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
});

// Connection to Cloudinary 

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
  });

app.get("/", (req, res) => {
    res.status(200).json("Welcome at Vinted")
});

app.all("*", (req, res) => {
    res.status(404).json({ message: "This route doesn't exist"})
});

app.listen(process.env.PORT, () => {
    console.log("Server started");
});