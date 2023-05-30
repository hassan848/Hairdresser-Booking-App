import "@babel/polyfill";
import { renderLoadingSpinner, renderSidebarSpinner } from "./renderSpinner";
import {
  getCoordinates,
  buildSendQuery,
  renderBottomFirst,
  embedMap,
  addSelfMarker,
  renderHairdressers,
  renderTiles,
  removeMarkers,
  addRemainingMarkers,
  moveToMarkerLocation,
  setDefaultMapView,
} from "./findHairdressersBuild";

import { inputPassword, getNewPassword } from "./manageForgotPass";

import { loginAccount, signOutUser } from "./login";
import { manageClientSignup } from "./clientSignup";
import { manageHairdresserSignup } from "./hairdresserSignup";
import { manageWorkSchedule } from "./workSchedulesSettings";

import {
  profileSettings,
  updateAddressForm,
  updateCurImg,
  updateProximityForm,
} from "./updateUser";

import { manageMyBookings, manageMyBookingsClient } from "./manageBookings";

import { retrieveCookie, addUserQueryCookie } from "./manageCookies";

import { addHairdresserMap } from "./hairdresserProfileMap";
import { manageServicesSec, manageCalendarView } from "./viewHairdresser";

import { manageMyServices } from "./myServices";
import { recommendHairdressers } from "./recommendHairdressers";
import { bookmarkedHairdressers } from "./bookmarkedHairdressers";

const googleDefined = (callback) =>
  typeof google !== "undefined"
    ? callback()
    : setTimeout(() => googleDefined(callback), 100);

export const findState = {
  userCords: {
    latitude: undefined,
    longitude: undefined,
    // latitude: 51.4978153,
    // longitude: -0.1011675,
    // LSBU Coordinates
  },
  search: {
    proximity: 2,
    proximityKM: 3.21869,
    query: "&proximity=2",
    hairdresserResults: [],
  },
  mapView: {
    map: undefined,
    markers: undefined,
  },
  stateChanged: false,
};

let mapInitialised = false;

// let userCords = {
//   latitude: 51.4978153,
//   longitude: -0.1011675,
//   // LSBU Coordinates
// };
let autoComplete;
let place_id;

// EVENT LISTENER FUNCTIONS

const initialiseMobileFilterBtn = function (e) {
  // e.preventDefault();
  if (
    e.target.classList.contains("filter-btn--mobile-el") ||
    e.target.classList.contains("mobile-outline--icon")
  ) {
    e.preventDefault();
    filterBtnForm.classList.add("open--filter");
  } else if (e.target.classList.contains("mobile-filter--icon--close")) {
    e.preventDefault();
    filterBtnForm.classList.remove("open--filter");
  }
};

const tabEvent = function (e) {
  const clickedTab = e.target.closest(".tab-button");
  // console.log(clickedTab, e.target);

  if (!clickedTab) return;
  bothTabs.forEach((tab) => tab.classList.remove("tab-button--active"));
  clickedTab.classList.add("tab-button--active");

  // Replace correct content using toggle
  if (clickedTab.textContent === "Map View") {
    cardView.classList.add("card-results__content--inactive");
    mapView.classList.remove("card-results__content--inactive");
    if (findState.mapView.map === undefined) {
      embedMap();
    } else {
      if (findState.stateChanged) {
        if (findState.mapView.markers) removeMarkers();
        addSelfMarker();
        console.log("new self marker");
        addRemainingMarkers();
      }
    }

    // findState.mapView.map.setView(
    //   [findState.userCords.latitude, findState.userCords.longitude],
    //   13
    // );

    if (findState.stateChanged) {
      renderTiles();
      findState.stateChanged = false;
      if (findState.search.hairdresserResults.length > 0) {
        tileMovement();
      }
    }
  } else {
    cardView.classList.remove("card-results__content--inactive");
    mapView.classList.add("card-results__content--inactive");
  }
  // if (!cardView.classList.contains("card-results__content--inactive")) {
  //   cardView.classList.add("card-results__content--inactive");
  // } else {
  //   cardView.classList.remove("card-results__content--inactive");
  // }
};

