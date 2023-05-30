// import axios from "axios";
// import { response } from "express";

let userCords = {
  latitude: 51.4978153,
  longitude: -0.1011675,
  // LSBU Coordinates
};

let markers;
let map;

let autoComplete;
let place_id;

window.initMap = () => {
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
    console.log(place_id);
    // console.log(place_id);
    // const mark = new google.maps.Marker({
    //   position: place.geometry.location,
    //   title: place.name,
    // });
    // console.log(mark);

    await getCoordinates();

    if (!(map === undefined)) {
      removeMarkers();
      addSelfMarker();
      console.log("new self marker");
      addRemainingMarkers();
    }
  });
};

const getCoordinates = async () => {
  try {
    const res = await axios({
      method: "get",
      url: `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=geometry&key=AIzaSyDryOOU4afKXjn4TMu_E8NJ-pBrWwusH-E`,
      // url: `http://thingproxy.freeboard.io/fetch/maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=geometry&key=AIzaSyDryOOU4afKXjn4TMu_E8NJ-pBrWwusH-E`,
      // url: `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=geometry&key=AIzaSyDryOOU4afKXjn4TMu_E8NJ-pBrWwusH-E`,
    });

    // console.log(res);
    // console.log(res.data.result.geometry.location);
    userCords.latitude = res.data.result.geometry.location.lat;
    userCords.longitude = res.data.result.geometry.location.lng;
    console.log(userCords);
    // embedMap();
    // console.log(JSON.stringify(response.data));
  } catch (err) {
    console.log(err);
  }
};

const getCoordinates1 = async () => {
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=geometry&key=AIzaSyDryOOU4afKXjn4TMu_E8NJ-pBrWwusH-E`,
      {
        mode: "same-origin",
      }
    );
    const data = await res.json();
    console.log(res, data);
    // console.log(res.data.result.geometry.location);
    // console.log(JSON.stringify(response.data));
  } catch (err) {
    console.log(err);
  }
};

const navHeader = document.querySelector(".header");

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

const filterBtnForm = document.querySelector(".filter-form");

filterBtnForm.addEventListener("click", function (e) {
  e.preventDefault();
  if (
    e.target.classList.contains("filter-btn--mobile-el") ||
    e.target.classList.contains("mobile-outline--icon")
  ) {
    filterBtnForm.classList.add("open--filter");
  } else if (e.target.classList.contains("mobile-filter--icon--close")) {
    filterBtnForm.classList.remove("open--filter");
  }
});

const filterRating = document.querySelector(".rating-options");
// const curFilterStar = document.querySelector(".block-star");
const curFilterStar = document.querySelector(".filter-star-text");

// if (filterRating) {
//   filterRating.addEventListener("change", () => {
//     // console.log(filterRating.options[filterRating.selectedIndex].text);
//     if (filterRating.selectedIndex == 0) {
//       curFilterStar.style = "--star-rating: 5";
//     } else {
//       curFilterStar.style = `--star-rating: ${filterRating.selectedIndex}`;
//     }
//   });
// }

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

const tabsContainer = document.querySelector(".contain-tab-buttons");
const bothTabs = document.querySelectorAll(".tab-button");
const cardView = document.querySelector(".hairdresser-card-conatiner");
const mapView = document.querySelector(".hairdresser-map-container");

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
      if (map === undefined) embedMap();
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

const hairdresserTile = document.querySelectorAll(".hairdresser-tile");
const remainingTileList = document.querySelectorAll(".remaining-tile");
const tilesScrolling = document.querySelector(".tiles");
console.log(hairdresserTile);
// hairdresserTile.forEach((i) =>
//   i.addEventListener("click", function () {
//     console.log(remainingTile);
//     remainingTile.classList.add("remaining-tile-active");
//   })
// );

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
  })
);

// var myElement = document.getElementById("element_within_div");
// var topPos = myElement.offsetTop;

// document.getElementById("scrolling_div").scrollTop = topPos;

// hairdresserTile.addEventListener("click", function () {
//   // console.log(remainingTile);
//   remainingTile.classList.toggle("remaining-tile-active");
// });

// document.querySelector(".nav__links").addEventListener("click", function (e) {
//   e.preventDefault();
//   if (e.target.classList.contains("nav__link")) {
//     const id = e.target.getAttribute("href");
//     document.querySelector(id).scrollIntoView({ behavior: "smooth" });
//   }
// });

/////////////////////////// GETTING LOCATION AND MAP DISPLAY ////////////////////////////////
const navigatorBtn = document.querySelector(".gps-btn");

navigatorBtn.addEventListener("click", function () {
  navigator.geolocation.getCurrentPosition(function (curPos) {
    console.log(curPos);
    userCords.latitude = curPos.coords.latitude;
    userCords.longitude = curPos.coords.longitude;
    console.log(userCords);

    // embedMap();
  }, console.log("Could not find you position!"));
});

const embedMap = function () {
  map = L.map("map").setView([userCords.latitude, userCords.longitude], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  markers = L.layerGroup().addTo(map);

  // const radiusCircle = L.circle(
  //   [userCords.latitude, userCords.longitude],
  //   2896.82
  // ).addTo(map);
  // radiusCircle.addTo(markers);

  // const userMarker = L.marker([userCords.latitude, userCords.longitude])
  //   .addTo(map)
  //   .bindPopup("You")
  //   .openPopup()
  //   .on("click", function (e) {
  //     console.log("loool");
  //   });

  // increaseIcon = userMarker.options.icon;
  // increaseIcon.options.iconSize = [31, 50];
  // userMarker.setIcon(increaseIcon);
  // userMarker.valueOf()._icon.src = "/Frontend/img/leaflet-red-marker-icon.png";
  // // console.log(userMarker.valueOf()._icon);
  // // userMarker.valueOf()._icon.style.color = "green";

  // userMarker.addTo(markers);

  addSelfMarker();
  addRemainingMarkers();
};

const addSelfMarker = function () {
  console.log(userCords.latitude, userCords.longitude);
  const radiusCircle = L.circle(
    [userCords.latitude, userCords.longitude],
    2896.82
  ).addTo(map);
  radiusCircle.addTo(markers);

  const userMarker = L.marker([userCords.latitude, userCords.longitude])
    .addTo(map)
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
  // console.log(userMarker.valueOf()._icon);
  // userMarker.valueOf()._icon.style.color = "green";

  userMarker.addTo(markers);

  map.setView([userCords.latitude, userCords.longitude], 13, {
    animate: true,
    pan: {
      duration: 1,
    },
  });
};

const addRemainingMarkers = function () {
  const coordinates = [
    { latitude: 51.56381, longitude: 0.05734 },
    { latitude: 51.56907, longitude: 0.08354 },
    { latitude: 51.55869, longitude: 0.10002 },
    { latitude: 51.583643, longitude: 0.222409 },
  ];

  coordinates.forEach((coords) => {
    const userMarker = L.marker([coords.latitude, coords.longitude])
      .addTo(map)
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
      <span class="material-icons"> wc </span>
      <span>Hassan Aslam</span>
    </div>`
      )
      .openPopup();

    increaseIcon = userMarker.options.icon;
    increaseIcon.options.iconSize = [31, 50];
    userMarker.setIcon(increaseIcon);
    userMarker.addTo(markers);
  });

  map.setView([userCords.latitude, userCords.longitude], 13, {
    animate: true,
    pan: {
      duration: 1,
    },
  });
};

const removeMarkers = function () {
  markers.clearLayers();
};

// window.addEventListener("click", function (e) {
//   console.log(e.target, e);
// });
