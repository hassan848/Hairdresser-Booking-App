const User = require("./../models/modelUser");
const HandleError = require("./../utilities/HandleError");
const NewEmail = require("./../utilities/emailHandler");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const crypto = require("crypto");

const clientController = require("./clientController");
const hairdresserController = require("./hairdresserController");

const GenerateToken = function (userID) {
  // jwt.sign(payload, secret, options, callback)
  // userID will be used as the payload for signing/generating the token
  return jwt.sign({ id: userID }, process.env.JWT_SECRET_STRING, {
    expiresIn: process.env.JWT_EXPIRED_IN,
  });
};

const generateTokenThenDispatch = function (resStatusCode, res, curUser) {
  const generatedToken = GenerateToken(curUser.id);

  const cookieSettings = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_DAYS_EXPIRY * 24 * 60 * 60 * 1000
    ),
    httpOnly: false,
  };

  res.cookie("jwt", generatedToken, cookieSettings);
  // console.log(generatedToken);

  // Send off response with token inside the cookie defined on the response obj.
  res.status(resStatusCode).json({
    status: "success",
    token: generatedToken,
    data: {
      user: curUser,
    },
  });
};

exports.signup = async function (req, res, next) {
  try {
    const newUser = await User.create({
      // Returns Promise/Query
      name: req.body.name,
      surname: req.body.surname,
      email: req.body.email,
      user_role: req.body.user_role,
      password: req.body.password,
      passwordRepeat: req.body.passwordRepeat,
      passwordDateChanged: req.body.passwordDateChanged,
    });

    req.body.id = newUser.id;
    let subUser;
    if (newUser.user_role === "client") {
      subUser = await clientController.createClient(req, res, next);
      newUser.client = subUser.id;
    } else if (newUser.user_role === "hairdresser") {
      subUser = await hairdresserController.createHairdresser(req, res, next);
      newUser.hairdresser = subUser.id;
    }

    await newUser.save({ validateBeforeSave: false });
    newUser.password = undefined;
    generateTokenThenDispatch(200, res, newUser);

    // res.status(200).json({
    //   status: "success",
    //   data: {
    //     user: newUser,
    //   },
    // });
  } catch (err) {
    // console.log(err);
    return next(err);
    // res.status(404).json({
    //   status: "failure",
    //   message: err.message,
    // });
  }
};

exports.login = async function (req, res, next) {
  try {
    // 1) check IF email & password exists
    if (!req.body.email || !req.body.password) {
      return next(new HandleError(400, "Please provide an email and password"));
      //   res.status(400).json({
      //     status: "fail",
      //     message: "Please provide an email and password",
      //   });
      //   return next();
    }
    const emailEntered = req.body.email;
    const passEntered = req.body.password;

    // 2) check if user exists via email check from db using findOne() Query.
    const userAttempt = await User.findOne({ email: emailEntered })
      .select("+password")
      .populate({
        path: "client",
        select: "-__v",
      })
      .populate({
        path: "hairdresser",
        select: "-__v",
      });

    // console.log(emailEntered);

    // 3) check if password is correct by calling the schema middleware function I defined
    if (
      !userAttempt ||
      !(await userAttempt.checkPassword(passEntered, userAttempt.password))
    ) {
      return next(new HandleError(401, "Email and Password do not exist"));
      //   res.status(401).json({
      //     status: "fail",
      //     message: "Email and Password do not exist",
      //   });
      //   return next();
    }

    userAttempt.password = undefined;
    // await new NewEmail(userAttempt, "lol").signupEmail();
    // await new NewEmail(userAttempt, "lol").newBooking();
    generateTokenThenDispatch(200, res, userAttempt);

    // res.status(200).json({
    //   status: "success",
    //   data: {
    //     user: userAttempt,
    //   },
    // });
  } catch (err) {
    next(err);
    // res.status(404).json({
    //   status: "failure",
    //   message: err.message,
    // });
  }
};

exports.signOut = (req, res) => {
  res.cookie("jwt", "dummytext", {
    expires: new Date(Date.now() + 9 * 1000), // Setting a new Token with same name but expiring it immediately
    httpOnly: true,
  });
  res.status(200).json({ status: "success" });
};

exports.authenticate = async (req, res, next) => {
  try {
    // retrieve token and check it exists
    let token;
    if (req.cookies.jwt) {
      token = req.cookies.jwt;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    console.log(token, "loooooololol");
    if (!token) {
      return next(
        new HandleError(
          401,
          "You need to login to acquire permission for this."
        )
      );
    }

    // check is token is correct - validation
    const resolvedToken = await promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET_STRING
    );

    // 3) Check if payload of token correlates to a valid active userID
    const existingUser = await User.findById(resolvedToken.id)
      .populate({
        path: "client",
        select: "-__v",
      })
      .populate({
        path: "hairdresser",
        select: "-__v -workSchedule",
      });
    if (!existingUser)
      return next(
        new HandleError(
          401,
          "There is no such user, or the user no longer exists"
        )
      );

    // Goes to next Middleware route handler - GRANTS ACCESS TO PROTECTED ROUTE
    req.user = existingUser;
    res.locals.user = existingUser;
    // console.log(existingUser);

    // console.log(req.user);

    next();
  } catch (err) {
    next(err);
  }
};

