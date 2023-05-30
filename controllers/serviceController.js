const Service = require("./../models/modelServices");
const Hairdresser = require("./../models/modelHairdresser");
const HandleError = require("./../utilities/HandleError");

exports.createService = async function (req, res, next) {
  //   console.log(req.user);
  try {
    const hairdresser = await Hairdresser.findById(req.user.hairdresser.id);

    if (hairdresser.servicesTitles.includes(req.body.title)) {
      return next(
        new HandleError(404, "You already have a Service with that title")
      );
    }

    const service = await Service.create({
      title: req.body.title,
      description: req.body.serviceDescription,
      price: req.body.servicePrice,
      hairdresser: req.user.hairdresser.id,
    });

    hairdresser.servicesTitles.push(service.title);
    hairdresser.services.push(service.id);

    await hairdresser.save();

    res.status(200).json({
      status: "success",
      data: {
        service,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteService = async function (req, res, next) {
  try {
    const hairdresser = await Hairdresser.findById(req.user.hairdresser.id);
    const service = await Service.findByIdAndDelete(req.params.id);

    if (!service) return next(new HandleError(404, "No Service with that ID"));

    const indexToRemove = hairdresser.servicesTitles.findIndex(
      (title) => title === service.title
    );

    hairdresser.servicesTitles.splice(indexToRemove, 1);
    hairdresser.services.splice(indexToRemove, 1);
    await hairdresser.save();

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

exports.editService = async (req, res, next) => {
  try {
    if (!req.params.id)
      return next(
        new HandleError(400, "There is no given service id for updates")
      );

    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        runValidators: true,
      }
    );

    if (req.body.title != updatedService.title) {
      // const hairdresser = await Hairdresser.findById(req.user.hairdresser.id);
      // const indexToChange = hairdresser.servicesTitles.findIndex(
      //   (title) => title === updatedService.title
      // );
      // console.log(updatedService, hairdresser.servicesTitles);
      // console.log(indexToChange);
      await Hairdresser.updateOne(
        {
          _id: req.user.hairdresser.id,
          servicesTitles: updatedService.title,
        },
        {
          $set: { "servicesTitles.$": req.body.title },
        }
      );
    }

    res.status(200).json({
      status: "success",
      data: {
        service: {
          _id: updatedService._id,
          title: req.body.title,
          description: req.body.description,
          price: req.body.price,
          hairdresser: updatedService.hairdresser,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};
