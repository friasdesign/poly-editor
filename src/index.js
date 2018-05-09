'use strict';

// POLY EDITOR _________________________________________________________________________________________________________

/**
 * Initializes the PolyEditor
 * @varructor
 */
function PolyEditor(container, field) {
  this.field = field;

  if (field && typeof field.value === 'string' && field.value !== '') {
    this.polygon = PolyEditor.ParseStringToPolygon(field.value);
    this.setPolygon(this.polygon);
  } else {
    this.polygon = null;
  }

  this.container = container;
  this.map = null;
  this.drawManager = null;
}

/**
 * Centers map on polygon `poly`.
 */
PolyEditor.prototype.centerOnPolygon = function (poly) {
  var bounds = new google.maps.LatLngBounds();
  var polyCoords = poly.getPath();

  for (var i = 0; i < polyCoords.length; i++) {
    bounds.extend(polyCoords[i]);
  }

  this.map.fitBounds(bounds);
};

/**
 * Creates a new polygon.
 * @param {*} poly 
 */
PolyEditor.prototype.setPolygon = function (poly) {
  // If polygon exists, remove it from map.
  if (this.polygon) {
    this.polygon.setMap(null);
  }

  this.polygon = poly;
  this.AddEventsToPolygon(this.polygon);

  this.updateField();
};

PolyEditor.prototype.updateField = function () {
  this.field.value = PolyEditor.ParsePolygonToString(this.polygon);
};

/**
 * Adds events to polygon `poly`.
 * @param {*} poly 
 */
PolyEditor.prototype.AddEventsToPolygon = function (poly) {
  google.maps.event.addListener(poly, 'dragend', this.updateField.bind(this));
  google.maps.event.addListener(poly.getPath(), 'set_at', this.updateField.bind(this));
  google.maps.event.addListener(poly.getPath(), 'insert_at', this.updateField.bind(this));
  google.maps.event.addListener(poly.getPath(), 'remove_at', this.updateField.bind(this));
};

/**
 * Parses a polygon to string.
 * @param {*} poly 
 */
PolyEditor.ParsePolygonToString = function (poly) {
  var path = poly.getPath();

  var pointsStr = '';
  path.forEach(function (p) {
    pointsStr += p.lng() + ' ' + p.lat();
  });

  return 'POLYGON((' + pointsStr.slice(0, -1) + '))';
};

PolyEditor.PolyRegex = /^POLYGON\((?:(?:\(((?:-?\d+(?:\.\d+)? -?\d+(?:\.\d+)?,?)+)\),?)*)\)$/g;

/**
 * Takes in a string and parses it into a polygon, following string POLYGON SQL format.
 * @param {string} str 
 */
PolyEditor.ParseStringToPolygon = function (str) {
  var paths = [];
  var ret;

  do {
    ret = PolyEditor.PolyRegex.exec(str);
    if (ret) {
      paths.push(ret[1]);
    }
  } while (ret);

  if (paths.length > 0) {
    // Just single path for now.
    var points = paths[0].split(',');

    var coordinates = points.map(function (coordStr) {
      var coord = coordStr.split(' ');

      return new google.maps.LatLng(coord[1], coord[0]);
    });

    return new google.maps.Polygon(Object.assign({}, PolyEditor.polyOptions, {
      path: coordinates,
    }));
  }

  return null;
};

PolyEditor.polyOptions = {
  editable: true,
  clickable: true,
  draggable: true,
  strokeColor: '#548ce5',
  fillColor: '#548ce5',
};


// INITIALIZERS ________________________________________________________________________________________________________

/**
 * Initializes Poly Editor.
 */
PolyEditor.prototype.init = function () {
  this.initMap();
  this.initDrawManager();
};

/**
 * Initializes map.
 */
PolyEditor.prototype.initMap = function () {
  this.map = new google.maps.Map(this.container, {
    center: { lat: -53.79087255, lng: -67.69589780000001 },
    zoom: 16,
  });

  if (this.polygon) {
    this.polygon.setMap(this.map);
  }
};

/**
 * Initializes the DrawingManager.
 */
PolyEditor.prototype.initDrawManager = function () {
  this.drawManager = new google.maps.drawing.DrawingManager({
    drawingMode: null,
    drawingControl: true,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_CENTER,
      drawingModes: ['polygon']
    },
    polygonOptions: PolyEditor.polyOptions,
  });

  google.maps.event.addListener(this.drawManager, 'polygoncompvare', this.setPolygon.bind(this));

  this.drawManager.setMap(this.map);
};
