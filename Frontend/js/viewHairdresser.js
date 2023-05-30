// const serviceBtns = document.querySelectorAll(".service-btn");
// const addedBar = document.querySelector('.bar-notify');
// let bar = document.querySelector(".bar-notify");
// let bar_close = document.querySelector(".bar-notify-close");
// let timeBar;
// let timeBarClose;

// const selectedState = {
//   selectedServices: [],
//   totalPrice: 0,
// };
import axios from "axios";

import { renderAppMsg } from "./displayAppMsg";
import { selectedState } from "./index";
import { callBookingAPI, getDayBookings } from "./callBookingAPI";
import {
  renderLoadingSpinner,
  renderBookmarkingSpinner,
} from "./renderSpinner";
import "@babel/polyfill";

// serviceBtns.forEach((serviceBtn) =>
//   serviceBtn.addEventListener("click", () => {
//     if (serviceBtn.classList.contains("add-service-btn")) {
//       serviceBtn.classList.remove("add-service-btn");
//       serviceBtn.classList.add("remove-service-btn");
//       serviceBtn.textContent = "Remove Service";

//       Snackbar.show({
//         text: "Example notification text.",
//         customClass: ".bar-notify",
//       });
//       console.log(Snackbar);
//     } else {
//       serviceBtn.classList.remove("remove-service-btn");
//       serviceBtn.classList.add("add-service-btn");
//       serviceBtn.textContent = "Add Service";
//     }
//   })
// );

const displayServices = (searchServices) => {
  selectedState.allServices.forEach((service) => {
    service.style.display = "";
  });

  if (searchServices.length > 0) {
    searchServices.forEach((service) => {
      // console.log(service);
      service.style.display = "none";
    });
  }
};

// const displayServices = (searchServices) => {
//   const parentElement = document.querySelector(
//     ".hairdresser-services-container"
//   );
//   const serviceCardMarkup = searchServices.map((service) => {
//     return `<div class="service-card" data-serviceId="${service.id}">
//   <h3 class="service-title">${service.name}</h3>
//   <p class="service-price">${service.price}</p>
//   <p class="service-description">${service.description}</p>
//   <button class="service-btn add-service-btn">
//     Add to Service
//   </button>
// </div>`;
//   });

//   parentElement.innerHTML = "";
//   parentElement.insertAdjacentHTML("beforeend", serviceCardMarkup);
// };

const retrieveServices = () => {
  const allServiceCards = document.querySelectorAll(".service-card");
  // const hairdresserServices = {
  //   id: allServiceCards[0].dataset.serviceid,
  //   name: allServiceCards[0].children[0].textContent,
  //   price: allServiceCards[0].children[1].textContent,
  //   description: allServiceCards[0].children[2].textContent,
  // };
  selectedState.allServices = [...allServiceCards];
  console.log(selectedState.allServices);
  // selectedState.allServices = [...allServiceCards].map((service) => {
  //   return {
  //     id: service.dataset.serviceid,
  //     name: service.children[0].textContent,
  //     price: service.children[1].textContent,
  //     description: service.children[2].textContent,
  //   };
  // });
};

