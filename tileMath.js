// From https://github.com/datalyze-solutions/globalmaptiles/blob/master/globalmaptiles.js

const pi_div_360 = Math.PI / 360.0;
const pi_div_180 = Math.PI / 180.0;
// const pi_div_2 = Math.PI / 2.0;
// const pi_4 = Math.PI * 4;
const pi_2 = Math.PI * 2;
// const pi = Math.PI;
// const _180_div_pi = 180 / Math.PI;
const tileSize = 256;
const initialResolution = (pi_2 * 6378137) / tileSize;
const originShift = (pi_2 * 6378137) / 2.0;

export function LatLonToTile(lat, lon, zoom) {
  console.log("LatLonToTile", lat, lon, zoom);
  var meters = LatLonToMeters(lat, lon);
  console.log({ meters });
  var pixels = MetersToPixels(meters.mx, meters.my, zoom);
  console.log({ pixels });
  return PixelsToTile(pixels.px, pixels.py);
}

function LatLonToMeters(lat, lon) {
  // Converts given lat/lon in WGS84 Datum to XY in Spherical Mercator EPSG:900913
  let mx = (lon * originShift) / 180.0;
  let my = Math.log(Math.tan((90 + lat) * pi_div_360)) / pi_div_180;

  my = (my * originShift) / 180.0;
  return { mx: mx, my: my };
}

function MetersToPixels(mx, my, zoom) {
  // Converts EPSG:900913 to pyramid pixel coordinates in given zoom level
  var res = Resolution(zoom);
  var px = (mx + originShift) / res;
  var py = (my + originShift) / res;
  return { px: px, py: py };
}

function Resolution(zoom) {
  // Resolution (meters/pixel) for given zoom level (measured at Equator)
  return initialResolution / Math.pow(2, zoom);
}

function PixelsToTile(px, py) {
  // Returns a tile covering region in given pixel coordinates
  var tx, ty;
  tx = Math.round(Math.ceil(px / tileSize) - 1);
  ty = Math.round(Math.ceil(py / tileSize) - 1);
  return { tx: tx, ty: ty };
}

// function PixelsToRaster(px, py, zoom) {
//   // Move the origin of pixel coordinates to top-left corner
//   var mapSize;
//   mapSize = tileSize << zoom;
//   return { x: px, y: mapSize - py };
// }

// function PixelsToMeters(px, py, zoom) {
//   // Converts pixel coordinates in given zoom level of pyramid to EPSG:900913
//   var res, mx, my;
//   res = Resolution(zoom);
//   mx = px * res - originShift;
//   my = py * res - originShift;
//   return { mx: mx, my: my };
// }
