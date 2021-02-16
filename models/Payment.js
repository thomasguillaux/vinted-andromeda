const mongoose = require("mongoose");

const Payment = mongoose.model("Payment", {
    amount: Number,
    currency: String,
    description: String,
    source: Number,
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
  },
});
module.exports = Payment;