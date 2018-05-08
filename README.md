# Poly Editor

Contains a Polygon editor for Google Maps, coordinates of polygons drawn to the map are printed into a form field, in POLYGON sql format.


## Development

To start development server, run: `npm start`.

Go to `localhost:8080/public/index.html`.

## Usage

``` javascript
function initMap() {

  ped = new PolyEditor(
    document.getElementById('map'), // node where to draw the map
    document.getElementById('field') // text field to output
  );

  // initialize PolyEditor instance, ensure this is run after `google` global variable from Google Maps has been loaded.
  ped.init();
}
```

## License

Under MIT, [read](./LICENSE).