const tileMovement = function () {
  initialiseTiles();

  hairdresserTile.forEach((e, i) =>
    e.addEventListener("click", function () {
      const remainingTile = hairdresserTile[i].nextElementSibling;
      // console.log(remainingTile);
      remainingTileList.forEach((curTile) => {
        if (!(curTile == remainingTile)) {
          curTile.classList.remove("remaining-tile-active");
        }
      });
      remainingTile.classList.toggle("remaining-tile-active");

      setTimeout(() => {
        // e.scrollIntoView({ behavior: "smooth" });
        // console.log(e.parentElement);
        topScrollPos = e.parentElement.offsetTop;
        // console.log(topScrollPos);
        // tilesScrolling.scrollTop = 0;
        tilesScrolling.scroll({ top: topScrollPos, behavior: "smooth" });
      }, 320);
      // tilesScrolling.scroll({ top: topScrollPos, behavior: "smooth" });
      moveToMarkerLocation(e);
      if (!remainingTile.classList.contains("remaining-tile-active")) {
        setDefaultMapView();
      }
    })
  );
};

export const filterDropdownMovement = function () {
  initialiseFilterElements();

  filterRating.addEventListener("change", () => {
    // console.log(filterRating.options[filterRating.selectedIndex].text);
    if (filterRating.selectedIndex == 0) {
      curFilterStar.innerHTML = `Show all <span class="filter-stars">${"★".repeat(
        5
      )}</span>`;
    } else {
      curFilterStar.innerHTML = `Show <span class="filter-stars">${"★".repeat(
        filterRating.selectedIndex
      )}</span>${filterRating.selectedIndex == 5 ? "'s only" : "or more"}`;
      // curFilterStar.style = `--star-rating: ${filterRating.selectedIndex}`;
    }
  });
};

export const moveToTile = (tileId) => {
  clickedTile = [...hairdresserTile].find((hdEl) => hdEl.dataset.id === tileId);
  const remainingTile = clickedTile.nextElementSibling;

  remainingTileList.forEach((curTile) => {
    if (!(curTile == remainingTile)) {
      curTile.classList.remove("remaining-tile-active");
    }
  });
  remainingTile.classList.toggle("remaining-tile-active");

  setTimeout(() => {
    // e.scrollIntoView({ behavior: "smooth" });
    // console.log(e.parentElement);
    topScrollPos = clickedTile.parentElement.offsetTop;
    // console.log(topScrollPos);
    // tilesScrolling.scrollTop = 0;
    tilesScrolling.scroll({ top: topScrollPos, behavior: "smooth" });
  }, 320);

  if (!remainingTile.classList.contains("remaining-tile-active")) {
    setDefaultMapView();
  }
};

const initialiseTiles = () => {
  hairdresserTile = document.querySelectorAll(".hairdresser-tile");
  remainingTileList = document.querySelectorAll(".remaining-tile");
  tilesScrolling = document.querySelector(".tiles");
};

const initialiseFilterElements = () => {
  filterRating = document.querySelector(".rating-options");
  curFilterStar = document.querySelector(".filter-star-text");
};

// DOM ELEMENTS
const loginForm = document.querySelector(".login-form");
const signOutButton = document.querySelector(".logout--btn");
const signupForm = document.querySelector(".form-1");
const hairdresserSignupForm = document.querySelector(".hairdresser-form-1");
const forgotPassContBtn = document.querySelector(".input_Email_Address");
const newPassForm = document.querySelector(".newPassForm");

const newEmailForm = document.querySelector(".nameEmailForm");
const addressForm = document.querySelector(".address-form");
const proximityForm = document.querySelector(".proximity-form");

