const Review = require("../models/modelReviews");
const Booking = require("../models/modelBooking");
const newBookingEmail = require("./../utilities/bookingEmailHandler");

exports.createNewReview = async (req, res, next) => {
  try {
    const review = await Review.create({
      review: req.body.review,
      starRating: req.body.starRating,
      booking: req.body.booking,
      hairdresser: req.body.hairdresser,
      client: req.user.client._id,
      createdAt: Date.now(),
    });

    review.hairdresserInfo.starRating =
      Math.round(review.hairdresserInfo.starRating * 10) / 10;

    const booking = await Booking.findById(review.booking);
    booking.addedReview = review;
    await new newBookingEmail(
      booking.hairdresser,
      `${req.protocol}://${req.get("host")}/myClientBooking/${booking._id}`,
      booking
    ).notifyReview("hairdresser");

    res.status(200).json({
      status: "success",
      data: {
        review,
        hairdresserData: review.hairdresserInfo,
        clientImg: booking.client.profileImg,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!review) return next(new AppError("No review found with that ID", 404));

    res.status(200).json({
      status: "success",
      data: {
        data: review,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) return next(new AppError("No review found with that ID", 404));

    res.status(200).json({
      status: "success",
      data: {
        data: null,
      },
    });
  } catch (error) {
    next(error);
  }
};
