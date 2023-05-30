const mongoose = require("mongoose");

const servicesSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "A Service must have a title"],
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
    required: [true, "A service must have a price"],
  },
  hairdresser: {
    type: mongoose.Schema.ObjectId,
    ref: "Hairdresser",
  },
});

// Creating the model from the Schema
const Service = mongoose.model("Service", servicesSchema);
module.exports = Service;
