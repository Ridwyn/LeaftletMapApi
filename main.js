//CREATE FIRST LAYER TO DISPLAY ON MAP
var streets = L.tileLayer(
  "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}",
  {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: "mapbox.streets",
    maxZoom: 18,
    accessToken:
      "pk.eyJ1Ijoicmlkd3luIiwiYSI6ImNqbHRzbjhoajBjNWczcGw5ZDVmOXdkdTkifQ.X4LhnVh6T_-vZEIW7fMo2Q"
  }
);

//Setting up the map with options
var mymap = L.map("mapid", {
  center: [51.505, -0.09],
  zoom: 13,
  layers: [streets]
});
// add a first layer to display when map loads
streets.addTo(mymap);

//OPTION TO SELECT DIFFERENT
var layers = [
  { name: "Street", id: "mapbox.streets" },
  { name: "Satellite", id: "mapbox.satellite" },
  { name: "Outdoors", id: "mapbox.outdoors" },
  { name: "Light", id: "mapbox.light" }
];

//EMPTY OBJECT TO STORE LAYER
var basemap = {};

for (let i = 0; i < layers.length; i++) {
  addLayer(layers[i]);
}
function addLayer(props) {
  var baselayername = props.name;
  var baselayer = L.tileLayer(
    "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}",
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      id: props.id,
      maxZoom: 18,
      accessToken:
        "pk.eyJ1Ijoicmlkd3luIiwiYSI6ImNqbHRzbjhoajBjNWczcGw5ZDVmOXdkdTkifQ.X4LhnVh6T_-vZEIW7fMo2Q"
    }
  );
  //Create base map obj. and set a dynamic key and value pair
  basemap[baselayername] = baselayer;

  console.log(basemap);
}

//Method to create marker
function createMarker(lat, lng, town, postcode) {
  var popup = `
  <div>
  <strong>${town},<strong> <span>${postcode}<span>
  </div>
 
  `;
  var marker = L.marker([lat, lng])
    .bindPopup(popup)
    .addTo(mymap);

  console.log(marker);
}

//ADD CREaTED LAYERS NAD MARKERS INTO CONTROL LAYER TO SELECT
L.control.layers(basemap).addTo(mymap);

////////////////////////////////////////////////////////////////////////////////

//START GEOCODING FOR POSTCODE
//Listen for submit
document
  .querySelector("#postcodeForm")
  .addEventListener("submit", getLocationInfo);

//Listen for delete
document.querySelector("body").addEventListener("click", deleteLocation);

function getLocationInfo(e) {
  //Get postcode value from input form
  const postcode = document.querySelector(".postcode").value;

  //Make a request
  axios
    .get(`https://api.postcodes.io/postcodes/${postcode}`)
    .then(response => {
      console.log(response.data);
      result = response.data.result;
      //Create the marker with given values
      createMarker(
        result.latitude,
        result.longitude,
        result.admin_district,
        result.postcode
      );
      //Pan to the marker location
      mymap.flyTo([result.latitude, result.longitude]);

      showIcon("check");
      let output = `<article class="message is-primary">
                  <div class="message-header">
                  <p>Location Info</p>
                  <button class="delete"></button>
                  </div>
                  <div class="message-body">
                  <ul>
                  <li><strong>Town/City:</strong> ${result.admin_district}</li>
                  <li><strong>Region:</strong> ${result.region}</li>
                  <li><strong>Postcode:</strong> ${result.postcode}</li>
                  <li><strong>Longitude:</strong> ${result.longitude}</li>
                  <li><strong>latitude:</strong> ${result.latitude}</li>
                  </ul>
                  </div>
              </article>
              `;
      //Insert into output div
      document.querySelector("#output").innerHTML = output;
    })

    .catch(function(error) {
      console.log(error);
      if (error) {
        showIcon("remove");
        document.querySelector("#output").innerHTML = `
                  <article class="message is-danger">
                  <div class="message-body">Invalid Postcode try again</div>
                  </article>
                  `;
      }
    });
  e.preventDefault();
}

function showIcon(icon) {
  //Make sure the icone are cleared
  document.querySelector(`.icon-check`).style.display = "none";
  document.querySelector(`.icon-remove`).style.display = "none";
  //then display the correct icon
  document.querySelector(`.icon-${icon}`).style.display = "inline-flex";
}

//Delete location button
function deleteLocation(e) {
  if (e.target.className == "delete") {
    document.querySelector(".message").remove();
    document.querySelector(".postcode").value = "";
    document.querySelector(`.icon-check`).style.display = "none";
  }
}
