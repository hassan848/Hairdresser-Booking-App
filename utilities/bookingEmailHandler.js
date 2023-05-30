// Will use nodemailer package to send emails to users using NodeJS
const nodemailer = require("nodemailer");
const pug = require("pug");
const { htmlToText } = require("html-to-text");
// import "@babel/polyfill";

module.exports = class newBookingEmail {
  constructor(userToSend, urlAPI, bookingInfo) {
    this.recepientEmail = userToSend.email;
    this.recepientFirstName = userToSend.name.split(" ")[0];
    this.recepientSurname = userToSend.name.split(" ")[1];
    this.urlAPI = urlAPI;
    this.senderEmail = `Hassan Aslam <${process.env.SENDER_EMAIL}>`;

    // this.bookedServices = bookingInfo.services;
    // this.totalPrice = bookingInfo.totalPrice;
    // this.bookingID = bookingInfo._id;
    // this.routeTo = bookingInfo.routeTo;
    this.bookingInfo = bookingInfo;
    // console.log(bookingInfo.review);
  }

  generateEmailTransport() {
    if (process.env.NODE_CUR_ENVIRONMENT === "development") {
      return nodemailer.createTransport({
        host: process.env.HOST_EMAIL,
        port: process.env.HOST_PORT,
        auth: {
          user: process.env.USERNAME_EMAIL,
          pass: process.env.PASSWORD_EMAIL,
        },
      });
    } else {
      return 1;
    }
  }

  async emailToSend(PugTemplate, emailSubject, recepientFor) {
    const address =
      this.bookingInfo.routeTo === "hairdresser"
        ? this.bookingInfo.hairdresser.addressString
        : this.bookingInfo.client.addressString;

    // First display the PUG template of the HTML
    const pugToHTML = pug.renderFile(
      `${__dirname}/../views/pugEmails/${PugTemplate}.pug`,
      {
        firstName: this.recepientFirstName,
        surname: this.recepientSurname,
        emailSubject: emailSubject,
        url: this.urlAPI,
        bookingInfo: this.bookingInfo,
        address: address,
        recepientFor,
      }
    );
    // console.log(this.recepientFirstName);
    // Set the Email settings
    const emailSettings = {
      from: this.senderEmail,
      to: this.recepientEmail,
      subject: emailSubject,
      html: pugToHTML,
      text: htmlToText(pugToHTML),
    };

    // Generate transport & discharge the email
    await this.generateEmailTransport().sendMail(emailSettings);
  }

  async newBooking(recepientFor) {
    await this.emailToSend(
      "bookingReq",
      "Your Appointment Request",
      recepientFor
    );
  }

  async acceptedBooking(recepientFor) {
    await this.emailToSend(
      "bookingAccepted",
      "Accepted Appointment Request",
      recepientFor
    );
  }

  async cancelBooking(recepientFor) {
    await this.emailToSend(
      "bookingCancelled",
      "Cancelled Appointment Request",
      recepientFor
    );
  }

  async completeBooking(recepientFor) {
    await this.emailToSend(
      "bookingCompleted",
      "Appointment Completed, How was it?",
      recepientFor
    );
  }

  async notifyReview(recepientFor) {
    await this.emailToSend(
      "newReview",
      "A Client added a review about you!",
      recepientFor
    );
  }
};
