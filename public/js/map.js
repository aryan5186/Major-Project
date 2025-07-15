mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v12',
  center:  listing.geometry.coordinates,   // ← Now safe: [lng, lat]
  zoom: 9
});

// console.log(coordinates)
const marker = new mapboxgl.Marker()
  .setLngLat(listing.geometry.coordinates)//listing.geometry.coordinates
  .setPopup(new mapboxgl.Popup({offset: 25}).setHTML(
    `<h4>${listing.title}</h4><p>Exact Location will be provided after booking</p>`))
  .addTo(map);