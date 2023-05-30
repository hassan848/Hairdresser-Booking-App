const mongoose = require("mongoose");

const bookingAppointSchema = new mongoose.Schema({
  hairdresserId: {
    type: mongoose.Schema.ObjectId,
    ref: "Hairdresser",
    required: [true, "A booking must have a hairdresser associated with it"],
  },
  hairdresser: {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    addressString: {
      type: String,
      required: true,
    },
    profileImg: {
      type: String,
      required: true,
    },
  },
  clientId: {
    type: mongoose.Schema.ObjectId,
    ref: "Client",
    required: [true, "A booking must have a client"],
  },
  client: {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    addressString: {
      type: String,
      required: true,
    },
    profileImg: {
      type: String,
      required: true,
    },
  },
  services: [
    {
      serviceId: {
        type: mongoose.Schema.ObjectId,
        ref: "Service",
      },
      serviceName: {
        type: String,
        required: true,
      },
      servicePrice: {
        type: Number,
        required: true,
      },
    },
  ],
  homeAppointCost: {
    type: Number,
  },
  totalPrice: {
    type: Number,
    required: [true, "A booking/appointment must have a total price"],
  },
  startDateTime: {
    type: Date,
    required: [true, "A booking/appointment must have a start time"],
  },
  endDateTime: {
    type: Date,
    required: [true, "A booking/appointment must have an end time"],
  },
  routeTo: {
    type: String,
    required: true,
    enum: {
      values: ["hairdresser", "client"],
      message:
        "routeTo must either be to the hairdresser address or client address",
    },
  },
  distance: Number,
  bookingStatus: {
    type: String,
    required: true,
    enum: [
      "Placed",
      "Accepted",
      "Declined",
      "Cancelled",
      "Unavailable",
      "Completed",
    ],
    default: "Placed",
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

// Virtually populating the review on the hairdresser model
bookingAppointSchema.virtual("review", {
  ref: "Review",
  foreignField: "booking",
  localField: "_id",
});

// bookingAppointSchema.pre("save", function (next) {
//   // 'this' points to current review document
//   // constructor points to the model who created that document of 'this'
//   this.populate({
//     path: "hairdresser",
//     select: "starRating numOfReviews",
//   });

//   console.log(this, "loooooool");
//   next();
// });

const Booking = mongoose.model("Booking", bookingAppointSchema);
module.exports = Booking;
