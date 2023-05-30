const Hairdresser = require("../models/modelHairdresser");
const Client = require("../models/modelClient");
const HandleError = require("./../utilities/HandleError");
const Booking = require("../models/modelBooking");
const newBookingEmail = require("./../utilities/bookingEmailHandler");
const TimeAgo = require("javascript-time-ago");
const en = require("javascript-time-ago/locale/en.json");
const mongoose = require("mongoose");

exports.getHairdresser = async (req, res, next) => {
  try {
    // console.log(req.params.id, "looooooooooooooool");
    const hairdresser = await Hairdresser.findOne({
      _id: req.params.id,
    })
      .populate({
        path: "user",
        select: "email",
      })
      .populate({
        path: "review",
        select: "review starRating client",
      });
    // console.log(hairdresser.review);
    if (!hairdresser)
      return next(
        new HandleError(404, "A Hairdresser with that ID does not exist.")
      );

    let clientData;
    if (req.cookies.previousQuery) {
      const hairdresserPrevQuery = JSON.parse(req.cookies.previousQuery);

      clientData = hairdresserPrevQuery.hairdresserResults.find(
        (cookieVal) => req.params.id == cookieVal._id
      );

      if (clientData) {
        // console.log("RECIEVED", hairdresser, clientData);
        res.status(200).render("hairdresser", {
          prevQuery: clientData,
          hairdresser,
        });
      } else {
        if (req.user.client) {
          const newHairdresser = await getDistance(
            hairdresser._id,
            req.user.client.location.coordinates[0],
            req.user.client.location.coordinates[1]
          );
          res.status(200).render("hairdresser", {
            prevQuery: {
              _id: newHairdresser[0]._id,
              distance: newHairdresser[0].distance,
              coordinates: newHairdresser[0].location.coordinates,
            },
            hairdresser: hairdresser,
          });
        }
      }
    } else {
      if (req.user.client) {
        const newHairdresser = await getDistance(
          hairdresser._id,
          req.user.client.location.coordinates[0],
          req.user.client.location.coordinates[1]
        );
        // console.log(newHairdresser[0]);
        res.status(200).render("hairdresser", {
          prevQuery: {
            _id: newHairdresser[0]._id,
            distance: newHairdresser[0].distance,
            coordinates: newHairdresser[0].location.coordinates,
          },
          hairdresser: hairdresser,
        });
      } else {
        res.status(200).render("hairdresserNoCookie", {
          hairdresser,
        });
      }
    }
  } catch (err) {
    next(err);
  }
};

exports.getHomepage = (req, res, next) => {
  res.status(200).render("homepage");
};

exports.loginPage = (req, res) => {
  res.status(200).render("login");
};

exports.findHairdresser = (req, res, next) => {
  res.status(200).render("findHairdressers");
};

exports.myServices = (req, res) => {
  res.status(200).render("myServices");
};

exports.signupPage = (req, res) => {
  res.status(200).render("signup");
};

exports.hairdresserSignup = (req, res) => {
  res.status(200).render("hairdresserSignup");
};

exports.forgotPasswordEmail = (req, res) => {
  res.status(200).render("inputEmailPass");
};

exports.emailSentConfirmation = (req, res) => {
  res.status(200).render("emailSentConf", {
    email: req.params.email,
  });
};

exports.changePassword = (req, res) => {
  res.status(200).render("changePassword", {
    token: req.params.token,
  });
};

exports.addressSettings = (req, res) => {
  res.status(200).render("addressSettings");
};

exports.workSchedule = async (req, res, next) => {
  try {
    const hairdresser = await Hairdresser.findById(req.user.hairdresser._id);
    let homeAppointCost;

    if (hairdresser.homeAppointCost) {
      homeAppointCost = hairdresser.homeAppointCost;
    }

    // console.log(homeAppointCost);

    res.status(200).render("workScheduleSettings", {
      workSchedule: hairdresser.workSchedule,
      workFlowDirection: hairdresser.workFlowDirection,
      homeAppointCost: homeAppointCost,
    });
  } catch (error) {
    next(error);
  }
};

