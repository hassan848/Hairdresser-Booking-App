const mongoose = require("mongoose");
// const slugify = require("slugify");

const clientSchema = new mongoose.Schema({
  location: {
    // GeoJSON
    type: {
      type: String,
      default: "Point",
      enum: ["Point"],
    },
    coordinates: [Number],
    address: String,
  },
  proximity: Number,
  profileImg: { type: String, default: "original.jpg" },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  fullName: {
    type: String,
  },
  bookmarkedHairdressers: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Hairdresser",
    },
  ],
});

const Client = mongoose.model("Client", clientSchema);
module.exports = Client;
