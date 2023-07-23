// Create 2 base maps: a topographical and a streetmap.
let streetmap = L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }
);

let topographical = L.tileLayer(
  "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
  {
    attribution:
      'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
  }
);
let baseMaps = {
  Street: streetmap,
  Topography: topographical,
};

let colorScale = d3
  .scaleSequential()
  .domain([0, 100])
  .interpolator(d3.interpolateRgb("green", "yellow"));

// Store the USGS API endpoint for all earthquakes in the past day.
let queryUrl =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

// Perform the GET request using D3.
d3.json(queryUrl).then(function (data) {
  console.log(data.features);
  // Pass the features to a createFeatures() function:
  createFeatures(data.features);
});
function createFeatures(earthquakeData) {
  function onEachFeature(feature, layer) {
    layer.bindPopup(
      `<h3>${feature.properties.place}</h3><hr><h4>Magnitude: ${feature.properties.mag}, Depth: ${feature.geometry.coordinates[2]}</hr>`
    );
  }
  function createBubbles(feature, latlng) {
    let magnitude = feature.properties.mag;
    let radius = 5 * magnitude;
    let depth = feature.geometry.coordinates[2];
    return L.circleMarker(latlng, {
      radius: radius,
      fillColor: colorScale(depth),
      color: colorScale(depth),
      weight: 1,
      fillOpacity: 0.5,
    });
  }
  let earthquakes = L.geoJson(earthquakeData, {
    pointToLayer: createBubbles,
    onEachFeature: onEachFeature,
  });
  let overlayMaps = {
    Earthquakes: earthquakes,
  };
  // Create a map object.
  let map = L.map("map", {
    center: [37.09, -95.71],
    zoom: 3,
    layers: [topographical, earthquakes],
  });
  // Add user control interface.
  L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(map);

  // Create a legend
  let legendControl = L.control({
    position: "bottomright",
  });

  // When the layer control is added, insert a div with the class of "legend"
  legendControl.onAdd = function (map) {
    let div = L.DomUtil.create("div", "legend");
    div.style.backgroundColor = "white";
    div.style.padding = "5px";
    let legendContent = "<h4>Depth Legend</h4>";
    legendContent += "<div class='legend-scale'>";
    for (let i = 0; i <= 100; i += 20) {
      let color = colorScale(i);
      legendContent +=
        "<i style='background: " +
        color +
        " " +
        " '> </i> " +
        i +
        (i < 100 ? " &ndash; " + (i + 20) + "<br>" : "+");
    }
    legendContent += "</div>";
    div.innerHTML = legendContent;
    return div;
  };
  // Add the legend to the map
  legendControl.addTo(map);
}
// function updateLegend(colorScale) {
//   //   let legend = document.getElementById("legend");
//     // legend.innerHTML = "";
//   let legendContent = "<h4>Depth Legend</h4>";
//   legendContent += "<div class='legend-scale'>";
//   for (let i = 0; i <= 100; i += 20) {
//     let color = colorScale(i);
//     legendContent +=
//       "<i style='background:" +
//       color +
//       "'></i>" +
//       i +
//       (i < 100 ? "&ndash;" + (i + 20) + "<br>" : "+");
//   }
//   legendContent += "</div>";
//   legend.innerHTML = legendContent;
// }