exports.bookingReqConf = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.bookingId });

    if (!booking)
      return next(new HandleError(404, "There is no booking with that ID"));

    // console.log(`${req.user.client._id}` == `${booking.clientId}`);
    if (
      req.user.user_role === "client" &&
      `${req.user.client._id}` != `${booking.clientId}`
    ) {
      return next(new HandleError(404, "This booking does not belong to you"));
    }

    const address =
      booking.routeTo === "hairdresser"
        ? booking.hairdresser.addressString
        : booking.client.addressString;

    try {
      await new newBookingEmail(
        booking.hairdresser,
        `${req.protocol}://${req.get("host")}/myClientBooking/${booking._id}`,
        booking
      ).newBooking("hairdresser");
    } catch (error) {
      return next(error);
    }

    res.status(200).render("bookingReqConf", {
      booking,
      address,
    });
  } catch (error) {
    next(error);
  }
};

exports.myBookingsHistory = async (req, res, next) => {
  try {
    // console.log(req.user.client._id);

    // Getting all bookings
    const allBookings = await Booking.find({
      clientId: req.user.client._id,
    }).populate({
      path: "hairdresserId",
      select: "-__v -workSchedule",
    });
    // Populate the bookings by hairdresser

    TimeAgo.addDefaultLocale(en);

    const timeAgo = new TimeAgo("en-UK");

    allBookings.forEach(async (booking) => {
      if (
        booking.bookingStatus == "Placed" &&
        new Date(booking.endDateTime) <= Date.now()
      ) {
        booking.bookingStatus = "Cancelled";
        await Booking.findByIdAndUpdate(booking._id, {
          bookingStatus: "Cancelled",
        });
      }

      booking.address =
        booking.routeTo === "hairdresser"
          ? booking.hairdresser.addressString
          : booking.client.addressString;

      booking.timeAgo = timeAgo.format(booking.createdAt);
    });
    // console.log(allBookings[4].timeAgo);

    const placedBookings = [];
    let acceptedBookings = [];
    const remainingBookings = [];

    allBookings.forEach((booking) => {
      if (booking.bookingStatus === "Accepted") {
        acceptedBookings.push(booking);
      } else if (booking.bookingStatus === "Placed") {
        placedBookings.push(booking);
      } else {
        remainingBookings.push(booking);
      }
    });

    acceptedBookings = acceptedBookings.sort(
      (booking1, booking2) =>
        new Date(booking1.startDateTime) - new Date(booking2.startDateTime)
    );

    res.status(200).render("bookingsHistory", {
      allBookings,
      placedBookings,
      acceptedBookings,
      remainingBookings,
    });

    // res.status(200).json({
    //   status: "success",
    //   data: allBookings,
    // });
  } catch (error) {
    next(error);
  }
};

exports.getBookingClients = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.bookingId,
    })
      .populate({
        path: "hairdresserId",
        select: "-__v -workSchedule",
      })
      .populate("review");

    if (!booking)
      return next(new HandleError(404, "There is no booking with that ID"));

    // console.log(`${req.user.client._id}` == `${booking.clientId}`);
    if (
      req.user.user_role === "client" &&
      `${req.user.client._id}` != `${booking.clientId}`
    ) {
      return next(new HandleError(404, "This booking does not belong to you"));
    }

    const address =
      booking.routeTo === "hairdresser"
        ? booking.hairdresser.addressString
        : booking.client.addressString;

    let directionIcon;
    if (booking.hairdresserId.genderMarket === "unisex") {
      directionIcon = "wc";
    } else if (booking.hairdresserId.genderMarket === "male") {
      directionIcon = "man";
    } else if (booking.hairdresserId.genderMarket === "female") {
      directionIcon = "woman";
    }

    // console.log(booking.review);

    res.status(200).render("viewBookingClient", {
      booking,
      address,
      directionIcon,
    });

    // if(req.user.client._id !)
  } catch (error) {
    next(error);
  }
};