export const manageServicesSec = (serviceBtns) => {
  retrieveServices();
  // const addedBar = document.querySelector('.bar-notify');
  const serviceSearchBar = document.querySelector(".search-services-input");
  let bar = document.querySelector(".bar-notify");
  let bar_close = document.querySelector(".bar-notify-close");
  let timeBar;
  let timeBarClose;
  const continueBtn = document.querySelector(".proceed-button");
  const selectDateSect = document.querySelector(".select-date-section");
  continueBtn.addEventListener("click", (e) => {
    const bookingSectCoords = selectDateSect.getBoundingClientRect();

    window.scrollTo({
      left: bookingSectCoords.left + document.pageXOffset,
      top: bookingSectCoords.top + window.pageYOffset + 80,
      behavior: "smooth",
    });

    // selectDateSect.scrollIntoView({ behavior: "smooth" });
  });
  continueBtn.disabled = true;

  // ADD Event Listener to services searchbar
  serviceSearchBar.addEventListener("keyup", (e) => {
    const searchValue = e.target.value.toLowerCase();
    const filteredServices = selectedState.allServices.filter((serviceObj) => {
      return !serviceObj.children[0].textContent
        .toLowerCase()
        .includes(searchValue);
    });

    // console.log(filteredServices);
    displayServices(filteredServices);
  });

  serviceBtns.forEach((serviceBtn) =>
    serviceBtn.addEventListener("click", (e) => {
      const clickedServiceEL = e.target.parentElement.children;
      if (serviceBtn.classList.contains("add-service-btn")) {
        // console.log("working");
        if (timeBar) {
          // console.log("check");
          bar.style.opacity = "0";
          clearTimeout(timeBar);
          bar.classList.remove("show");
          // console.log(bar.classList);
        }
        serviceBtn.classList.remove("add-service-btn");
        serviceBtn.classList.add("remove-service-btn");
        serviceBtn.textContent = "Remove Service";

        ////////// calc prices /////////
        const servicePrice = Number(
          clickedServiceEL[1].textContent.substring(1)
        );
        selectedState.selectedServices.push({
          serviceTitle: clickedServiceEL[0].textContent,
          servicePrice: servicePrice,
          serviceId: clickedServiceEL[0].parentElement.dataset.serviceid,
        });
        // const price = clickedServiceEL[1].innerHTML.substring(1);
        // console.log(
        //   selectedState.selectedServices,
        //   parseFloat(+price),
        //   parseFloat("8.23"),
        //   clickedServiceEL[0].parentElement.dataset.serviceid
        // );
        // (Math.round(servicePrice * 100) / 100).toFixed(2);
        selectedState.totalPrice += servicePrice;

        updateServiceTill();
        ////////////////////////////////

        bar.style.opacity = "1";
        bar.classList.add("show");
        timeBar = setTimeout(() => {
          bar.classList.remove("show");
        }, 2000);
        document.querySelector(".close-bar").addEventListener("click", (e) => {
          bar.style.opacity = "0";
          bar.classList.remove("show");
          clearTimeout(timeBar);
        });
      } else {
        serviceBtn.classList.remove("remove-service-btn");
        serviceBtn.classList.add("add-service-btn");
        serviceBtn.textContent = "Add to Service";

        const indexToRemove = selectedState.selectedServices.findIndex(
          (service) => {
            return (
              service.serviceId ==
              clickedServiceEL[0].parentElement.dataset.serviceid
            );
          }
        );
        selectedState.selectedServices.splice(indexToRemove, 1);
        console.log(selectedState.selectedServices, indexToRemove);

        selectedState.totalPrice -= Number(
          clickedServiceEL[1].textContent.substring(1)
        );

        updateServiceTill();

        bar_close.classList.add("show");
        timeBarClose = setTimeout(() => {
          bar_close.classList.remove("show");
        }, 2000);
      }

      if (selectedState.selectedServices.length === 0) {
        continueBtn.disabled = true;
      } else {
        continueBtn.disabled = false;
      }
    })
  );

  const bookingBtn = document.querySelector(".booking-btn2");
  if (bookingBtn) {
    bookingBtn.addEventListener("click", async () => {
      if (!selectedState.selectedServices.length > 0) {
        renderAppMsg("failure", "Please select at least 1 Service");
        return;
      }

      if (!selectedState.slotSelected) {
        renderAppMsg("failure", "Please select a Time Slot");
        return;
      }

      const slotInfo = JSON.parse(
        document.querySelector(".slot--active").dataset.slotinfo
      );
      // console.log(JSON.parse(slotInfo));
      // console.log(selectedState);
      // console.log(document.querySelector(".header-landing").dataset.id);
      const selectedSerArr = [];
      selectedState.selectedServices.forEach((ser) => {
        selectedSerArr.push({
          serviceId: ser.serviceId,
          serviceName: ser.serviceTitle,
          servicePrice: ser.servicePrice,
        });
        // selectedSerArr.push(ser.serviceId)
      });

      // console.log(selectedSerArr);
      const bookingObj = {
        hairdresser: {
          hairdresserId: document.querySelector(".header-landing").dataset.id,
          name: document.querySelector(".hairdresser--name").textContent,
          email: document.querySelector(".hairdresser--email").dataset.email,
          addressString: document.querySelector(".addr").dataset.address,
          profileImg: document.querySelector(".header-profile-photo").dataset
            .hairdresserpic,
        },
        client: {
          clientId: document.querySelector(".make-booking").dataset.clientid,
          name: document.querySelector(".total-booking--price").dataset
            .clientname,
          email: document.querySelector(".booking-btn2").dataset.clientemail,
          addressString:
            document.querySelector(".client-addr").dataset.clientaddr,
          profileImg: document.querySelector(".header-profile-rating").dataset
            .profilepic,
        },
        services: selectedSerArr,
        totalPrice: selectedState.totalPrice,
        startDate: slotInfo.slotStartDate,
        endDate: slotInfo.slotEndDate,
        routeTo: document.querySelector(".calendar-address").dataset.worktype,
        distance: document.querySelector(".distance-from-hairdresser").dataset
          .distance,
      };

      if (bookingObj.routeTo == "client") {
        if (selectedState.homeAppointCost) {
          // const finalPrice = selectedState.homeAppointCost !=
          bookingObj.homeAppointCost = selectedState.homeAppointCost;
          const totalPrice = (
            Number(bookingObj.totalPrice) +
            Number(selectedState.homeAppointCost)
          ).toFixed(2);

          bookingObj.totalPrice = totalPrice;
        } else {
          bookingObj.homeAppointCost = 0;
        }
      }
      // console.log(bookingObj);
      bookingBtn.disabled = true;
      bookingBtn.textContent = "Booking...";
      bookingBtn.classList.add("logging-in--btn");
      await callBookingAPI(bookingObj);
    });
  }
};

