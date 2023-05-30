export const addHairdresserMap = (clientNHairdresser) => {
  // mapboxgl.accessToken =
  //   "pk.eyJ1IjoiaGFzc2FuODQ4IiwiYSI6ImNsMGNtNTI4aTAwNjYzZHBmdmZsOWoxeWYifQ.ASZ-aMBng7Akfnm9OP_tEg";
  // var map = new mapboxgl.Map({
  //   container: "map",
  //   style: "mapbox://styles/hassan848/cky6scq1f65wr15l1ndko3ucz",
  //   scrollZoom: false,
  //   //   center: [0.059345, 51.569022],
  //   //   zoom: 16
  // });
  let mapOptions = {
    container: "mapbox-map",
    style: "mapbox://styles/hassan848/cky6scq1f65wr15l1ndko3ucz",
    scrollZoom: false,
    //   center: [0.059345, 51.569022],
  };
  if (clientNHairdresser.length == 1) {
    mapOptions.maxZoom = 13;
  }

  mapboxgl.accessToken =
    "pk.eyJ1IjoiaGFzc2FuODQ4IiwiYSI6ImNreTZybmw0ODB5enAyb29udW16NnUzc3QifQ.mwbSRG8gShStmSJu0wvgng";
  var map = new mapboxgl.Map(mapOptions);

  const mapBounds = new mapboxgl.LngLatBounds();

  clientNHairdresser.forEach((userLocation, i) => {
    // Create marker element
    const el = document.createElement("div");
    el.className = "marker";
    el.style.backgroundImage =
      i === 0
        ? "url('/Frontend/img/blue-mapbox-marker.png')"
        : "url('/Frontend/img/red-mapbox-marker.png')";

    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: "bottom",
    })
      .setLngLat(userLocation.coordinates)
      .addTo(map);

    new mapboxgl.Popup({ offset: 30, closeOnClick: false })
      .setLngLat(userLocation.coordinates)
      .setHTML(`<p>${i == 0 ? "Hairdresser" : "Your Location"}<p>`)
      .addTo(map);

    // Extend the map bounds to include current location
    mapBounds.extend(userLocation.coordinates);
  });

  map.fitBounds(mapBounds, {
    padding: {
      top: 200,
      bottom: 70,
      left: 100,
      right: 100,
    },
  });

  if (clientNHairdresser.length > 1) {
    map.on("load", function () {
      map.addLayer({
        id: "route",
        type: "line",
        source: {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: [
                clientNHairdresser[0].coordinates,
                // [0.05734, 51.56381],
                // [0.08354, 51.56907],
                clientNHairdresser[1].coordinates,
              ],
            },
          },
        },
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "rgba(0, 86, 114, 0.85)",
          "line-opacity": 0.6,
          "line-width": 3,
        },
      });
    });
  }
};

export const addHairdresserMapSingle = (hairdresser) => {
  mapboxgl.accessToken =
    "pk.eyJ1IjoiaGFzc2FuODQ4IiwiYSI6ImNreTZybmw0ODB5enAyb29udW16NnUzc3QifQ.mwbSRG8gShStmSJu0wvgng";
  var map = new mapboxgl.Map({
    container: "mapbox-map",
    style: "mapbox://styles/hassan848/cky6scq1f65wr15l1ndko3ucz",
    scrollZoom: false,
    //   center: [0.059345, 51.569022],
    //   zoom: 16
  });

  const mapBounds = new mapboxgl.LngLatBounds();

  // Create marker element
  const el = document.createElement("div");
  el.className = "marker";
  el.style.backgroundImage = "url('/Frontend/img/blue-mapbox-marker.png";

  // Add marker
  new mapboxgl.Marker({
    element: el,
    anchor: "bottom",
  })
    .setLngLat(hairdresser.coordinates)
    .addTo(map);

  new mapboxgl.Popup({ offset: 30, closeOnClick: false })
    .setLngLat(hairdresser.coordinates)
    .setHTML(`<p>Hairdresser<p>`)
    .addTo(map);

  // Extend the map bounds to include current location
  mapBounds.extend(hairdresser.coordinates);

  map.fitBounds(mapBounds, {
    padding: {
      top: 200,
      bottom: 70,
      left: 100,
      right: 100,
    },
  });
};

const clientNHairdresser = [
  {
    coordinates: [0.0593289, 51.56901629999999],
  },
  {
    // coordinates: [0.07472731359644187, 51.5656099722796],
    coordinates: [0.222409, 51.583643],
  },
];

// addHairdresserMap(clientNHairdresser);
// mapboxgl.accessToken =
//   "pk.eyJ1IjoiaGFzc2FuODQ4IiwiYSI6ImNsMGNtNTI4aTAwNjYzZHBmdmZsOWoxeWYifQ.ASZ-aMBng7Akfnm9OP_tEg";
// var map = new mapboxgl.Map({
//   container: "map",
//   style: "mapbox://styles/hassan848/cl0cmcq0y000214p3joc9p3cu",
//   scrollZoom: false,
//   //   center: [0.059345, 51.569022],
//   //   zoom: 16
// });

// coordinates: [
//     [0.0593289, 51.56901629999999],
//     [0.10002, 51.55869],
//   ],

// addHairdresserMap2();
