const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A user must have a name"],
  },
  surname: {
    type: String,
    required: [true, "Please provide your surname"],
  },
  email: {
    type: String,
    required: [true, "An email is required for signup"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "A valid email is required for signup"],
  },
  user_role: {
    type: String,
    enum: ["admin", "hairdresser", "client"],
    default: "client",
  },
  password: {
    type: String,
    required: [true, "A password is required for signup"],
    select: false,
    minLength: 8,
  },
  passwordRepeat: {
    type: String,
    required: [
      true,
      "The password needs to be re-entered for verification purposes",
    ],
    validate: {
      // This only works on CREATE() n SAVE()
      // docuemnt.SAVE() can be used to update a User.
      validator: function (curValue) {
        return curValue === this.password;
      },
      message: "Passwords do not match",
    },
  },
  client: {
    type: mongoose.Schema.ObjectId,
    ref: "Client",
  },
  hairdresser: {
    type: mongoose.Schema.ObjectId,
    ref: "Hairdresser",
  },
  passwordDateChanged: Date,
  resetPasswordTokenEncypted: String,
  resetPasswordTokenExpiry: Date,
});

// PRE & POST hooks middleware executed as query mongoose DOCUMENT MIDDLEWARE
// DOCUMENT MIDDLEWARE: runs before .save() and .create()

// userSchema.pre(/find/, function (next) {
//   let path;
//   this.find({})
//   console.log(this.id);
//   // this.populate({
//   //   path,
//   //   select: "-__v",
//   // });

//   next();
// });

// Perform Hashing Algorithm on Password entered a pre-Save doc-middleware
// Hashing performed with 'bcrypt' module
userSchema.pre("save", async function (next) {
  // Only run this function if password has actually modified
  if (!this.isModified("password")) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordRepeat field
  this.passwordRepeat = undefined; // this works because the 'passwordRepeat' field has a input which is REQUIRED.
  //but can be set to UNDEFINED to make it NOT persist in the DB Document.
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordDateChanged = Date.now() - 1000;
  next();
});

// Schema method to check password is correct for login etc.
userSchema.methods.checkPassword = async function (
  enteredPassword,
  actualPassword
) {
  return await bcrypt.compare(enteredPassword, actualPassword);
};

userSchema.methods.generateTokenResetPassword = function () {
  const resetPasswordToken = crypto.randomBytes(32).toString("hex");
  this.resetPasswordTokenEncypted = crypto
    .createHash("sha256")
    .update(resetPasswordToken)
    .digest("hex");

  console.log({ resetPasswordToken }, this.resetPasswordTokenEncypted);

  this.resetPasswordTokenExpiry = Date.now() + 10 * 60 * 1000;
  return resetPasswordToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