exports.myAppointments = async (req, res, next) => {
  try {
    // Getting all bookings
    const allBookings = await Booking.find({
      hairdresserId: req.user.hairdresser._id,
    });
    // Populate the bookings by hairdresser

    TimeAgo.addDefaultLocale(en);

    const timeAgo = new TimeAgo("en-UK");
    // console.log("lololololo");
    allBookings.forEach(async (booking) => {
      if (
        booking.bookingStatus == "Placed" &&
        new Date(booking.endDateTime) <= Date.now()
      ) {
        // console.log("lololololo");
        booking.bookingStatus = "Cancelled";
        await Booking.findByIdAndUpdate(booking._id, {
          bookingStatus: "Cancelled",
        });
      }

      booking.address =
        booking.routeTo === "hairdresser"
          ? booking.hairdresser.addressString
          : booking.client.addressString;

      booking.timeAgo = timeAgo.format(booking.createdAt);
    });
    // console.log(allBookings[4].timeAgo);
    // await allBookings.save({ validateBeforeSave: false });

    const placedBookings = [];
    // allBookings.forEach((booking) => {
    //   if (booking.bookingStatus === "Placed") {
    //     placedBookings.push(booking);
    //   }
    // });

    let acceptedBookings = [];
    const remainingBookings = [];
    allBookings.forEach((booking) => {
      if (booking.bookingStatus === "Accepted") {
        acceptedBookings.push(booking);
      } else if (booking.bookingStatus === "Placed") {
        placedBookings.push(booking);
      } else {
        remainingBookings.push(booking);
      }
    });

    acceptedBookings = acceptedBookings.sort(
      (booking1, booking2) =>
        new Date(booking1.startDateTime) - new Date(booking2.startDateTime)
    );
    // console.log(placedBookings);

    res.status(200).render("hairdresserAppointments", {
      allBookings,
      placedBookings,
      acceptedBookings,
      remainingBookings,
    });
  } catch (error) {
    next(error);
  }
};

exports.getHairdresserBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.bookingId,
    }).populate("review");

    if (!booking)
      return next(new HandleError(404, "There is no booking with that ID"));

    // console.log(`${req.user.client._id}` == `${booking.clientId}`);
    if (
      req.user.user_role === "hairdresser" &&
      `${req.user.hairdresser._id}` != `${booking.hairdresserId}`
    ) {
      return next(new HandleError(404, "This booking does not belong to you"));
    }

    TimeAgo.addDefaultLocale(en);
    const timeAgo = new TimeAgo("en-UK");

    booking.timeAgo = timeAgo.format(booking.createdAt);

    const address =
      booking.routeTo === "hairdresser"
        ? booking.hairdresser.addressString
        : booking.client.addressString;

    // console.log(booking);

    res.status(200).render("viewBookingHairdresser", {
      booking,
      address,
    });
  } catch (error) {
    next(error);
  }
};

exports.profilePage = (req, res) => {
  res.status(200).render("profilePage");
};

// exports.recommendedHairdresser = (req, res) => {
//   res.status(200).render("recommendedHairdressers");
// };