const updateServiceTill = () => {
  const parentElement = document.querySelector(".amount-elements");
  const tillServicesMarkup = renderTillServiceMarkup();

  parentElement.innerHTML = "";
  parentElement.insertAdjacentHTML("afterbegin", tillServicesMarkup);
  renderServicesTotal();
  renderFinalBookingCost();
};

const renderTillServiceMarkup = () => {
  return selectedState.selectedServices
    .map((service) => {
      return `<div class="service-name-amount">
    <span class="service-el-name">${service.serviceTitle}</span>
    <span>£${(Math.round(service.servicePrice * 100) / 100).toFixed(2)}</span>
  </div>`;
    })
    .join("");
};
// (Math.round(service.servicePrice * 100) / 100).toFixed(2);

const renderServicesTotal = () => {
  // (Math.round(servicePrice * 100) / 100).toFixed(2);
  const totalServices = (
    Math.round(selectedState.totalPrice * 100) / 100
  ).toFixed(2);
  const parentElement = document.querySelector(".services-total-cl");
  const totalServicesMarkup = `<h2 class="total-title">Services Total</h2>
  <span>£${totalServices}</span>`;

  parentElement.innerHTML = "";
  parentElement.insertAdjacentHTML("afterbegin", totalServicesMarkup);
  // console.log(totalServices);
};

const renderFinalBookingCost = () => {
  const totalServices = (
    Math.round(selectedState.totalPrice * 100) / 100
  ).toFixed(2);
  if (selectedState.homeAppointCost || selectedState.homeAppointCost == 0) {
    const servicesTotal = (document.querySelector(
      ".services-final--total1"
    ).textContent = `£${totalServices}`);
    const totalPrice = (
      Number(totalServices) + Number(selectedState.homeAppointCost)
    ).toFixed(2);
    // console.log(totalPrice);

    document.querySelector(
      ".final-cost--total2"
    ).textContent = `£${totalPrice}`;
  } else {
    const servicesTotal = (document.querySelector(
      ".services-final--total1"
    ).textContent = `£${totalServices}`);

    document.querySelector(
      ".final-cost--total2"
    ).textContent = `£${totalServices}`;
  }
};

export const manageCalendarView = async () => {
  const calendarDaysParent = document.querySelector(".seven-days");
  const dateDaysMarkup = renderDateDaysMarkup();

  calendarDaysParent.innerHTML = "";
  calendarDaysParent.insertAdjacentHTML("beforeend", dateDaysMarkup);

  initialiseDatesELs();
  await displaySlots();
  initialiseSlotELs();
};

