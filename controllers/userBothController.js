const User = require("./../models/modelUser");
const HandleError = require("./../utilities/HandleError");
const sharp = require("sharp");
const Hairdresser = require("./../models/modelHairdresser");
const Client = require("./../models/modelClient");
const multer = require("multer");

exports.updateNameEmail = async (req, res, next) => {
  try {
    const data = {};

    if (req.body.name) data.name = req.body.name;
    if (req.body.surname) data.surname = req.body.surname;
    if (req.body.email) data.email = req.body.email;

    if (req.file) {
      if (req.user.user_role === "client") {
        await Client.findOneAndUpdate(
          { user: req.user._id },
          {
            profileImg: req.file.imgName,
          }
        );
        // data.profileImg = req.file.imgName;
      }
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, data, {
      new: true,
      runValidators: true,
    });
    // console.log(updatedUser);
    if (updatedUser.user_role === "hairdresser") {
      const fullName = `${updatedUser.name} ${updatedUser.surname}`;
      const hairdresserData = {
        fullName,
      };
      if (req.file) hairdresserData.profileImg = req.file.imgName;
      await Hairdresser.findOneAndUpdate(
        { user: updatedUser._id },
        hairdresserData
      );
    }

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

// const fileStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "Frontend/img/customers");
//   },
//   filename: (req, file, cb) => {
//     const fileExtension = file.mimetype.split("/")[1];
//     cb(null, `profileImage-${Date.now()}-${req.user._id}.${fileExtension}`);
//   },
// });

const fileSave = multer.memoryStorage();

const uploadFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(
      new HandleError(400, "Please try again, must JPEG, PNG extenstion"),
      false
    );
  }
};

const uploadImg = multer({
  storage: fileSave,
  fileFilter: uploadFileFilter,
});

exports.updateProfileImg = uploadImg.single("profileImg");

exports.shrinkProfileImg = (req, res, next) => {
  if (!req.file) return next();

  req.file.imgName = `profileImage-${Date.now()}-${req.user._id}.jpeg`;

  sharp(req.file.buffer)
    .resize(128, 128)
    .toFormat("jpeg")
    .jpeg({ qualiity: 95 })
    .toFile(`Frontend/img/customers/${req.file.imgName}`);

  next();
};
