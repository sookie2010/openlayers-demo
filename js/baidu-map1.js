(function(){

/* 定义百度投影，这是实现无偏移加载百度地图离线瓦片核心所在。
网上很多相关资料在用OpenLayers加载百度地图离线瓦片时都认为投影就是EPSG:3857(也就是Web墨卡托投影)。
事实上这是错误的，因此无法做到无偏移加载。
百度地图有自己独特的投影体系，必须在OpenLayers中自定义百度投影，才能实现无偏移加载。
百度投影实现的核心文件为bd09.js，在迈高图官网可以找到查看这个文件。 */
var projBD09 = new ol.proj.Projection({
  code: 'BD:09',
  extent : [-20037726.37,-11708041.66,20037726.37,12474104.17],
  units: 'm',
  axisOrientation: 'neu',
  global: false
});  
    
ol.proj.addProjection(projBD09);
ol.proj.addCoordinateTransforms("EPSG:4326", "BD:09",
  function (coordinate) {
    return lngLatToMercator(coordinate);
  },
  function (coordinate) {
    return mercatorToLngLat(coordinate);
  }
);

/*定义百度地图分辨率与瓦片网格*/
var resolutions = [];
for (let i = 0; i <= 18; i++) {
  resolutions[i] = Math.pow(2, 18 - i);
}

var tilegrid = new ol.tilegrid.TileGrid({
  origin: [0, 0],
  resolutions: resolutions
})

/*加载百度地图离线瓦片不能用ol.source.XYZ，ol.source.XYZ针对谷歌地图（注意：是谷歌地图）而设计，
而百度地图与谷歌地图使用了不同的投影、分辨率和瓦片网格。因此这里使用ol.source.TileImage来自行指定
投影、分辨率、瓦片网格。*/
var source = new ol.source.TileImage({
  projection: "BD:09",
  tileGrid: tilegrid,
  tileUrlFunction: function(tileCoord, pixelRatio, proj) {
    var z = tileCoord[0];
    var x = tileCoord[1];
    var y = tileCoord[2];

    return 'tiles/' + z + '/' + x + '/' + y + '.png';
  }
})

var mapLayer = new ol.layer.Tile({
  source: source
})

new ol.Map({
  layers: [
    mapLayer
  ],
  view: new ol.View({
    center: ol.proj.transform([113.03914, 28.20354], 'EPSG:4326', 'BD:09'),
    projection: 'BD:09',
    zoom: 14
  }),
  target: 'map'
})

})()