const renderDateDaysMarkup = () => {
  const todayDate = new Date();
  const markup = [];
  const dates = {};
  for (let i = 0; i < 7; i++) {
    let selected = "";
    if (i != 0) todayDate.setDate(todayDate.getDate() + 1);
    if (i == 0) selected = "specific-date--active";
    const day = todayDate.toString().substring(0, 3).toLowerCase();
    let strMarkup = `<div class="specific-date ${selected}" data-curDate=${todayDate.toISOString()}>
    <p class="day">${day.charAt(0).toUpperCase() + day.slice(1)}</p>
    <p class="day-date">${todayDate.getDate()}</p>
    </div>`;
    markup.push(strMarkup);
    dates[day] = todayDate.toISOString();
    console.log(
      todayDate.getDate(),
      todayDate.toString().substring(0, 3).toLowerCase()
    );
  }
  selectedState.dates = dates;
  return markup.join("");
};

const displaySlots = async () => {
  const hairdresserSchedule = JSON.parse(
    document.querySelector(".calendar").dataset.schedule
  );
  const selectedDate = document.querySelector(".specific-date--active");
  const day = selectedDate.children[0].textContent;
  if (hairdresserSchedule[day.toLowerCase()].work_type === "dayoff") {
    clearSlots();
    clearCalendarMessage();
    addDayoffmessage();
    return;
  } else if (hairdresserSchedule[day.toLowerCase()].work_type === "shop") {
    addCalendarMessage("shop");
  } else if (hairdresserSchedule[day.toLowerCase()].work_type === "home") {
    const invalidProximity = addCalendarMessage("home");
    if (!invalidProximity) {
      addInvalidAppointMsg();
      return;
    }
  }

  // console.log(selectedDate.dataset.curdate);
  renderLoadingSpinner(document.querySelector(".appointments"));
  const curDateBookings = await getDayBookings(
    selectedDate.dataset.curdate,
    document.querySelector(".header-landing").dataset.id
  );
  selectedState.curDateBookings = curDateBookings;

  // console.log(curDateBookings);

  const bothTimes =
    hairdresserSchedule[day.toLowerCase()].work_hours.split("-");
  const startTime = bothTimes[0];
  const endTime = bothTimes[1];

  const daySelected = new Date(selectedState.dates[day.toLowerCase()]);
  // console.log(selectedState, "ANY ONE");
  const date1 = new Date(
    daySelected.getFullYear(),
    daySelected.getMonth(),
    daySelected.getDate(),
    `${startTime.split(":")[0]}`,
    `${startTime.split(":")[1]}`
  );

  // console.log("looool", daySelected);
  // console.log("loool22", date1);

  const minutesGapProperty = hairdresserSchedule[day.toLowerCase()].slot_gap;
  const gapMinutesToAdd = minutesGapProperty.split(":")[1];
  const gapHrToAdd = minutesGapProperty.split(":")[0];
  const minutesDate = new Date(
    0,
    0,
    0,
    gapHrToAdd,
    gapMinutesToAdd,
    0
  ).getMinutes();

  const minutesLengthProperty =
    hairdresserSchedule[day.toLowerCase()].slot_length;
  const lengthMinutesToAdd = minutesLengthProperty.split(":")[1];
  const lengthHrToAdd = minutesLengthProperty.split(":")[0];
  const lengthMinutesDate = new Date(
    0,
    0,
    0,
    0,
    lengthMinutesToAdd,
    0
  ).getMinutes();
  // console.log(minutesDate);
  // console.log(minutesToAdd.split(":")[1], "lololol");
  // console.log(minutesToAdd);

  const date2 = new Date(
    daySelected.getFullYear(),
    daySelected.getMonth(),
    daySelected.getDate(),
    `${endTime.split(":")[0]}`,
    `${endTime.split(":")[1]}`
  );

  const appointmentParent = document.querySelector(".appointments");
  clearSlots();

  while (date1 < date2) {
    // console.log(date1);
    // console.log(date4.getHours() + ':' + date4.getMinutes());
    const start = date1.toLocaleString("en-GB").substring(12, 17);
    const startDate = date1.toISOString();
    if (lengthHrToAdd > 0)
      date1.setHours(date1.getHours() + Number(lengthHrToAdd));
    date1.setMinutes(date1.getMinutes() + Number(lengthMinutesDate));
    const end = date1.toLocaleString("en-GB").substring(12, 17);
    if (date1 > date2) break;
    // console.log(start + " - " + end);
    renderSlots(
      appointmentParent,
      start + " - " + end,
      new Date(startDate),
      date1.toISOString(),
      minutesLengthProperty
    );
    if (gapHrToAdd > 0) {
      console.log(gapHrToAdd);
      date1.setHours(date1.getHours() + Number(gapHrToAdd));
    }
    date1.setMinutes(date1.getMinutes() + Number(minutesDate));
    // console.log(date1, "loool");
  }

  // console.log(new Date(selectedState.dates["fri"]));
  // console.log(day.toLowerCase());
  // console.log(hairdresserSchedule[day.toLowerCase()]);
  // console.log(startTime, endTime, date1, date2);
};

