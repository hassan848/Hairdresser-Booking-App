// import filterDropdownMovement from "./index";
import "@babel/polyfill";
// import renderHairdressers from "./findHairdressersBuild";
import axios from "axios";
import { renderLoadingSpinner, renderSidebarSpinner } from "./renderSpinner";
import { addUserQueryCookie } from "./manageCookies";

const recommendState = {
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

// MapView Tile elements
let hairdresserTile = document.querySelectorAll(".hairdresser-tile");
let remainingTileList = document.querySelectorAll(".remaining-tile");
let tilesScrolling = document.querySelector(".tiles");

let cardView = document.querySelector(".hairdresser-card-conatiner");

const initialiseTiles = () => {
  hairdresserTile = document.querySelectorAll(".hairdresser-tile");
  remainingTileList = document.querySelectorAll(".remaining-tile");
  tilesScrolling = document.querySelector(".tiles");
};

export const recommendHairdressers = () => {
  const tabsContainer = document.querySelector(".recommend-tab-buttons");
  const bothTabs = document.querySelectorAll(".tab-button");

  cardView = document.querySelector(".hairdresser-card-conatiner");
  const mapView = document.querySelector(".hairdresser-map-container");

  const applyFilter = document.querySelector(".apply-filter");
  applyFilter.addEventListener("click", buildQuery);

  const resetFilterBtn = document.querySelector(".reset-filter");
  resetFilterBtn.addEventListener("click", resetFilter);

  // Dataset values
  const givenProximity =
    document.querySelector(".filter-proximity").dataset.proximity;
  recommendState.search.proximity = givenProximity;
  recommendState.search.proximityKM = givenProximity * 1.609;
  recommendState.search.query = `&proximity=${givenProximity}`;

  const hairdressers = JSON.parse(
    document.querySelector(".hairdresser-card-conatiner").dataset.hairdressers
  );
  recommendState.search.hairdresserResults = hairdressers;

  const userCoords = JSON.parse(
    document.querySelector(".recommend-title").dataset.coords
  );
  recommendState.userCords.latitude = userCoords[1];
  recommendState.userCords.longitude = userCoords[0];

  //   if (!(recommendState.mapView.map === undefined)) {
  // }
  if (recommendState.search.hairdresserResults.length > 0) {
    renderTiles();
    tileMovement();
  }
  //   console.log(recommendState);
  addUserQueryCookie("previousQuery", {
    hairdresserResults: recommendState.search.hairdresserResults,
    userCords: recommendState.userCords,
  });

  if (tabsContainer) {
    tabsContainer.addEventListener("click", (e) => {
      const clickedTab = e.target.closest(".tab-button");
      if (!clickedTab) return;

      bothTabs.forEach((tab) => tab.classList.remove("tab-button--active"));
      clickedTab.classList.add("tab-button--active");

      // Replace correct content using toggle
      if (clickedTab.textContent === "Map View") {
        cardView.classList.add("card-results__content--inactive");
        mapView.classList.remove("card-results__content--inactive");

        if (recommendState.mapView.map === undefined) {
          embedMap();
        } else {
          if (recommendState.stateChanged) {
            if (recommendState.mapView.markers) removeMarkers();
            addSelfMarker();
            console.log("new self marker");
            addRemainingMarkers();
          }
        }

        if (recommendState.stateChanged) {
          renderTiles();
          recommendState.stateChanged = false;
          if (recommendState.search.hairdresserResults.length > 0) {
            tileMovement();
          }
        }
      } else {
        cardView.classList.remove("card-results__content--inactive");
        mapView.classList.add("card-results__content--inactive");
      }
    });
  }
};

const embedMap = function () {
  recommendState.mapView.map = L.map("map").setView(
    [51.4978153, -0.1011675],
    14
  );

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(recommendState.mapView.map);

  recommendState.mapView.markers = L.layerGroup().addTo(
    recommendState.mapView.map
  );

  if (recommendState.userCords.latitude) {
    addSelfMarker();
  }
  if (recommendState.search.hairdresserResults.length > 0) {
    addRemainingMarkers();
  }
};

// if (tabsContainer) {
//   tabsContainer.addEventListener("click", function (e) {
//     const clickedTab = e.target.closest(".tab-button");
//     // console.log(clickedTab, e.target);

//     if (!clickedTab) return;
//     bothTabs.forEach((tab) => tab.classList.remove("tab-button--active"));
//     clickedTab.classList.add("tab-button--active");

//     // Replace correct content using toggle
//     if (clickedTab.textContent === "Map View") {
//       cardView.classList.add("card-results__content--inactive");
//       mapView.classList.remove("card-results__content--inactive");
//       // if (map === undefined) embedMap();
//     } else {
//       cardView.classList.remove("card-results__content--inactive");
//       mapView.classList.add("card-results__content--inactive");
//     }
//     // if (!cardView.classList.contains("card-results__content--inactive")) {
//     //   cardView.classList.add("card-results__content--inactive");
//     // } else {
//     //   cardView.classList.remove("card-results__content--inactive");
//     // }
//   });
// }

export const addSelfMarker = function () {
  // console.log(userCords.latitude, userCords.longitude);
  // console.log(findState.search.proximity);
  const radii = recommendState.search.proximity * 1609; // Convert miles to Metres
  const radiusCircle = L.circle(
    [recommendState.userCords.latitude, recommendState.userCords.longitude],
    radii
  ).addTo(recommendState.mapView.map);
  radiusCircle.addTo(recommendState.mapView.markers);

  const userMarker = L.marker([
    recommendState.userCords.latitude,
    recommendState.userCords.longitude,
  ])
    .addTo(recommendState.mapView.map)
    .bindPopup(
      L.popup({
        maxWidth: 250,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
        className: `user-popup`,
      })
    )
    .setPopupContent("Your Location")
    .openPopup()
    .on("click", function (e) {
      console.log("loool");
    });

  increaseIcon = userMarker.options.icon;
  increaseIcon.options.iconSize = [31, 50];
  userMarker.setIcon(increaseIcon);
  userMarker.valueOf()._icon.src = "/Frontend/img/leaflet-red-marker-icon.png";
  // userMarker.valueOf()._icon.style.color = "green";

  userMarker.addTo(recommendState.mapView.markers);

  recommendState.mapView.map.setView(
    [recommendState.userCords.latitude, recommendState.userCords.longitude],
    14,
    {
      animate: true,
      pan: {
        duration: 1,
      },
    }
  );

  // findState.mapView.map.fitBounds(radiusCircle.getBounds());
};

export const addRemainingMarkers = function () {
  recommendState.search.hairdresserResults.forEach((tileHairdresser) => {
    let directionIcon;

    if (tileHairdresser.genderMarket === "unisex") {
      directionIcon = "wc";
    } else if (tileHairdresser.genderMarket === "male") {
      directionIcon = "man";
    } else if (tileHairdresser.genderMarket === "female") {
      directionIcon = "woman";
    }

    const userMarker = L.marker([
      tileHairdresser.location.coordinates[1],
      tileHairdresser.location.coordinates[0],
    ])
      .addTo(recommendState.mapView.map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `hairdresser-popup`,
        })
      )
      .setPopupContent(
        `<div class="card-details">
        <span class="material-icons"> ${directionIcon} </span>
        <span>${tileHairdresser.fullName}</span>
      </div>`
      )
      .openPopup()
      .on("click", function (e) {
        moveToTile(tileHairdresser._id);
        userMarker.openPopup();
        moveOnMap(
          [
            tileHairdresser.location.coordinates[1],
            tileHairdresser.location.coordinates[0],
          ],
          15
        );
      });

    // increaseIcon = userMarker.options.icon;
    // increaseIcon.options.iconSize = [31, 50];
    // userMarker.setIcon(increaseIcon);
    userMarker.addTo(recommendState.mapView.markers);
  });

  recommendState.mapView.map.setView(
    [recommendState.userCords.latitude, recommendState.userCords.longitude],
    14,
    {
      animate: true,
      pan: {
        duration: 1,
      },
    }
  );
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

