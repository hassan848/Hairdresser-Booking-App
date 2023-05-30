import { addUserQueryCookie } from "./manageCookies";
import "@babel/polyfill";

const bookmarkState = {
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

export const bookmarkedHairdressers = () => {
  const tabsContainer = document.querySelector(".recommend-tab-buttons");
  const bothTabs = document.querySelectorAll(".tab-button");

  cardView = document.querySelector(".hairdresser-card-conatiner");
  const mapView = document.querySelector(".hairdresser-map-container");

  if (!document.querySelector(".hairdresser-card-conatiner")) return;

  const hairdressers = JSON.parse(
    document.querySelector(".hairdresser-card-conatiner").dataset.hairdressers
  );
  bookmarkState.search.hairdresserResults = hairdressers;

  const userCoords = JSON.parse(
    document.querySelector(".recommend-title").dataset.coords
  );
  bookmarkState.userCords.latitude = userCoords[1];
  bookmarkState.userCords.longitude = userCoords[0];

  if (bookmarkState.search.hairdresserResults.length > 0) {
    renderTiles();
    tileMovement();

    addUserQueryCookie("previousQuery", {
      hairdresserResults: bookmarkState.search.hairdresserResults,
      userCords: bookmarkState.userCords,
    });
  }

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

        if (bookmarkState.mapView.map === undefined) {
          embedMap();
        }
      } else {
        cardView.classList.remove("card-results__content--inactive");
        mapView.classList.add("card-results__content--inactive");
      }
    });
  }
};

const embedMap = function () {
  bookmarkState.mapView.map = L.map("map").setView(
    [51.4978153, -0.1011675],
    14
  );

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(bookmarkState.mapView.map);

  bookmarkState.mapView.markers = L.layerGroup().addTo(
    bookmarkState.mapView.map
  );

  if (bookmarkState.userCords.latitude) {
    addSelfMarker();
  }
  if (bookmarkState.search.hairdresserResults.length > 0) {
    addRemainingMarkers();
  }
};

export const addSelfMarker = function () {
  // console.log(userCords.latitude, userCords.longitude);
  // console.log(findState.search.proximity);

  const userMarker = L.marker([
    bookmarkState.userCords.latitude,
    bookmarkState.userCords.longitude,
  ])
    .addTo(bookmarkState.mapView.map)
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

  userMarker.addTo(bookmarkState.mapView.markers);

  bookmarkState.mapView.map.setView(
    [bookmarkState.userCords.latitude, bookmarkState.userCords.longitude],
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
  bookmarkState.search.hairdresserResults.forEach((tileHairdresser) => {
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
      .addTo(bookmarkState.mapView.map)
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
    userMarker.addTo(bookmarkState.mapView.markers);
  });

  bookmarkState.mapView.map.setView(
    [bookmarkState.userCords.latitude, bookmarkState.userCords.longitude],
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
    bookmarkState.search.hairdresserResults
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
  bookmarkState.mapView.map.setView(coords, zoomLevel, {
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
  bookmarkState.mapView.map.setView(
    [bookmarkState.userCords.latitude, bookmarkState.userCords.longitude],
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
  bookmarkState.mapView.markers.clearLayers();
};

export const moveToMarkerLocation = (tileElement) => {
  const clickedHairdresser = bookmarkState.search.hairdresserResults.find(
    (hd) => hd._id === tileElement.dataset.id
  );

  // console.log(clickedHairdresser, "selected");
  // console.log(
  //   clickedHairdresser.location.coordinates[1],
  //   clickedHairdresser.location.coordinates[0]
  // );
  bookmarkState.mapView.map.setView(
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
