const path = require("path");
const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
// APP.JS IS RELATED TO EXPRESS/MIDDLEWARES - WHEREAS SERVER.JS IS RELATED TO SERVER AND EXTERNAL DATA

const globalErrorHandler = require("./controllers/globalErrorController");

const routerPug = require("./routes/pugRoutes");
const routerUser = require("./routes/userRoutes");
const routerClient = require("./routes/clientRoutes");
const routerHairdresser = require("./routes/hairdresserRoutes");
const routerServices = require("./routes/serviceRoutes");
const routerBooking = require("./routes/bookingRoutes");
const routerReview = require("./routes/reviewRoutes");

// const Hairdresser = require("./models/modelHairdresser");

const app = express();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Serving Static files - middleware
app.use(express.static(path.join(__dirname, "/")));

// 1) MIDDLEWARES
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// app.get("/hairdresser/:id", async (req, res) => {
//   console.log(req.params.id);
//   const hairdresser = await Hairdresser.findOne({
//     _id: req.params.id,
//   }).populate({
//     path: "user",
//     select: "email",
//   });
//   let clientData;
//   if (req.cookies.previousQuery) {
//     const hairdresserPrevQuery = JSON.parse(req.cookies.previousQuery);

//     clientData = hairdresserPrevQuery.hairdresserResults.find(
//       (cookieVal) => req.params.id == cookieVal._id
//     );
//     console.log("RECIEVED", hairdresser, clientData);
//     res.status(200).render("hairdresser", {
//       prevQuery: clientData,
//       hairdresser,
//     });
//   } else {
//     res.status(200).render("hairdresserNoCookie", {
//       hairdresser,
//     });
//   }
// });

// 2) Routes
app.use("/", routerPug);
// app.use('/login', login)
app.use("/api/users", routerUser);
app.use("/api/clients", routerClient);
app.use("/api/hairdressers", routerHairdresser);
app.use("/api/services", routerServices);
app.use("/api/bookings", routerBooking);
app.use("/api/reviews", routerReview);

// Implementing a GLOBAL ERROR HANDLING MIDDLEWARE FUNCTION
app.use(globalErrorHandler);

module.exports = app;