export const renderTiles = () => {
  const parentElement = document.querySelector(".tiles");
  const tilesMarkup = renderTilesMarkup();

  parentElement.innerHTML = "";
  parentElement.insertAdjacentHTML("afterbegin", tilesMarkup);
};

const renderTilesMarkup = () => {
  return (
    recommendState.search.hairdresserResults
      .map((tile) => {
        let directionIcon;

        if (tile.genderMarket === "unisex") {
          directionIcon = "wc";
        } else if (tile.genderMarket === "male") {
          directionIcon = "man";
        } else if (tile.genderMarket === "female") {
          directionIcon = "woman";
        }
        return `<div class="hairdresser-card hairdresser-card-tile">
      <div class="hairdresser-tile" data-id="${tile._id}">
        <div class="tile-top"></div>
        <div
          class="card-profile--partition tile-profile--partition"
        ></div>
        <img
          src="/Frontend/img/customers/${tile.profileImg}"
          alt="img of hairdresser"
          class="card-profile-photo tile-profile-photo"
        />
        <h3 class="card-name-heading tile-name-heading">
          <span>${tile.fullName}</span>
        </h3>
        <div class="profile-rating tile-rating">
          <div class="profile-stars tile-stars">
            <div class="star-rating-num tile-rating-num">${
              tile.starRating
            }</div>
            <div
              class="profile-star-rating tile-star-rating"
              style="--star-rating: ${tile.starRating}"
            ></div>
          </div>
          <span class="num-of-ratings">rating (${tile.numOfReviews})</span>
        </div>
        <div
          class="distance-to-hairdresser tile-distance-to-hairdresser"
        >
          <span class="material-icons place-icon tile-place-icon">
            place
          </span>
          <div class="distance tile-distance">
            <h3>${
              Math.round((tile.distance + Number.EPSILON) * 100) / 100
            } miles</h3>
            <span class="distance-msg tile-distance-msg"
              >away from you</span
            >
          </div>
        </div>
      </div>
      <div class="remaining-tile">
        <div class="hairdresser-card-description">
          <h4 class="hairdresser-description-heading">
            Self description
          </h4>
          <p class="hairdresser-description-text">${tile.description}</p>
        </div>
        <div class="hairdresser-card-services">
          <div class="horizontal-line">
            <h4 class="hairdresser-services-heading">Services</h4>
          </div>
          <div class="hairdresser-services">
            ${
              tile.servicesTitles
                ? tile.servicesTitles.map((service) => {
                    return `<div class="service-chip">${service}</div>`;
                  })
                : ""
            }
          </div>
        </div>
        <div class="hairdresser_card-bottom">
          <div class="card-details">
            <span class="material-icons"> ${directionIcon} </span>
            <span>${
              tile.genderMarket.charAt(0).toUpperCase() +
              tile.genderMarket.slice(1)
            }</span>
          </div>
          <div class="card-details direction">
            <span class="material-icons"> ${
              tile.workFlowDirection == "bidirectional"
                ? "compare_arrows"
                : "arrow_right_alt"
            } </span>
            <span>${
              tile.workFlowDirection == "bidirectional"
                ? "Both ways"
                : "One way"
            }</span>
          </div>
          <a class="button button--sml button--blue" href="/hairdresser/${
            tile._id
          }"
            >More Details</a
          >
        </div>
      </div>
    </div>`;
      })
      .join("") + "<p></p>"
  );
};