exports.confineRouteTo = function (...userRoles) {
  return function (req, res, next) {
    // roles = ['client', 'hairdresser', 'admin']
    if (!userRoles.includes(req.user.user_role))
      return next(new HandleError(403, "You do not have permission for this"));

    next();
  };
};

exports.forgotPassword = async (req, res, next) => {
  try {
    // 1) Get the active user via the email address
    const curUser = await User.findOne({ email: req.body.email });
    if (!curUser) {
      return next(
        new HandleError(404, "A user with this Email does not exist")
      );
    }

    // 2) Create a reset token that is completely random and ambigous
    const resetPasswordToken = curUser.generateTokenResetPassword();
    await curUser.save({ validateBeforeSave: false });

    // 3) Send the token to users email where they can reset their password
    // const URLReset = `${req.protocol}://${req.get(
    //   "host"
    // )}/api/users/resetPass/${resetPasswordToken}`;

    const URLReset = `${req.protocol}://${req.get(
      "host"
    )}/changePassword/${resetPasswordToken}`;

    // const messageToSend = `Forgot your password? Submit your new password at ${URLReset}.\nOtherwise ignore this email`;

    // try {
    //   await emailToSend({
    //     emailToSend: curUser.email,
    //     subject: "Password reset request (valid for 10 minutes)",
    //     messageToSend,
    //   });
    // } catch (error) {
    //   curUser.resetPasswordToken = undefined;
    //   curUser.resetPasswordTokenExpiry = undefined;
    //   await curUser.save({ validateBeforeSave: false });

    //   return next(
    //     new HandleError(
    //       500,
    //       "There was an error sending the rest password email, Please try again!"
    //     )
    //   );
    // }

    try {
      await new NewEmail(curUser, URLReset).passworwResetEmail();

      res.status(200).json({
        status: "success",
        message: "Token sent to users's email!",
      });
    } catch (error) {
      curUser.resetPasswordToken = undefined;
      curUser.resetPasswordTokenExpiry = undefined;
      await curUser.save({ validateBeforeSave: false });
      return next(
        new HandleError(
          500,
          "There was an error sending the reset password email, Please try again!"
        )
      );
    }
  } catch (error) {
    next(error);
  }
};

exports.resetPass = async (req, res, next) => {
  try {
    // First encrypt the non-enxypted password reset token which is sent to the user's email
    const hashedPassResetToken = crypto
      .createHash("sha256")
      .update(req.params.resetToken)
      .digest("hex");

    // console.log(req.params.resetToken, hashedPassResetToken);
    const curUser = await User.findOne({
      resetPasswordTokenEncypted: hashedPassResetToken,
    }).select("+password");

    if (!curUser)
      return next(
        new HandleError(
          400,
          "Token has expired or User with this Token does not exist"
        )
      );

    if (Date.now() > curUser.resetPasswordTokenExpiry)
      return next(new HandleError(400, "The Reset Token has now Expired!"));

    // Check if the new inputted password is different to the existing password, otherwise return error msg.
    if (await curUser.checkPassword(req.body.password, curUser.password)) {
      return next(
        new HandleError(
          401,
          "The inputted password cannot be the same as your original existing password"
        )
      );
    }

    curUser.password = req.body.password;
    curUser.passwordRepeat = req.body.passwordRepeat;
    curUser.resetPasswordTokenEncypted = undefined;
    curUser.resetPasswordTokenExpiry = undefined;
    await curUser.save();

    // Now Login the user by sending a new JWT
    generateTokenThenDispatch(200, res, curUser);
  } catch (error) {
    next(error);
  }
};

exports.editMyPassword = async (req, res, next) => {
  try {
    // 1) First get user from USER Collection
    const updatedUser = await User.findById(req.user._id).select("+password");
    const existingPassword = updatedUser.password;
    // 2) Check if POSTed current password is the same as existing password
    if (
      !(await updatedUser.checkPassword(req.body.curPassword, existingPassword))
    ) {
      return next(
        new HandleError(401, "The Existing Password you entered is Invalid")
      );
    }

    // If valid, update the password from DB
    updatedUser.password = req.body.newPassword;
    updatedUser.passwordRepeat = req.body.newPasswordRepeat;
    await updatedUser.save();

    // LOGS in user by setting the JWT token on the cookie
    generateTokenThenDispatch(200, res, updatedUser);
  } catch (error) {
    next(error);
  }
};

exports.isSignedIn = async (req, res, next) => {
  // 1) Check if token exists and check if its correct for every request
  if (req.cookies.jwt) {
    try {
      // check is token is correct - validation
      const resolvedToken = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET_STRING
      );

      // 3) Check if payload of token correlates to a valid active userID
      const existingUser = await User.findById(resolvedToken.id)
        .populate({
          path: "client",
          select: "-__v",
        })
        .populate({
          path: "hairdresser",
          select: "-__v -workSchedule",
        });
      if (!existingUser) return next();

      // Goes to next Middleware route handler - GRANTS ACCESS TO PROTECTED ROUTE
      req.user = existingUser;
      res.locals.user = existingUser;

      // console.log(req.user);
    } catch (err) {
      // There is no logged in user
      return next(); // Simply goes to the next middleware NOT to the global middleware error handling function
    }
  }
  next();
};
