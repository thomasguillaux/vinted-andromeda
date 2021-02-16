const express = require("express");
const formidable = require("express-formidable");
const cors = require("cors");
const stripe = require("stripe")("sk_test_wYLoCp005rVakaPGnKWoSc1f")

const app = express();
app.use(formidable());
app.use(cors());

const User = require("../models/User");
const Offer = require("../models/Offer");
const Payment = require("../models/Payment");

router.post("/payment", isAuthenticated, async (req, res) => {

    try {

        const response = await stripe.charges.create({
            // amount: req.fields.amount,
            // currency: req.fields.currency,
            // description: req.fields.description,
            source: req.fields.stripeToken,
            // owner: req.user
        });

        if (response.status === "succeeded") {

            const newPayment = new Payment({
                // amount: req.fields.amount,
                // currency: req.fields.currency,
                // description: req.fields.description,
                source: req.fields.stripeToken,
                // owner: req.user
            });

            await newPayment.populate("owner").save();

            res.status(200).json({ message: "Paiement validé" })
        }

    } catch (error) {
        res.status(404).json({ error: error.message})
    }
})