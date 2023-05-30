const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: `./configuration.env` }); // This will read the variables from the file, and save them to the Node.js Environment variables
// console.log(process.env); // Get the current Environment variables from Node

const User = require("./models/modelUser");

const app = require("./app");

const db = process.env.DATABASE; // Database connection string retrieved from ATLAS
// Establish DB connection
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    autoIndex: false,
  })
  .then(() => console.log("Successful db Connection"));

// const testUser = new User({
//   name: "Hassan",
//   surname: "Aslam",
// })
//   .save()
//   .then((doc) => {
//     console.log(doc);
//   });

// Start server on port
const port = 8000;
app.listen(port, () => {
  console.log(`App now running on port ${port}`);
});
