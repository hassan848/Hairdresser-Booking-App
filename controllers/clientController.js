const Client = require("./../models/modelClient");
const HandleError = require("./../utilities/HandleError");
const mongoose = require("mongoose");

exports.createClient = async function (req, res, next) {
  try {
    // console.log(req.body);
    const newClient = await Client.create({
      location: {
        coordinates: req.body.location.coordinates,
        address: req.body.location.address,
      },
      proximity: req.body.proximity,
      user: req.body.id,
      fullName: `${req.body.name} ${req.body.surname}`,
    });

    return newClient;
  } catch (err) {
    throw err;
  }
};

exports.updateClientAddress = async (req, res, next) => {
  try {
    const coords = req.body.coords;
    const addressString = req.body.address;

    if (!coords || !addressString)
      return new HandleError(400, "Please try again, no coords givens");

    const updatedUser = await Client.findByIdAndUpdate(
      req.user.client._id,
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

    const updatedUser = await Client.findByIdAndUpdate(
      req.user.client._id,
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

// "startLocation": {
//     "description": "Miami, USA",
//     "type": "Point",
//     "coordinates": [-80.185942, 25.774772],
//     "address": "301 Biscayne Blvd, Miami, FL 33132, USA"
//   }

exports.bookmarkHairdresser = async (req, res, next) => {
  try {
    const clientId = req.body.clientId;
    const hairdresserId = req.body.hairdresserId;
    const client = await Client.findById(clientId);

    client.bookmarkedHairdressers.push(hairdresserId);
    await client.save();

    res.status(200).json({
      status: "success",
      data: {
        client,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.removeBookmark = async (req, res, next) => {
  try {
    const clientId = req.body.clientId;
    const hairdresserId = req.body.hairdresserId;

    const client = await Client.findById(clientId);
    const indexToRemove = client.bookmarkedHairdressers.findIndex(
      (val) => val.toString() === hairdresserId
    );
    // console.log(hairdresserId, indexToRemove);

    if (!(indexToRemove == undefined) && !(indexToRemove === -1)) {
      client.bookmarkedHairdressers.splice(indexToRemove, 1);
      await client.save();
    }

    res.status(200).json({
      status: "success",
      data: {
        client: client.bookmarkedHairdressers,
      },
    });
  } catch (error) {
    next(error);
  }
};