const workSchedule_form = document.querySelector(".hairdresser-workSchedule");

// Manage Bookings - DOM ELEMENTS
const viewBooking_Hairdresser = document.querySelector(
  ".view-hairdresser--booking-detail"
);
const viewBooking_Client = document.querySelector(
  ".view-client--booking-detail"
);

const locationSearchBar = document.querySelector(".search-location-input");

const navHeader = document.querySelector(".header"); // Mobile Header Navigation
let filterBtnForm = document.querySelector(".filter-form"); // Mobile Filter btn

let filterRating = document.querySelector(".rating-options");
let curFilterStar = document.querySelector(".filter-star-text");
// const curFilterStar = document.querySelector(".block-star");

const hairdresserMap = document.getElementById("mapbox-map");
const serviceBtns = document.querySelectorAll(".service-btn");

const hairdresserServices = document.querySelectorAll(".my-service-cards");

export const selectedState = {
  allServices: [],
  selectedServices: [],
  totalPrice: 0,
  dates: undefined,
  slotSelected: false,
};

let applyFilter = document.querySelector(".apply-filter");
let resetFilterBtn = document.querySelector(".reset-filter");

// TabView Elements
let tabsContainer = document.querySelector(".contain-tab-buttons");
let bothTabs = document.querySelectorAll(".tab-button");
let cardView = document.querySelector(".hairdresser-card-conatiner");
let mapView = document.querySelector(".hairdresser-map-container");

// MapView Tile elements
let hairdresserTile = document.querySelectorAll(".hairdresser-tile");
let remainingTileList = document.querySelectorAll(".remaining-tile");
let tilesScrolling = document.querySelector(".tiles");

if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const inputPass = document.getElementById("password").value;
    const inputEmail = document.getElementById("email").value;
    const loginBtn = document.querySelector(".login--btn");
    loginBtn.textContent = "logging in...";
    loginBtn.disabled = true;
    loginBtn.classList.add("logging-in--btn");
    loginAccount(inputEmail, inputPass);
  });
}

if (signOutButton) {
  signOutButton.addEventListener("click", signOutUser);
}

if (signupForm) {
  manageClientSignup();
}

if (hairdresserSignupForm) {
  manageHairdresserSignup();
}

if (forgotPassContBtn) {
  inputPassword();
}

if (newPassForm) {
  getNewPassword();
}

if (viewBooking_Hairdresser) {
  manageMyBookings();
}

if (viewBooking_Client) {
  manageMyBookingsClient();
}

if (newEmailForm) {
  profileSettings();
}

if (addressForm) {
  updateAddressForm();
}

if (proximityForm) {
  updateProximityForm();
}

if (workSchedule_form) {
  manageWorkSchedule();
}

if (document.querySelector(".recommended-heading")) {
  recommendHairdressers();
}

if (document.querySelector(".bookmarked-heading")) {
  bookmarkedHairdressers();
}

if (navHeader) {
  navHeader.addEventListener("click", function (e) {
    console.log(e.target.classList);
    if (
      e.target.classList.contains("mobile-nav--icon") ||
      e.target.classList.contains("mobile-nav--icon--close")
    ) {
      navHeader.classList.toggle("open--nav");
    }

    if (e.target.classList.contains("nav__element")) {
      navHeader.classList.remove("open--nav");
    }
  });
}

if (filterBtnForm) {
  filterBtnForm.addEventListener("click", initialiseMobileFilterBtn);
}

if (document.querySelector(".profile--img-pic")) {
  updateCurImg();
}

if (filterRating) {
  filterRating.addEventListener("change", () => {
    // console.log(filterRating.options[filterRating.selectedIndex].text);
    if (filterRating.selectedIndex == 0) {
      curFilterStar.innerHTML = `Show all <span class="filter-stars">${"★".repeat(
        5
      )}</span>`;
    } else {
      curFilterStar.innerHTML = `Show <span class="filter-stars">${"★".repeat(
        filterRating.selectedIndex
      )}</span>${filterRating.selectedIndex == 5 ? "'s only" : "or more"}`;
      // curFilterStar.style = `--star-rating: ${filterRating.selectedIndex}`;
    }
  });
}

