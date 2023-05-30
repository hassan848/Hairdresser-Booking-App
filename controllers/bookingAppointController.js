const HandleError = require("./../utilities/HandleError");
const Booking = require("./../models/modelBooking");
const newBookingEmail = require("./../utilities/bookingEmailHandler");

exports.createNewBooking2 = async (req, res, next) => {
  try {
    const {
      hairdresser,
      client,
      services,
      totalPrice,
      startDateTime,
      endDateTime,
      routeTo,
      distance,
    } = req.query;

    const homeAppointCost = req.query.homeAppointCost;
    console.log(services);
    console.log(JSON.parse(services), "looooooooooooooooooooool");

    const parsedHairdresser = JSON.parse(hairdresser);
    const hairdresserObj = {
      name: parsedHairdresser.name,
      email: parsedHairdresser.email,
      addressString: parsedHairdresser.addressString,
      profileImg: parsedHairdresser.profileImg,
    };

    const parsedClient = JSON.parse(client);
    const clientObj = {
      name: parsedClient.name,
      email: parsedClient.email,
      addressString: parsedClient.addressString,
      profileImg: parsedClient.profileImg,
    };

    const newBooking = {
      hairdresserId: parsedHairdresser.hairdresserId,
      hairdresser: hairdresserObj,
      clientId: parsedClient.clientId,
      client: clientObj,
      services: JSON.parse(services),
      totalPrice,
      startDateTime,
      endDateTime,
      routeTo,
      distance,
      createdAt: Date.now(),
    };

    if (homeAppointCost || homeAppointCost == 0)
      newBooking.homeAppointCost = Number(homeAppointCost).toFixed(2);

    const booking = await Booking.create(newBooking);

    try {
      await new newBookingEmail(
        parsedClient,
        `${req.protocol}://${req.get("host")}/myBooking/${booking._id}`,
        booking
      ).newBooking("client");
    } catch (error) {
      return next(error);
    }

    res.status(200).json({
      status: "success",
      data: {
        booking,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.createNewBooking = async (req, res, next) => {
  try {
    const {
      hairdresser,
      client,
      services,
      totalPrice,
      startDateTime,
      endDateTime,
      routeTo,
      distance,
    } = req.body;

    const homeAppointCost = req.body.homeAppointCost;
    // console.log(services, "lolololo");
    // console.log(JSON.parse(services), "looooooooooooooooooooool");

    // const parsedHairdresser = JSON.parse(hairdresser);
    const parsedHairdresser = hairdresser;
    const hairdresserObj = {
      name: parsedHairdresser.name,
      email: parsedHairdresser.email,
      addressString: parsedHairdresser.addressString,
      profileImg: parsedHairdresser.profileImg,
    };

    // const parsedClient = JSON.parse(client);
    const parsedClient = client;
    const clientObj = {
      name: parsedClient.name,
      email: parsedClient.email,
      addressString: parsedClient.addressString,
      profileImg: parsedClient.profileImg,
    };

    const newBooking = {
      hairdresserId: parsedHairdresser.hairdresserId,
      hairdresser: hairdresserObj,
      clientId: parsedClient.clientId,
      client: clientObj,
      services: services,
      totalPrice,
      startDateTime,
      endDateTime,
      routeTo,
      distance,
      createdAt: Date.now(),
    };

    if (homeAppointCost || homeAppointCost == 0)
      newBooking.homeAppointCost = Number(homeAppointCost).toFixed(2);

    const booking = await Booking.create(newBooking);

    try {
      await new newBookingEmail(
        parsedClient,
        `${req.protocol}://${req.get("host")}/myBooking/${booking._id}`,
        booking
      ).newBooking("client");
    } catch (error) {
      return next(error);
    }

    res.status(200).json({
      status: "success",
      data: {
        booking,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getReleventBookings = async (req, res, next) => {
  try {
    const curBody = req.query.dateToCheck;
    const dateToCheck = new Date(curBody);

    const hairdresserId = req.query.hairdresserId;
    // console.log(curBody, req.params);
    // const dateToCheck = new Date("2022-03-29");
    const nextDay = new Date(dateToCheck);
    nextDay.setDate(dateToCheck.getDate() + 1);
    // console.log(new Date(dateToCheck), new Date(nextDay));

    dateToCheck.setHours(0, 0, 0, 0);
    nextDay.setHours(0, 0, 0, 0);
    // console.log(nextDay);

    // hairdresserId: "6205a6e3abe12c6cf470854f",
    const bookings = await Booking.find({
      hairdresserId: hairdresserId,
      startDateTime: {
        $gte: dateToCheck,
        $lt: nextDay,
      },
      bookingStatus: { $ne: "Cancelled" },
      //   endDateTime: { $lt: new Date("2023-03-26") },
    });

    res.status(200).json({
      status: "success",
      results: bookings.length,
      data: {
        bookings,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateBookingStatus = async (req, res, next) => {
  try {
    // console.log(req.params.id);
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!booking)
      return next(new HandleError(404, "There is no booking with that ID"));

    try {
      if (req.body.bookingStatus == "Accepted") {
        await new newBookingEmail(
          booking.client,
          `${req.protocol}://${req.get("host")}/myBooking/${booking._id}`,
          booking
        ).acceptedBooking("client");
      } else if (
        req.body.bookingStatus == "Cancelled" &&
        req.user.user_role === "hairdresser"
      ) {
        await new newBookingEmail(
          booking.client,
          `${req.protocol}://${req.get("host")}/myBooking/${booking._id}`,
          booking
        ).cancelBooking("client");
      } else if (
        req.body.bookingStatus == "Cancelled" &&
        req.user.user_role === "client"
      ) {
        await new newBookingEmail(
          booking.hairdresser,
          `${req.protocol}://${req.get("host")}/myClientBooking/${booking._id}`,
          booking
        ).cancelBooking("hairdresser");
      } else if (
        req.body.bookingStatus == "Completed" &&
        req.user.user_role === "hairdresser"
      ) {
        await new newBookingEmail(
          booking.client,
          `${req.protocol}://${req.get("host")}/myBooking/${booking._id}`,
          booking
        ).completeBooking("client");
      }
    } catch (error) {
      return next(error);
    }

    res.status(200).json({
      status: "success",
      data: {
        data: booking,
      },
    });
  } catch (error) {
    next(error);
  }
};

// exports.updateBookingStatusClient = async (req, res, next) => {

// }
