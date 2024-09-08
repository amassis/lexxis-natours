/* eslint-disable */
import mapboxgl from 'mapbox-gl';

const addLocation = (map, loc, bounds, start = false) => {
  const element = document.createElement('div');
  element.className = 'marker';

  new mapboxgl.Marker({
    element: element,
    className: 'marker',
    anchor: 'bottom',
  })
    .setLngLat(loc.coordinates)
    .addTo(map);

  const text = start
    ? `Start: ${loc.description}`
    : `Day ${loc.day}: ${loc.description}`;

  new mapboxgl.Popup({
    offset: 40,
    className: 'mapboxgl-popup',
  })
    .setLngLat(loc.coordinates)
    .setHTML(`<p class="mapboxgl-popup-content">${text}</p>`)
    // .setText(text)
    .addTo(map);

  bounds.extend(loc.coordinates);
};

export const displayMap = (locations, startLocation) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiYW1hc3NpcyIsImEiOiJjbTBpa24wdGMwb2E4MmxxYWJ0dWdvbHNiIn0.n3A6o5cTkJZpwd3mIQnlMQ';
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/amassis/cm0il51am00s801qre0ay7nhm',
    scrollZoom: false,
    // center: startLocation.coordinates,
  });

  const bounds = new mapboxgl.LngLatBounds();

  addLocation(map, startLocation, bounds, true);
  locations.forEach((location) => {
    addLocation(map, location, bounds);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