if (tabsContainer) {
  tabsContainer.addEventListener("click", function (e) {
    const clickedTab = e.target.closest(".tab-button");
    // console.log(clickedTab, e.target);

    if (!clickedTab) return;
    bothTabs.forEach((tab) => tab.classList.remove("tab-button--active"));
    clickedTab.classList.add("tab-button--active");

    // Replace correct content using toggle
    if (clickedTab.textContent === "Map View") {
      cardView.classList.add("card-results__content--inactive");
      mapView.classList.remove("card-results__content--inactive");
      // if (map === undefined) embedMap();
    } else {
      cardView.classList.remove("card-results__content--inactive");
      mapView.classList.add("card-results__content--inactive");
    }
    // if (!cardView.classList.contains("card-results__content--inactive")) {
    //   cardView.classList.add("card-results__content--inactive");
    // } else {
    //   cardView.classList.remove("card-results__content--inactive");
    // }
  });
}

// DELEGATING ELEMENTS TO DATA & FUNCTIONS
if (hairdresserMap) {
  const hairdresserID = document.querySelector(".header-landing").dataset.id;
  let prevQuery = retrieveCookie("previousQuery");

  let clientNHairdresser;

  if (prevQuery) {
    prevQuery = JSON.parse(prevQuery);
    const clientData = prevQuery.hairdresserResults.find(
      (cookieVal) => hairdresserID == cookieVal._id
    );
    // console.log(prevQuery.userCords, prevQuery);
    const hairdresserLocation = document.querySelector(
      ".hairdresser-header-section"
    ).dataset.location;
    if (clientData) {
      clientNHairdresser = [
        {
          // coordinates: [0.07472731359644187, 51.5656099722796],
          coordinates: JSON.parse(hairdresserLocation),
        },
        {
          coordinates: [
            prevQuery.userCords.longitude,
            prevQuery.userCords.latitude,
          ],
        },
      ];
    } else {
      const clientLocation = document.querySelector(".select-date-section");
      if (clientLocation.dataset.usercoords) {
        clientNHairdresser = [
          {
            // coordinates: [0.07472731359644187, 51.5656099722796],
            coordinates: JSON.parse(hairdresserLocation),
          },
          {
            coordinates: JSON.parse(clientLocation.dataset.usercoords),
          },
        ];
      }
    }
  } else {
    const hairdresserLocation = document.querySelector(
      ".hairdresser-header-section"
    ).dataset.location;

    const clientLocation = document.querySelector(".select-date-section");
    if (clientLocation.dataset.usercoords) {
      clientNHairdresser = [
        {
          // coordinates: [0.07472731359644187, 51.5656099722796],
          coordinates: JSON.parse(hairdresserLocation),
        },
        {
          coordinates: JSON.parse(clientLocation.dataset.usercoords),
        },
      ];
    } else {
      // console.log(JSON.parse(hairdresserLocation));
      clientNHairdresser = [
        {
          // coordinates: [0.07472731359644187, 51.5656099722796],
          coordinates: JSON.parse(hairdresserLocation),
        },
      ];
    }
  }
  addHairdresserMap(clientNHairdresser);
  manageServicesSec(serviceBtns);
  manageCalendarView();
}

if (hairdresserServices.length > 0) {
  manageMyServices(hairdresserServices);
}

/* ################################################################################
    GOOOGLE DEFINED
   ###############################################################################
*/

// if (!serviceBtns.length === 0) {
//   manageServicesSec(serviceBtns);
//   console.log("lolololo");
// }

