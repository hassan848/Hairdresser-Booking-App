import { findState } from "./index";
import axios from "axios";
import { moveToTile } from "./index";
import "@babel/polyfill";

export const getCoordinates = async (place_id) => {
  try {
    const res = await axios({
      method: "get",
      url: `https://nameless-oasis-47980.herokuapp.com/https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=geometry&key=AIzaSyDryOOU4afKXjn4TMu_E8NJ-pBrWwusH-E`,
      // url: `http://thingproxy.freeboard.io/fetch/maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=geometry&key=AIzaSyDryOOU4afKXjn4TMu_E8NJ-pBrWwusH-E`,
      // url: `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=geometry&key=AIzaSyDryOOU4afKXjn4TMu_E8NJ-pBrWwusH-E`,
    });

    // console.log(res);
    // console.log(res.data.result.geometry.location);
    findState.userCords.latitude = res.data.result.geometry.location.lat;
    findState.userCords.longitude = res.data.result.geometry.location.lng;
    // console.log(findState.userCords);
    // embedMap();
    // console.log(JSON.stringify(response.data));
  } catch (err) {
    console.log(err);
  }
};

export const buildSendQuery = async () => {
  console.log("reached build send query function");
  const lat = "51.56811";
  const lng = "0.06013";
  const proximity = 5;
  try {
    console.log(lat, lng, proximity);
    const res = await axios({
      method: "GET",
      url: `http://127.0.0.1:8000/api/hairdressers/hair?lat=${findState.userCords.latitude}&lng=${findState.userCords.longitude}${findState.search.query}`,
    });

    console.log(res.data);
    findState.search.hairdresserResults = res.data.data.data;
    console.log(findState);
  } catch (err) {
    console.log(err);
  }
};

export const renderBottomFirst = () => {
  const parentElement = document.querySelector("main");
  const filterTabMarkup = `<section class="hairdressers-section">
  <div class="hairdresser-filter container">
    <form class="filter-form">
      <div class="filter-title">
        <span>Filters Form</span>
        <button class="filter-btn--mobile-el">
          <ion-icon
            name="filter-outline"
            class="mobile-outline--icon"
          ></ion-icon>
        </button>
      </div>
      <div class="filter-layout">
        <div class="filter-sections">
          <div class="filter-mobile-header">
            <h1 class="filter-title-mobile">Filters</h1>
            <button class="filter-btn--mobile-el">
              <ion-icon
                name="close-outline"
                class="mobile-filter--icon--close"
              ></ion-icon>
            </button>
          </div>
          <div class="filter-proximity">
            <h1>Proximity Radius</h1>
            <input
              class="distance-input"
              type="number"
              placeholder="Wiithin Distance Radius"
              min="0.1"
            />
            <select name="distance_metric" class="distance_unit-metric">
              <option value="mi">Mile</option>
              <option value="km">Km</option>
            </select>
          </div>
          <div class="filter-rating">
            <h1>Star Rating</h1>
            <select name="customer-rating-options" class="rating-options" id="rating-selections">
              <option value="show-all">Show All</option>
              <option value="1-more">
                <span class="star">★</span>
                1 Star or more
              </option>
              <option value="2-more">
                <span class="star">★</span>
                2 Stars or more
              </option>
              <option value="3-more">
                <span class="star">★</span>
                3 Stars or more
              </option>
              <option value="4-more">
                <span class="star">★</span>
                4 Stars or more
              </option>
              <option value="5-more">
                <span class="star">★</span>
                5 Stars only
              </option>
            </select>
            <div class="filter-star-text">
              Show All <span class="filter-stars">★★★★★</span>
            </div>
          </div>
          <div class="filter-gender">
            <h1>Service for Gender</h1>
            <div class="filter-gender-container">
              <div>
                <input
                  class="gender-checkbox-all"
                  type="checkbox"
                  id="all"
                  name="gender-preference"
                  value="all"
                  checked
                />
                <label for="all">Show All</label>
              </div>
              <div>
                <input
                  class="gender-checkbox"
                  type="checkbox"
                  id="unisex"
                  name="gender-preference"
                  value="unisex"
                />
                <label for="unisex">Unisex</label>
              </div>
              <div>
                <input
                  class="gender-checkbox-male"
                  type="checkbox"
                  id="male"
                  name="gender-preference"
                  value="male"
                />
                <label for="male">Male</label>
              </div>
              <div>
                <input
                  class="gender-checkbox-female"
                  type="checkbox"
                  id="female"
                  name="gender-preference"
                  value="female"
                />
                <label for="female">Female</label>
              </div>
            </div>
          </div>
          <div class="filter-work_direction">
            <h1>Hairdresser Work Flow</h1>
            <div>
              <input
                type="radio"
                id="both"
                name="work_direction-preference"
                value="both"
                checked
              />
              <label for="both">Show All</label>
            </div>
            <div>
              <input
                type="radio"
                id="unidirectional"
                name="work_direction-preference"
                value="unidirectional"
              />
              <label for="unidirectional"
                >Travel to Hairdresser only</label
              >
            </div>
            <div>
              <input
                type="radio"
                id="bidirectional"
                name="work_direction-preference"
                value="bidirectional"
              />
              <label for="bidirectional">Both ways - optional</label>
              <label class="bidirectional-option"
                >(Hairdresser can travel to you)</label
              >
            </div>
          </div>
        </div>
        <div class="filter-buttons">
          <button class="button button--sml button--blue button--filter apply-filter">
            Apply Filter
          </button>
          <!-- <button class="button button--sml button--blue" href="#"></button>
            Apply Filter
          </button> -->
          <button class="button button--sml button--black button--filter reset-filter">
            Reset Filter
          </button>
        </div>
      </div>
    </form>
  </div>
  <div class="hairdresser-results--msg container"></div>
  <div class="tabview-container">
    <div class="contain-tab-buttons container">
      <button class="tab-button tab-button--active">Card View</button>
      <button class="tab-button">Map View</button>
    </div>
  </div>
  <div class="hairdresser-card-conatiner container"></div>
  <div class="hairdresser-map-container card-results__content--inactive">
    <div class="submenu">
      <img
        class="hairdresser-logo"
        src="/Frontend/img/hairdresser-logo.png"
        alt=""
      />
      <div class="tiles"></div>
    </div>
    <div id="map"></div>
  </div>
</section>`;
  // parentElement.innerHTML = "";
  console.log(parentElement);
  parentElement.insertAdjacentHTML("beforeend", filterTabMarkup);
};

