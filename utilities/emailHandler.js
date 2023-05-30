// Will use nodemailer package to send emails to users using NodeJS
const nodemailer = require("nodemailer");
const pug = require("pug");
const { htmlToText } = require("html-to-text");
// import "@babel/polyfill";

module.exports = class NewEmail {
  constructor(userToSend, urlAPI) {
    this.recepientEmail = userToSend.email;
    this.recepientFirstName = userToSend.name;
    this.recepientSurname = userToSend.surname;
    this.urlAPI = urlAPI;
    this.senderEmail = `Hassan Aslam <${process.env.SENDER_EMAIL}>`;
  }

  // 1) Generate a Transporter
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

  async emailToSend(PugTemplate, emailSubject) {
    // First display the PUG template of the HTML
    const pugToHTML = pug.renderFile(
      `${__dirname}/../views/pugEmails/${PugTemplate}.pug`,
      {
        firstName: this.recepientFirstName,
        surname: this.recepientSurname,
        emailSubject: emailSubject,
        url: this.urlAPI,
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

  async signupEmail() {
    await this.emailToSend(
      "signupEmail",
      "Welcome! you successfully signed up"
    );
  }

  async passworwResetEmail() {
    await this.emailToSend(
      "resetPassword",
      "Reset Token for password (valid for 10mins)"
    );
  }

  async newBooking() {
    await this.emailToSend("bookingReq", "Your Appointment Request");
  }
};

// const emailToSend = async function (settings) {
//   // 2) Set the Email settings
//   const emailSettings = {
//     from: "Hassan Aslam <hassanaslam786@hotmail.co.uk>",
//     to: settings.emailToSend,
//     subject: settings.subject,
//     text: settings.messageToSend,
//   };

//   // Discharge the Email
//   await emailTransporter.sendMail(emailSettings);
// };