googleDefined(() => {
  if (!locationSearchBar) return;
  autoComplete = new google.maps.places.Autocomplete(
    document.querySelector(".search-location-input"),
    {
      componentRestrictions: { country: ["uk"] },
      fields: ["place_id", "geometry", "name"],
    }
  );
  autoComplete.addListener("place_changed", async () => {
    const place = autoComplete.getPlace();
    place_id = place.place_id;
    // console.log(place_id);
    // const mark = new google.maps.Marker({
    //   position: place.geometry.location,
    //   title: place.name,
    // });
    // console.log(mark);

    // 1) check if coordinates exist i.e. map is not added.
    if (!(findState.userCords.latitude === undefined)) {
      // Get coordinates & continue as normal
    } else {
      // get coordinates and render bottom half
      // add here
      if (!mapInitialised) {
        mapInitialised = true;
        renderBottomFirst();
        filterDropdownMovement();
        filterBtnForm = document.querySelector(".filter-form");
        tabsContainer = document.querySelector(".contain-tab-buttons");
        bothTabs = document.querySelectorAll(".tab-button");
        cardView = document.querySelector(".hairdresser-card-conatiner");
        mapView = document.querySelector(".hairdresser-map-container");
        applyFilter = document.querySelector(".apply-filter");
        resetFilterBtn = document.querySelector(".reset-filter");
        tabsContainer.addEventListener("click", tabEvent);
        applyFilter.addEventListener("click", buildQuery);
        resetFilterBtn.addEventListener("click", resetFilter);
        filterBtnForm.addEventListener("click", initialiseMobileFilterBtn);
      }
    }

    await getCoordinates(place_id);
    console.log(findState.userCords);
    if (!(findState.mapView.map === undefined)) {
      if (findState.mapView.markers) removeMarkers();
      addSelfMarker();
      console.log("new self marker");
      addRemainingMarkers();
    }

    renderLoadingSpinner(cardView);
    renderSidebarSpinner(document.querySelector(".tiles"));
    await buildSendQuery(); // MIGHT NEED TO MOVE THIS ONE STEP ABOVE TO ACCOUNT FOR QUERIES THAT TAKE LONG TO RENDER WHICH WONT APEAR ON MAP THE FIRST TIME
    findState.stateChanged = true;
    renderHairdressers();
    if (!(findState.mapView.map === undefined)) {
      renderTiles();
    }
    if (findState.search.hairdresserResults.length > 0) {
      addUserQueryCookie("previousQuery", {
        hairdresserResults: findState.search.hairdresserResults,
        userCords: findState.userCords,
      });
      tileMovement();
      // console.log(JSON.parse(retrieveCookie("previousQuery")));
    }
    console.log(findState.search.hairdresserResults);
  });
});