export const moveOnMap = (coords, zoomLevel) => {
  recommendState.mapView.map.setView(coords, zoomLevel, {
    animate: true,
    pan: {
      duration: 1,
    },
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

export const setDefaultMapView = () => {
  recommendState.mapView.map.setView(
    [recommendState.userCords.latitude, recommendState.userCords.longitude],
    14,
    {
      animate: true,
      pan: {
        duration: 1,
      },
    }
  );
};

export const removeMarkers = function () {
  recommendState.mapView.markers.clearLayers();
};

export const moveToMarkerLocation = (tileElement) => {
  const clickedHairdresser = recommendState.search.hairdresserResults.find(
    (hd) => hd._id === tileElement.dataset.id
  );

  // console.log(clickedHairdresser, "selected");
  // console.log(
  //   clickedHairdresser.location.coordinates[1],
  //   clickedHairdresser.location.coordinates[0]
  // );
  recommendState.mapView.map.setView(
    [
      clickedHairdresser.location.coordinates[1],
      clickedHairdresser.location.coordinates[0],
    ],
    15,
    {
      animate: true,
      pan: {
        duration: 1,
      },
    }
  );
};

const addErrorMsgTab = () => {
  const filterProximity = document.querySelector(".distance-input").value;
  const defProximity =
    document.querySelector(".filter-proximity").dataset.proximity;
  let filterMSG = "Current";
  if (filterProximity == "" || filterProximity == defProximity)
    filterMSG = "Your";

  // console.log(filterMSG);
  const parentElement = document.querySelector(".hairdresser-results--msg");
  const resultsNum = recommendState.search.hairdresserResults.length;
  const errorMarkup = `${
    resultsNum > 0
      ? `<h2>${resultsNum} Results, we found ${resultsNum} hairdressers matching your needs! <br>${filterMSG} Set Radius: ${Number(
          recommendState.search.proximity
        ).toFixed(2)} Miles = ${Number(
          recommendState.search.proximityKM
        ).toFixed(2)} KM</h2>`
      : `<h2>
    0 Results, we couldn't find any hairdressers. Try changing your
    filter settings or proximity radius for a wider search! <br>${filterMSG} Set Radius: ${Number(
          recommendState.search.proximity
        ).toFixed(2)} Miles = ${Number(
          recommendState.search.proximityKM
        ).toFixed(2)} KM</h2>`
  }`;

  parentElement.innerHTML = "";
  parentElement.insertAdjacentHTML("afterbegin", errorMarkup);
};

export const renderHairdressers = () => {
  addErrorMsgTab();

  const parentElement = document.querySelector(".hairdresser-card-conatiner");
  const hairdresserMarkup = renderHairdresserMarkup();

  parentElement.innerHTML = "";
  parentElement.insertAdjacentHTML("afterbegin", hairdresserMarkup);
};

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
      recommendState.search.query = `&proximity=${filterProximity}`;
      recommendState.search.proximity = filterProximity;
      recommendState.search.proximityKM = filterProximity * 1.609;
    } else {
      recommendState.search.proximityKM = filterProximity;
      recommendState.search.proximity = filterProximity / 1.609;
      recommendState.search.query = `&proximity=${filterProximity / 1.609}`;
    }
  } else {
    const defProximity =
      document.querySelector(".filter-proximity").dataset.proximity;
    recommendState.search.query = `&proximity=2`;
    recommendState.search.proximity = defProximity;
    recommendState.search.proximityKM = defProximity * 1.609;
  }

  // 2) STAR RATING
  const starRatingEl = document.querySelector(".rating-options");
  const starNumber =
    starRatingEl.options[starRatingEl.selectedIndex].value.charAt(0);
  console.log(starNumber);
  if (!(starNumber === "s")) {
    recommendState.search.query = `${recommendState.search.query}&starRating[gte]=${starNumber}`;
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
    console.log("not all");
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
    recommendState.search.query = `${recommendState.search.query}&${serviceString}`;
  }
  console.log(serviceAll, serviceUnisex, serviceMale, serviceFemale);

  // HAIRDRESSER WORK FLOW
  const workFlowMethod = document.querySelector(
    `input[name="work_direction-preference"]:checked`
  ).value;
  console.log(workFlowMethod);
  if (!(workFlowMethod === "both")) {
    recommendState.search.query = `${recommendState.search.query}&workFlowDirection=${workFlowMethod}`;
  }

  console.log(recommendState.search.query);

  if (
    document.querySelector(".filter-form").classList.contains("open--filter")
  ) {
    document.querySelector(".filter-form").classList.remove("open--filter");
  }

  renderLoadingSpinner(cardView);
  renderSidebarSpinner(document.querySelector(".tiles"));
  await buildSendQuery();
  recommendState.stateChanged = true;
  if (!(recommendState.mapView.map === undefined)) {
    if (recommendState.mapView.markers) removeMarkers();
    addSelfMarker();
    console.log("new self marker");
    addRemainingMarkers();
  }
  renderHairdressers();
  if (!(recommendState.mapView.map === undefined)) {
    renderTiles();
  }
  if (recommendState.search.hairdresserResults.length > 0) {
    addUserQueryCookie("previousQuery", {
      hairdresserResults: recommendState.search.hairdresserResults,
      userCords: recommendState.userCords,
    });
    tileMovement();
  }
};