export const embedMap = function () {
  findState.mapView.map = L.map("map").setView([51.4978153, -0.1011675], 14);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(findState.mapView.map);

  findState.mapView.markers = L.layerGroup().addTo(findState.mapView.map);

  if (findState.userCords.latitude) {
    addSelfMarker();
  }
  if (findState.search.hairdresserResults.length > 0) {
    addRemainingMarkers();
  }
};

export const addSelfMarker = function () {
  // console.log(userCords.latitude, userCords.longitude);
  // console.log(findState.search.proximity);
  const radii = findState.search.proximity * 1609; // Convert miles to Metres
  const radiusCircle = L.circle(
    [findState.userCords.latitude, findState.userCords.longitude],
    radii
  ).addTo(findState.mapView.map);
  radiusCircle.addTo(findState.mapView.markers);

  const userMarker = L.marker([
    findState.userCords.latitude,
    findState.userCords.longitude,
  ])
    .addTo(findState.mapView.map)
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

  userMarker.addTo(findState.mapView.markers);

  findState.mapView.map.setView(
    [findState.userCords.latitude, findState.userCords.longitude],
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

////////////////////////// Render HairdresserMarkup ////////////////////////////////////////

const addErrorMsgTab = () => {
  const filterProximity = document.querySelector(".distance-input").value;
  const parentElement = document.querySelector(".hairdresser-results--msg");
  const resultsNum = findState.search.hairdresserResults.length;
  const errorMarkup = `${
    resultsNum > 0
      ? `<h2>${resultsNum} Results, we found ${resultsNum} hairdressers matching your needs! <br>${
          filterProximity == "" ? "Default " : "Current "
        }Set Radius: ${Number(findState.search.proximity).toFixed(
          2
        )} Miles = ${Number(findState.search.proximityKM).toFixed(2)} KM</h2>`
      : `<h2>
  0 Results, we couldn't find any hairdressers. Try changing your
  filter settings or proximity radius for a wider search! <br>${
    filterProximity == "" ? "Default " : "Current "
  }Set Radius: ${Number(findState.search.proximity).toFixed(
          2
        )} Miles = ${Number(findState.search.proximityKM).toFixed(2)} KM</h2>`
  }`;

  parentElement.innerHTML = "";
  parentElement.insertAdjacentHTML("afterbegin", errorMarkup);
};

const renderHairdresserMarkup = () => {
  return findState.search.hairdresserResults
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
        <span class="num-of-ratings">rating (${hairdresser.numOfReviews})</span>
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

const renderTilesMarkup = () => {
  return (
    findState.search.hairdresserResults
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
          <div class="star-rating-num tile-rating-num">${tile.starRating}</div>
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
            tile.workFlowDirection == "bidirectional" ? "Both ways" : "One way"
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

export const renderHairdressers = () => {
  addErrorMsgTab();

  const parentElement = document.querySelector(".hairdresser-card-conatiner");
  const hairdresserMarkup = renderHairdresserMarkup();

  parentElement.innerHTML = "";
  parentElement.insertAdjacentHTML("afterbegin", hairdresserMarkup);
};

export const renderTiles = () => {
  const parentElement = document.querySelector(".tiles");
  const tilesMarkup = renderTilesMarkup();

  parentElement.innerHTML = "";
  parentElement.insertAdjacentHTML("afterbegin", tilesMarkup);
};

export const addRemainingMarkers = function () {
  findState.search.hairdresserResults.forEach((tileHairdresser) => {
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
      .addTo(findState.mapView.map)
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
    userMarker.addTo(findState.mapView.markers);
  });

  findState.mapView.map.setView(
    [findState.userCords.latitude, findState.userCords.longitude],
    14,
    {
      animate: true,
      pan: {
        duration: 1,
      },
    }
  );
};

export const moveToMarkerLocation = (tileElement) => {
  const clickedHairdresser = findState.search.hairdresserResults.find(
    (hd) => hd._id === tileElement.dataset.id
  );

  console.log(clickedHairdresser, "selected");
  console.log(
    clickedHairdresser.location.coordinates[1],
    clickedHairdresser.location.coordinates[0]
  );
  findState.mapView.map.setView(
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

export const moveOnMap = (coords, zoomLevel) => {
  findState.mapView.map.setView(coords, zoomLevel, {
    animate: true,
    pan: {
      duration: 1,
    },
  });
};

export const setDefaultMapView = () => {
  findState.mapView.map.setView(
    [findState.userCords.latitude, findState.userCords.longitude],
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
  findState.mapView.markers.clearLayers();
};