const renderSlots = (parentEl, slotTime, slotDate, slotEndDate, slotLength) => {
  let slotTaken = "";
  if (new Date() > slotDate) {
    slotTaken = "slot--taken";
  } else {
    // console.log(selectedState.curDateBookings);
    if (selectedState.curDateBookings) {
      selectedState.curDateBookings.data.bookings.forEach((booking) => {
        // console.log(new Date(booking.startDateTime) >= slotDate);
        // console.log(new Date(booking.startDateTime), slotDate);
        if (
          new Date(booking.startDateTime) >= slotDate &&
          new Date(booking.endDateTime) <= new Date(slotEndDate)
        ) {
          slotTaken = "slot--taken";
        } else if (
          new Date(booking.startDateTime) <= slotDate &&
          new Date(booking.endDateTime) >= new Date(slotEndDate)
        ) {
          slotTaken = "slot--taken";
        } else if (
          new Date(booking.startDateTime) <= slotDate &&
          new Date(booking.endDateTime) >= slotDate
          // new Date(booking.endDateTime) <= new Date(slotEndDate)
        ) {
          slotTaken = "slot--taken";
        } else if (
          new Date(booking.startDateTime) >= slotDate &&
          new Date(booking.startDateTime) <= new Date(slotEndDate)
        ) {
          slotTaken = "slot--taken";
        }
      });
    }
  }

  const slotData = {
    slotStartDate: slotDate.toISOString(),
    slotEndDate,
    slotLength,
  };

  const slotMarkup = `<div class="appointment-slot ${slotTaken}" data-slotInfo=${JSON.stringify(
    slotData
  )}>${slotTime}</div>`;
  parentEl.insertAdjacentHTML("beforeend", slotMarkup);
};

const clearSlots = () => {
  const appointmentParent = document.querySelector(".appointments");
  appointmentParent.classList.remove("appointments--calendar");
  appointmentParent.innerHTML = "";
};

const initialiseSlotELs = () => {
  let timeSlots = document.querySelectorAll(".appointment-slot");

  timeSlots.forEach((slot) => {
    if (slot.classList.contains("slot--taken")) return;
    slot.addEventListener("click", function (e) {
      const workType =
        document.querySelector(".calendar-address").dataset.worktype;
      // console.log(slot);
      // console.log(e.target);
      // if(slot.classList.contains('slot'))
      if (slot.classList.contains("slot--active")) {
        if (selectedState.homeAppointCost) selectedState.homeAppointCost = 0;
        if (workType == "client") {
          const home = document.querySelector(".day-info").dataset.cost;
          if (home) {
            removeHomeTillEL();
            renderFinalBookingCost();
          }
        }
        selectedState.slotSelected = false;
        slot.classList.remove("slot--active");
      } else {
        removeFromClasslist(timeSlots);
        slot.classList.add("slot--active");
        selectedState.selectedSlot = JSON.parse(slot.dataset.slotinfo);
        selectedState.slotSelected = true;

        // console.log(workType);
        if (workType === "client") {
          const home = document.querySelector(".day-info").dataset.cost;
          // console.log(home);
          if (home) {
            selectedState.homeAppointCost = home;
            addHomeAppoint(home);
            renderFinalBookingCost();
            // console.log("loololol");
          }
        }
      }
    });
  });
};

