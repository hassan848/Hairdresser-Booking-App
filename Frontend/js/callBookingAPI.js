import axios from "axios";
import "@babel/polyfill";
import { renderAppMsg } from "./displayAppMsg";
// import { newBookingEmail } from "./../../utilities/bookingEmailHandler";
// import "@babel/polyfill";

export const callBookingAPI = async (bookingData) => {
  try {
    // console.log(bookingData);
    // const stringServices = JSON.stringify(bookingData.services);
    // console.log(JSON.parse(stringServices));
    // let reqURL = `http://127.0.0.1:8000/api/bookings/createBooking?hairdresser=${JSON.stringify(
    //   bookingData.hairdresser
    // )}&client=${JSON.stringify(bookingData.client)}&services=${JSON.stringify(
    //   bookingData.services
    // )}&totalPrice=${bookingData.totalPrice}&startDateTime=${
    //   bookingData.startDate
    // }&endDateTime=${bookingData.endDate}&routeTo=${
    //   bookingData.routeTo
    // }&distance=${bookingData.distance}`;

    // if (bookingData.homeAppointCost || bookingData.homeAppointCost == 0) {
    //   reqURL = reqURL.concat(`&homeAppointCost=${bookingData.homeAppointCost}`);
    // }
    // console.log(reqURL);

    const data = {
      hairdresser: bookingData.hairdresser,
      services: bookingData.services,
      client: bookingData.client,
      totalPrice: bookingData.totalPrice,
      startDateTime: bookingData.startDate,
      endDateTime: bookingData.endDate,
      routeTo: bookingData.routeTo,
      distance: bookingData.distance,
    };

    if (bookingData.homeAppointCost || bookingData.homeAppointCost == 0) {
      data.homeAppointCost = bookingData.homeAppointCost;
    }

    const sendReq = await axios({
      method: "POST",
      url: "http://127.0.0.1:8000/api/bookings/createBooking",
      data,
    });

    // console.log(sendReq.data);
    if (sendReq.data.status === "success") {
      renderAppMsg("successful", "Booked appointment Successfully!");
      // const bookingBtn = document.querySelector(".booking-btn2");
      // bookingBtn.textContent = "MAKE BOOKING";
      location.assign(
        `/bookingReqConfirmation/${sendReq.data.data.booking._id}`
      );
      // try {
      //   await new newBookingEmail(
      //     bookingData.client,
      //     "lol",
      //     sendReq.data.data
      //   ).newBooking();
      // } catch (error) {}
      // location.assign("/findHairdressers");
    }
  } catch (error) {
    const bookingBtn = document.querySelector(".booking-btn2");
    bookingBtn.disabled = false;
    bookingBtn.textContent = "MAKE BOOKING";
    bookingBtn.classList.remove("logging-in--btn");
    renderAppMsg("failure", error.response.data.message);
    console.log(error.response.data);
  }
};

//   console.log(bookingData);
//   console.log(
//     `http://127.0.0.1:8000/api/bookings/createBooking?hairdresser=${
//       bookingData.hairdresserId
//     }&client=${bookingData.clientId}&services=${JSON.stringify(
//       bookingData.services
//     )}&totalPrice=${bookingData.totalPrice}&startDateTime=${
//       bookingData.startDate
//     }&endDateTime=${bookingData.endDate}`
//   );

export const getDayBookings = async (timeString, hairdresserId) => {
  try {
    const sendReq = await axios({
      method: "GET",
      url: `http://127.0.0.1:8000/api/bookings/checkAvailBookings?dateToCheck=${timeString}&hairdresserId=${hairdresserId}`,
      //   data: {
      //     dateToCheck: timeString,
      //   },
    });
    if (sendReq.data.status === "success") {
      return sendReq.data;
    }
  } catch (error) {
    renderAppMsg("failure", error.response.data.message);
    return;
  }
};
