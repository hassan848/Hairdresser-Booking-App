const HandleError = require("./../utilities/HandleError");
const Hairdresser = require("./../models/modelHairdresser");
const Booking = require("./../models/modelBooking");
const QueryBlueprint = require("./../utilities/QueryBlueprint");
const mongoose = require("mongoose");

exports.createHairdresser = async function (req, res, next) {
  try {
    const newHairdresser = await Hairdresser.create({
      location: {
        coordinates: req.body.location.coordinates,
        address: req.body.location.address,
      },
      proximity: req.body.proximity,
      starRating: req.body.starRating,
      numOfReviews: req.body.numOfReviews,
      description: req.body.description,
      profileImg: req.body.profileImg,
      genderMarket: req.body.genderMarket,
      workFlowDirection: req.body.workFlowDirection,
      workSchedule: req.body.workSchedule,
      user: req.body.id,
      homeAppointCost: req.body.homeAppointCost,
      fullName: `${req.body.name} ${req.body.surname}`,
    });

    return newHairdresser;
  } catch (err) {
    throw err;
  }
};

exports.getAllHairdressers = async function (req, res, next) {
  try {
    const hairdressers = await Hairdresser.find();

    res.status(200).json({
      status: "success",
      results: hairdressers.length,
      data: {
        data: hairdressers,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllHairdressersWithDistance = async function (req, res, next) {
  try {
    const lat = req.body.lat;
    const lng = req.body.lng;
    const givenProximity = req.body.proximity;

    if (!lng || !lat) {
      return next(
        new HandleError(400, "The Latitude and Longitude must be given")
      );
    }

    const proximity = givenProximity / 3963.2;
    console.log(proximity);
    const hairdressers = await Hairdresser.find({
      location: { $geoWithin: { $centerSphere: [[lng, lat], proximity] } },
    });

    res.status(200).json({
      status: "success",
      results: hairdressers.length,
      data: {
        data: hairdressers,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getHairdressersDistances = async function (req, res, next) {
  try {
    // console.log(req.query.lat);
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

    res.status(200).json({
      status: "success",
      results: hairdressers.length,
      data: {
        data: hairdressers,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    // console.log(req.body);
    const query = new QueryBlueprint(Hairdresser.find(), req.query).filter();

    req.stringQuery = query.stringQuery;
    req.actualQuery = query.actualQuery;
    // if (query.radiusSettings.lat) console.log(req.query);

    // console.log(req.actualQuery);

    next();
  } catch (err) {
    next(err);
  }
};

exports.editHairdresser = async (req, res, next) => {
  try {
    const hairdresser = await Hairdresser.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!hairdresser)
      return next(new HandleError(404, "No Hairdresser found with that ID"));

    res.status(200).json({
      status: "success",
      data: {
        data: hairdresser,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.editHairdresser2 = async (req, res, next) => {
  try {
    const hairdresser = await Hairdresser.findByIdAndUpdate(
      req.user.hairdresser._id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!hairdresser)
      return next(new HandleError(404, "No Hairdresser found with that ID"));

    res.status(200).json({
      status: "success",
      data: {
        data: hairdresser,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.updateAddress = async (req, res, next) => {
  try {
    // console.log("loolololol", req.user);
    const coords = req.body.coords;
    const addressString = req.body.address;

    if (!coords || !addressString)
      return new HandleError(400, "Please try again, no coords given");

    const updatedUser = await Hairdresser.findByIdAndUpdate(
      req.user.hairdresser._id,
      {
        location: {
          type: "Point",
          coordinates: coords,
          address: addressString,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: "success",
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProximity = async (req, res, next) => {
  try {
    const newProximity = req.body.proximity;
    if (!newProximity) {
      return next(new HandleError(400, "Please try again, no proximity given"));
    }

    const updatedUser = await Hairdresser.findByIdAndUpdate(
      req.user.hairdresser._id,
      {
        proximity: newProximity,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: "success",
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.mostBookedHairdressers = async (req, res, next) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setHours(0, 0, 0, 0);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

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

    const freqHairdressers = [];
    // console.log(hairdressers.length);
    frequentHairdressers.forEach((suggested) => {
      const hairdresser = hairdressers.find(
        (el) => `${el._id}` == `${suggested._id}`
      );
      if (hairdresser) freqHairdressers.push(hairdresser);
      // console.log(hairdresser._id);
    });

    res.status(200).json({
      status: "success",
      results: freqHairdressers.length,
      data: {
        hairdressers: freqHairdressers,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.setRecommendQuery = (req, res, next) => {
  req.query.lat = req.user.client.location.coordinates[1];
  req.query.lng = req.user.client.location.coordinates[0];
  req.query.proximity = req.user.client.proximity;
  next();
};

exports.hairdresserDistance = async (req, res, next) => {
  try {
    // const ObjectId = mongoose.Types.ObjectId;
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
            coordinates: [0.0559733 * 1, 51.5659724 * 1],
          },
          distanceField: "distance",
          distanceMultiplier: multiplyBy,
          // query: { starRating: { $gte: 3 }, numOfReviews: { $gte: 11 } },
        },
      },
      {
        $match: {
          _id: new mongoose.Types.ObjectId("620551e5d874f2397cb368f6"),
        },
      },
    ]);

    res.status(200).json({
      status: "success",
      results: hairdressers.length,
      data: {
        hairdressers: hairdressers,
      },
    });
  } catch (error) {
    next(error);
  }
};