const addHomeAppoint = (cost) => {
  const existingElement = document.querySelector(".homeAppointTill");
  if (existingElement) existingElement.remove();
  const price = Number(cost);
  const markup = `<div class="services-total-cl--booking homeAppointTill">
  <h2 class="total-title--booking">Home Appointment Cost:</h2>
  <h2 class="total-title--booking">£${price.toFixed(2)}</h2>
  <!-- <span>£11.99</span> -->
</div>`;

  const syblingElement = document.querySelector(".total-final-booking--price");
  syblingElement.insertAdjacentHTML("beforebegin", markup);
};

const removeHomeTillEL = () => {
  const homeTill = document.querySelector(".homeAppointTill");
  if (homeTill) {
    homeTill.remove();
  }
};

const removeFromClasslist = (timeSlots) => {
  timeSlots.forEach((slot) => {
    if (slot.classList.contains("slot--taken")) return;
    // slot.classList.toggle("slot--active");
    slot.classList.remove("slot--active");
  });
};

const initialiseDatesELs = () => {
  const availableDates = document.querySelectorAll(".specific-date");

  availableDates.forEach((date) => {
    date.addEventListener("click", async function () {
      // const home = document.querySelector(".day-info").dataset.cost;
      if (date.classList.contains("specific-date--active")) return;
      if (selectedState.homeAppointCost) {
        selectedState.homeAppointCost = 0;
        removeHomeTillEL();
        renderFinalBookingCost();
      }
      selectedState.slotSelected = false;
      availableDates.forEach((date) => {
        date.classList.remove("specific-date--active");
      });
      date.classList.add("specific-date--active");

      await displaySlots();
      initialiseSlotELs();
    });
  });
};

const addCalendarMessage = (workType) => {
  const parentElement = document.querySelector(".day-info");
  const hairdresserAddr = document.querySelector(".addr").dataset.address;
  const homeAppointCost = document.querySelector(".day-info").dataset.cost;

  let homeAppointCheck = false;
  if (workType == "home") {
    const distance = document.querySelector(".distance-from-hairdresser");
    if (
      distance.dataset.distance &&
      distance.dataset.distance <=
        document.querySelector(".hairdresser-prox").dataset.proximity
    ) {
      homeAppointCheck = true;
    }
  }

  const dayInfoMarkup = `<h2>${
    workType === "shop"
      ? "Any slots on this Date requires you to travel to the hairdresser"
      : "This Hairdresser is doing home appointments on this date"
  }
</h2>
${
  workType === "shop"
    ? `<div class="arrow-address">
<span class="material-icons calendar-icon">
  arrow_right_alt
</span>
<p class="calendar-address" data-worktype="hairdresser">
  <span>Address: </span>${hairdresserAddr}
</p>
</div>`
    : `<div class="arrow-address">
    ${
      homeAppointCheck == false
        ? `<span class="material-icons calendar-icon-sm">
        near_me_disabled
      </span>
      <span class="material-icons calendar-icon-sm">
        priority_high
      </span>`
        : `<span class="material-icons calendar-icon">
    compare_arrows
  </span>
  <span class="material-icons calendar-icon"> home_work </span>`
    }
<p class="calendar-address" data-worktype="client">
  ${
    homeAppointCheck == false
      ? `Your distance from the hairdresser (${
          document.querySelector(".distance-from-hairdresser").dataset.distance
        } mi) is too far for the hairdresser to travel to you,<br> You must be within ${
          document.querySelector(".hairdresser-prox").dataset.proximity
        } miles of the hairdresser's proximity radius.`
      : `Home Appointments cost an additional
  <span class="home-cost">+ £${
    homeAppointCost != undefined ? homeAppointCost : "0"
  }</span>`
  }
</p>
</div>`
}`;

  parentElement.innerHTML = "";
  parentElement.insertAdjacentHTML("afterbegin", dayInfoMarkup);

  return homeAppointCheck;
};

