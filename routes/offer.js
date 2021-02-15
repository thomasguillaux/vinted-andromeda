const express = require ("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const isAuthenticated = require("../middleware/isAuthenticated");

const User = require("../models/User");
const Offer = require("../models/Offer");

router.post("/offer/publish", isAuthenticated, async (req, res) => {

    try {
        
        // Destructuring all fields in req
        const {title, description, price, size, brand, condition,city, color,} = req.fields

        // Create a new offer
        const newOffer = new Offer({
            product_name: title,
            product_description: description,
            product_price: price,
            product_details: [
              {
                MARQUE: brand,
              },
              {
                TAILLE: size,
              },
              {
                ÉTAT: condition,
              },
              {
                COULEUR: color,
              },
              {
                EMPLACEMENT: city,
              },
            ],
            owner: req.user,
          });

        // Send picture to Cloudinary
        const pictureToUpload = await cloudinary.uploader.upload(req.files.picture.path, {
            folder: `/vinted/offers/${newOffer._id}`
        });

        // Add the upload result to newOffer
        newOffer.product_image = pictureToUpload;

        // Save the offer 
        await newOffer.populate("owner").save();

        // Respond to customer
        res.status(200).json(newOffer);

    } catch (error) {
        res.status(400).json({ error: error.message });
    }

});

router.get("/offers", async (req, res) => {

    try {
        
        // // Destructuring all queries
        const {title, sort, priceMin, priceMax, page} = req.query;
        const limit = Number(req.query.limit);
        let skip = (Number(page) * limit) - limit;
        if (isNaN(skip)) {
            skip = 0;
        }

        let filters = {};

        if (title) {
            filters.product_name = new RegExp(title, "i");
        } 

        if (req.query.priceMin) {
          filters.product_price = {
            $gte: Number(req.query.priceMin),
          };
        }
    
        if (req.query.priceMax) {
          if (filters.product_price) {
            filters.product_price.$lte = Number(req.query.priceMax);
          } else {
            filters.product_price = {
              $lte: Number(req.query.priceMax),
            };
          }
        }
        
    if (sort) {
      sort.replace("price-", "");
    }

    const count = await Offer.countDocuments(filters);

    const offers = await Offer.find(filters).populate("owner")
    // .select("product_name product_price")
    .limit(limit)
    .skip(skip)
    .sort(sort)

    res.status(200).json({
      count: count,
      offers: offers,
    })

    } catch (error) {
        res.status(404).json({ error: error.message});
    }
});

router.get("/offer/:id", async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate("owner");
    if (offer) {
      res.status(200).json(offer);
    } else {
      res.status(400).json({ message: "Invalid ID" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;