exports.recommendedHairdresser = async (req, res, next) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setHours(0, 0, 0, 0);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // console.log(today);
    // console.log(sevenDaysAgo);

    // Aggregation Pipeline
    const frequentHairdressers = await Booking.aggregate([
      {
        $match: {
          createdAt: {
            $gte: sevenDaysAgo,
            $lt: today,
          },
        },
      },
      {
        $group: {
          _id: "$hairdresserId",
          numBookings: { $sum: 1 },
        },
      },
      {
        $sort: { numBookings: -1 },
      },
    ]);

    const lat = req.query.lat;
    const lng = req.query.lng;
    const givenProximity = req.query.proximity;

    if (!lng || !lat) {
      return next(
        new HandleError(400, "The Latitude and Longitude must be given")
      );
    }

    const maxProximity = givenProximity / 0.000621371; // converting miles to metres
    const multiplyBy = 0.000621371;

    // const hairdressers = await req.actualQuery;

    const hairdressers = await Hairdresser.aggregate([
      {
        $geoNear: {
          near: {
            type: "point",
            coordinates: [lng * 1, lat * 1],
          },
          distanceField: "distance",
          distanceMultiplier: multiplyBy,
          maxDistance: maxProximity,
          query: req.stringQuery,
          // query: { starRating: { $gte: 3 }, numOfReviews: { $gte: 11 } },
        },
      },
    ]);

    // hairdressers.forEach((hairdresser) => {
    //   console.log(hairdresser._id);
    // });
    // console.log(frequentHairdressers);
    const freqHairdressers = [];
    frequentHairdressers.forEach((suggested) => {
      let hairdresser = hairdressers.find(
        (el) => `${el._id}` == `${suggested._id}`
      );
      if (hairdresser) freqHairdressers.push(hairdresser);
    });

    // const hairdresserIDs = freqHairdressers.map((hairdresser) => {
    //   return {
    //     _id: hairdresser._id,
    //     distance: hairdresser.distance,
    //     coordinates: hairdresser.location.coordinates,
    //   };
    // });

    // const coordsArray = [lat * 1, lng * 1];

    // res.cookie(
    //   "previousQuery",
    //   JSON.stringify({
    //     hairdresserResults: hairdresserIDs,
    //     userCords: coordsArray,
    //   })
    // );

    res.status(200).render("recommendedHairdressers", {
      hairdressers: freqHairdressers,
      givenProximity,
      coordinates: [lng, lat],
    });

    // console.log(freqHairdressers);

    // res.status(200).json({
    //   status: "success",
    //   results: freqHairdressers.length,
    //   data: {
    //     hairdressers: freqHairdressers,
    //   },
    // });
  } catch (error) {
    next(error);
  }
};

const getDistance = async (hairdresserId, lng, lat) => {
  try {
    const multiplyBy = 0.000621371;
    const hairdressers = await Hairdresser.aggregate([
      // {
      //   $match: {
      //     _id: new mongoose.Types.ObjectId("620551e5d874f2397cb368f6"),
      //   },
      // },
      {
        $geoNear: {
          near: {
            type: "point",
            coordinates: [lng * 1, lat * 1],
          },
          distanceField: "distance",
          distanceMultiplier: multiplyBy,
          // query: { starRating: { $gte: 3 }, numOfReviews: { $gte: 11 } },
        },
      },
      {
        $match: {
          _id: new mongoose.Types.ObjectId(hairdresserId),
        },
      },
    ]);

    return hairdressers;
  } catch (error) {}
};

exports.getBookmarkedHairdressers = async (req, res, next) => {
  try {
    // const client = await Client.findById(req.user.client._id).populate({
    //   path: "bookmarkedHairdressers",
    // });
    // const bookmarkedHairdressers = client.bookmarkedHairdressers;
    const lng = req.user.client.location.coordinates[0];
    const lat = req.user.client.location.coordinates[1];

    const multiplyBy = 0.000621371;
    const bookmarkedHairdressers = await Hairdresser.aggregate([
      {
        $geoNear: {
          near: {
            type: "point",
            coordinates: [lng * 1, lat * 1],
          },
          distanceField: "distance",
          distanceMultiplier: multiplyBy,
          // query: { starRating: { $gte: 3 }, numOfReviews: { $gte: 11 } },
        },
      },
      {
        $match: {
          _id: { $in: req.user.client.bookmarkedHairdressers },
        },
      },
    ]);

    res.status(200).render("bookmarkedHairdressers", {
      hairdressers: bookmarkedHairdressers,
      coordinates: [lng, lat],
    });
  } catch (error) {
    next(error);
  }
};