const buildSendQuery = async () => {
  try {
    const res = await axios({
      method: "GET",
      url: `http://127.0.0.1:8000/api/hairdressers/SuggestedFrequent-hairdressers?lat=${recommendState.userCords.latitude}&lng=${recommendState.userCords.longitude}${recommendState.search.query}`,
    });

    // console.log(res.data);
    recommendState.search.hairdresserResults = res.data.data.hairdressers;
    // console.log(findState);
  } catch (err) {
    console.log(err);
  }
};

const renderHairdresserMarkup = () => {
  return recommendState.search.hairdresserResults
    .map((hairdresser) => {
      let directionIcon;

      if (hairdresser.genderMarket === "unisex") {
        directionIcon = "wc";
      } else if (hairdresser.genderMarket === "male") {
        directionIcon = "man";
      } else if (hairdresser.genderMarket === "female") {
        directionIcon = "woman";
      }
      return `<div class="hairdresser-card">
      <div class="hairdresser-card-header">
        <div class="card-profile"></div>
        <div class="card-profile--partition"></div>
        <img
          class="card-profile-photo"
          src="/Frontend/img/customers/${hairdresser.profileImg}"
          alt=""
        />
        <h3 class="card-name-heading">
          <span>${hairdresser.fullName}</span>
        </h3>
        <div class="profile-rating">
          <div class="profile-stars">
            <div class="star-rating-num">${hairdresser.starRating}</div>
            <div
              class="profile-star-rating"
              style="--star-rating: ${hairdresser.starRating}"
            ></div>
          </div>
          <span class="num-of-ratings">rating (${
            hairdresser.numOfReviews
          })</span>
        </div>
        <div class="distance-to-hairdresser">
          <span class="material-icons place-icon"> place </span>
          <div class="distance">
            <h3>${
              Math.round((hairdresser.distance + Number.EPSILON) * 100) / 100
            } miles</h3>
            <span class="distance-msg">away from you</span>
          </div>
        </div>
      </div>
      <div class="hairdresser-card-description">
        <h4 class="hairdresser-description-heading">Self description</h4>
        <p class="hairdresser-description-text">
          ${hairdresser.description}
        </p>
      </div>
      <div class="hairdresser-card-services">
        <div class="horizontal-line">
          <h4 class="hairdresser-services-heading">Services</h4>
        </div>
        <div class="hairdresser-services">
          ${
            hairdresser.servicesTitles
              ? hairdresser.servicesTitles.map((service) => {
                  return `<div class="service-chip">${service}</div>`;
                })
              : ""
          }
        </div>
      </div>
      <div class="hairdresser_card-bottom">
        <div class="card-details">
          <span class="material-icons"> ${directionIcon} </span>
          <span>${
            hairdresser.genderMarket.charAt(0).toUpperCase() +
            hairdresser.genderMarket.slice(1)
          }</span>
        </div>
        <div class="card-details direction">
          <span class="material-icons"> ${
            hairdresser.workFlowDirection == "bidirectional"
              ? "compare_arrows"
              : "arrow_right_alt"
          } </span>
          <span>${
            hairdresser.workFlowDirection == "bidirectional"
              ? "Both ways"
              : "One way"
          }</span>
        </div>
        <a class="button button--sml button--blue" href="/hairdresser/${
          hairdresser._id
        }"
          >More Details</a
        >
      </div>
    </div>`;
    })
    .join("");
};

const resetFilter = (e) => {
  e.preventDefault();
  const proximity =
    document.querySelector(".filter-proximity").dataset.proximity;
  const distanceInput = (document.querySelector(".distance-input").value =
    proximity);

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
