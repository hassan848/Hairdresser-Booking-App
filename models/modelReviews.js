const mongoose = require("mongoose");
const Hairdresser = require("./modelHairdresser");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "A review must have a written description"],
    },
    starRating: {
      type: Number,
      min: [1, "A star rating must be at least 1"],
      max: [5, "A star rating can be at most 5 or lower"],
    },
    booking: {
      type: mongoose.Schema.ObjectId,
      ref: "Booking",
      required: [true, "A review must have an associated booking"],
    },
    hairdresser: {
      type: mongoose.Schema.ObjectId,
      ref: "Hairdresser",
      required: [true, "A review must have be for a Hairdresser"],
    },
    client: {
      type: mongoose.Schema.ObjectId,
      ref: "Client",
      required: [
        true,
        "A review must have a creator/author, who must be a client",
      ],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({ booking: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "client",
    select: "profileImg fullName",
  });

  next();
});

reviewSchema.statics.calcAvgHairdresserRating = async function (hairdresserId) {
  const ratingResults = await this.aggregate([
    {
      $match: { hairdresser: hairdresserId },
    },
    {
      $group: {
        _id: "$hairdresser",
        numOfReviews: { $sum: 1 },
        ratingAverage: { $avg: "$starRating" },
      },
    },
  ]);
  //   console.log(ratingResults);
  if (ratingResults.length > 0) {
    const hairdresserInfo = {
      starRating: ratingResults[0].ratingAverage,
      numOfReviews: ratingResults[0].numOfReviews,
    };
    await Hairdresser.findByIdAndUpdate(hairdresserId, hairdresserInfo);
    return hairdresserInfo;
  } else {
    await Hairdresser.findByIdAndUpdate(hairdresserId, {
      starRating: 0,
      numOfReviews: 0,
    });
  }
};
reviewSchema.post("save", async function () {
  // 'this' points to current review document
  // constructor points to the model who created that document of 'this'
  const hairdresserInfo = await this.constructor.calcAvgHairdresserRating(
    this.hairdresser
  );
  this.hairdresserInfo = hairdresserInfo;
  // console.log(this.hairdresserInfo);
});

reviewSchema.post(/findOneAnd/, async function (document) {
  await document.constructor.calcAvgHairdresserRating(document.hairdresser);
});

// reviewSchema.pre("save", function (next) {
//   // 'this' points to current review document
//   // constructor points to the model who created that document of 'this'
//   this.populate({
//     path: "hairdresser",
//     select: "starRating numOfReviews",
//   });

//   console.log(this, "loooooool");
//   next();
// });

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