const addDayoffmessage = () => {
  const parentElement = document.querySelector(".day-info");
  const dayoffMarkup = `<h2>This Hairdresser is not working on this day</h2>
  <div class="arrow-address">
    <span class="material-icons calendar-icon-sm">
      priority_high
    </span>
    <p class="calendar-address calendar-dayoff">
      The hairdresser takes a day-off on this date
    </p>
  </div>`;
  parentElement.innerHTML = "";
  parentElement.insertAdjacentHTML("afterbegin", dayoffMarkup);
  manageClassIcons();
};

const addInvalidAppointMsg = () => {
  const appointments = document.querySelector(".appointments");
  appointments.innerHTML = "";

  appointments.classList.add("appointments--calendar");

  const iconsMarkup = `<span class="material-icons dayoff-icons"> near_me_disabled </span>
  <span class="material-icons dayoff-icons"> wrong_location </span>
  <span class="material-icons dayoff-icons"> do_disturb </span>`;

  appointments.insertAdjacentHTML("afterbegin", iconsMarkup);
};

const manageClassIcons = () => {
  const parentElement = document.querySelector(".appointments");
  parentElement.classList.add("appointments--calendar");
  const iconsMarkup = `<span class="material-icons dayoff-icons"> today </span>
  <span class="material-icons dayoff-icons"> work_outline </span>
  <span class="material-icons dayoff-icons"> do_disturb </span>`;

  parentElement.insertAdjacentHTML("afterbegin", iconsMarkup);
};

const clearCalendarMessage = () => {
  const parentElement = document.querySelector(".day-info");
  parentElement.innerHTML = "";
};

// const parentElement = document.querySelector(".amount-elements");
// const tillServicesMarkup = renderTillServiceMarkup();

// parentElement.innerHTML = "";
// parentElement.insertAdjacentHTML("afterbegin", tillServicesMarkup);
// renderServicesTotal();

const bookmarkBtn = document.querySelector(".bookmark-btn--circle");
if (bookmarkBtn) {
  bookmarkBtn.addEventListener("click", async function () {
    if (document.querySelector(".bookmark-hairdresser")) {
      bookmarkBtn.disabled = true;
      document.querySelector(".bookmark-icon").remove();
      renderBookmarkingSpinner(bookmarkBtn);
      await addBookmark();
      bookmarkBtn.innerHTML = "";
      const bookmarkMarkup =
        '<ion-icon class="bookmark-icon bookmarked" name="bookmark"></ion-icon>';
      bookmarkBtn.insertAdjacentHTML("afterbegin", bookmarkMarkup);
      bookmarkBtn.disabled = false;
    } else {
      bookmarkBtn.disabled = true;
      document.querySelector(".bookmarked").remove();
      renderBookmarkingSpinner(bookmarkBtn);
      await removeBookmark();
      bookmarkBtn.innerHTML = "";
      const bookmarkMarkup =
        '<ion-icon class="bookmark-icon bookmark-hairdresser" name="bookmark-outline"></ion-icon>';
      bookmarkBtn.insertAdjacentHTML("afterbegin", bookmarkMarkup);
      bookmarkBtn.disabled = false;
    }
  });
}

export const addBookmark = async () => {
  try {
    await axios({
      method: "POST",
      url: "http://127.0.0.1:8000/api/clients/bookmark",
      data: {
        clientId: document.querySelector(".make-booking").dataset.clientid,
        hairdresserId: document.querySelector(".header-landing").dataset.id,
      },
    });
  } catch (error) {
    // console.log(error);
    renderAppMsg("failure", error.response.data.message);
  }
};

export const removeBookmark = async () => {
  try {
    await axios({
      method: "PATCH",
      url: "http://127.0.0.1:8000/api/clients/removeBookmark",
      data: {
        clientId: document.querySelector(".make-booking").dataset.clientid,
        hairdresserId: document.querySelector(".header-landing").dataset.id,
      },
    });
  } catch (error) {
    renderAppMsg("failure", error.response.data.message);
  }
};