const buildQuery = async (e) => {
  e.preventDefault();

  // 1) PROXIMITY RADIUS
  const filterProximity = document.querySelector(".distance-input").value;
  const proximityUnitEl = document.querySelector(".distance_unit-metric");
  const proximityUnit =
    proximityUnitEl.options[proximityUnitEl.selectedIndex].value;
  console.log(filterProximity, proximityUnit);
  // if (proximityUnit == "mi") {
  //   findState.search.proximityKM = filterProximity * 1.609;
  // } else {
  //   findState.search.proximityKM = filterProximity;
  //   findState.search.filterProximity = filterProximity / 1.609;
  // }
  if (!(filterProximity === "")) {
    if (proximityUnit == "mi") {
      findState.search.query = `&proximity=${filterProximity}`;
      findState.search.proximity = filterProximity;
      findState.search.proximityKM = filterProximity * 1.609;
    } else {
      findState.search.proximityKM = filterProximity;
      findState.search.proximity = filterProximity / 1.609;
      findState.search.query = `&proximity=${filterProximity / 1.609}`;
    }
  } else {
    findState.search.query = `&proximity=2`;
    findState.search.proximity = 2;
    findState.search.proximityKM = 3.21869;
  }

  // 2) STAR RATING
  const starRatingEl = document.querySelector(".rating-options");
  const starNumber =
    starRatingEl.options[starRatingEl.selectedIndex].value.charAt(0);
  console.log(starNumber);
  if (!(starNumber === "s")) {
    findState.search.query = `${findState.search.query}&starRating[gte]=${starNumber}`;
  }

  // SERVICE FOR GENDER
  const serviceAll = document.querySelector(".gender-checkbox-all").checked;
  const serviceUnisex = document.querySelector("#unisex").checked;
  const serviceMale = document.querySelector(".gender-checkbox-male").checked;
  const serviceFemale = document.querySelector(
    ".gender-checkbox-female"
  ).checked;
  if (!serviceAll && !(serviceUnisex && serviceMale && serviceFemale)) {
    let serviceString = "";
    // console.log("not all");
    if (serviceUnisex) {
      if (serviceMale) {
        serviceString = "genderMarket[ne]=female";
      } else if (serviceFemale) {
        serviceString = "genderMarket[ne]=male";
      } else {
        serviceString = "genderMarket=unisex";
      }
    } else if (serviceMale) {
      if (serviceFemale) {
        serviceString = "genderMarket[ne]=unisex";
      } else {
        serviceString = "genderMarket=male";
      }
    } else if (serviceFemale) {
      serviceString = "genderMarket=female";
    }
    findState.search.query = `${findState.search.query}&${serviceString}`;
  }
  console.log(serviceAll, serviceUnisex, serviceMale, serviceFemale);

  // HAIRDRESSER WORK FLOW
  const workFlowMethod = document.querySelector(
    `input[name="work_direction-preference"]:checked`
  ).value;
  console.log(workFlowMethod);
  if (!(workFlowMethod === "both")) {
    findState.search.query = `${findState.search.query}&workFlowDirection=${workFlowMethod}`;
  }

  console.log(findState.search.query);

  if (
    document.querySelector(".filter-form").classList.contains("open--filter")
  ) {
    document.querySelector(".filter-form").classList.remove("open--filter");
  }

  renderLoadingSpinner(cardView);
  renderSidebarSpinner(document.querySelector(".tiles"));
  await buildSendQuery();
  findState.stateChanged = true;
  if (!(findState.mapView.map === undefined)) {
    if (findState.mapView.markers) removeMarkers();
    addSelfMarker();
    console.log("new self marker");
    addRemainingMarkers();
  }
  renderHairdressers();
  if (!(findState.mapView.map === undefined)) {
    renderTiles();
  }
  if (findState.search.hairdresserResults.length > 0) {
    addUserQueryCookie("previousQuery", {
      hairdresserResults: findState.search.hairdresserResults,
      userCords: findState.userCords,
    });
    tileMovement();
  }
};
// buildSendQuery();
// login("jayjayokocha@hotmail.co.uk", "Hassan123");

// function getCookie(cname) {
//   let name = cname + "=";
//   let decodedCookie = decodeURIComponent(document.cookie);
//   let ca = decodedCookie.split(";");
//   for (let i = 0; i < ca.length; i++) {
//     let c = ca[i];
//     while (c.charAt(0) == " ") {
//       c = c.substring(1);
//     }
//     if (c.indexOf(name) == 0) {
//       return c.substring(name.length, c.length);
//     }
//   }
//   return "";
// }

const resetFilter = (e) => {
  e.preventDefault();
  document.querySelector(".distance-input").value = "";

  document.getElementById("rating-selections").value = "show-all";
  const curFilterStar = document.querySelector(".filter-star-text");
  curFilterStar.innerHTML = `Show all <span class="filter-stars">${"★".repeat(
    5
  )}</span>`;

  document.getElementById("all").checked = true;
  document.getElementById("unisex").checked = false;
  document.getElementById("male").checked = false;
  document.getElementById("female").checked = false;

  document.getElementById("both").checked = true;
};
