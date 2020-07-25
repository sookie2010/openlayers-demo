(function(){

var bd09Extent = [-20037726.37, -12474104.17, 20037726.37, 12474104.17];
var baiduMercator = new ol.proj.Projection({
  code: "baidu",
  extent: bd09Extent,
  units: "m"
});
ol.proj.addProjection(baiduMercator);
ol.proj.addCoordinateTransforms("EPSG:4326", baiduMercator, projzh.ll2bmerc, projzh.bmerc2ll);
ol.proj.addCoordinateTransforms("EPSG:3857", baiduMercator, projzh.smerc2bmerc, projzh.bmerc2smerc);

var bmercResolutions = new Array(19);
for (var i = 0; i < 19; ++i) {
  bmercResolutions[i] = Math.pow(2, 18 - i);
}

var urls = [0, 1, 2, 3].map(function(sub) {
  return (
    "http://maponline" +
    sub +
    ".bdimg.com/tile/?qt=vtile&x={x}&y={y}&z={z}&styles=pl&scaler=1&udt=20191119"
  );
});
var baidu = new ol.layer.Tile({
  source: new ol.source.XYZ({
    projection: "baidu",
    maxZoom: 18,
    tileUrlFunction: function(tileCoord) {
      var x = tileCoord[1];
      var y = -tileCoord[2] - 1;
      var z = tileCoord[0];
      var hash = (x << z) + y;
      var index = hash % urls.length;
      index = index < 0 ? index + urls.length : index;
      if (x < 0) {
        x = "M" + -x;
      }
      if (y < 0) {
        y = "M" + -y;
      }
      return urls[index] .replace("{x}", x).replace("{y}", y) .replace("{z}", z);
    },
    tileGrid: new ol.tilegrid.TileGrid({
      resolutions: bmercResolutions,
      origin: [0, 0]
    })
  })
});
var map = new ol.Map({
  target: "map",
  layers: [baidu],
  view: new ol.View({
    center: ol.proj.transform([121.51, 31.55], "EPSG:4326", "baidu"),
    zoom: 1,
    projection: "baidu",
    extent: bd09Extent
  })
});

})()