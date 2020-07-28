define(['../../lib/ol', '../../lib/projzh'], function(ol, projzh) {
  return function() {
    const bd09Extent = [-20037726.37, -12474104.17, 20037726.37, 12474104.17]
    const baiduMercator = new ol.proj.Projection({
      code: 'baidu',
      extent: bd09Extent,
      units: 'm'
    })
    ol.proj.addProjection(baiduMercator)
    ol.proj.addCoordinateTransforms('EPSG:4326', baiduMercator, projzh.ll2bmerc, projzh.bmerc2ll)
    ol.proj.addCoordinateTransforms('EPSG:3857', baiduMercator, projzh.smerc2bmerc, projzh.bmerc2smerc)

    const bmercResolutions = new Array(19)
    for (let i = 0 ; i < 19 ; i++) {
      bmercResolutions[i] = Math.pow(2, 18 - i)
    }

    const baiduLayer = new ol.layer.Tile({
      source: new ol.source.XYZ({
        projection: 'baidu',
        maxZoom: 18,
        tileUrlFunction: function(tileCoord) {
          let x = tileCoord[1]
          let y = -tileCoord[2] - 1
          let z = tileCoord[0]
          let hash = (x << z) + y
          let index = (hash + 4) % 4
          if (x < 0) {
            x = 'M' + -x
          }
          if (y < 0) {
            y = 'M' + -y
          }
          return `http://maponline${index}.bdimg.com/tile/?qt=vtile&x=${x}&y=${y}&z=${z}&styles=pl&scaler=1&udt=20191119`
        },
        tileGrid: new ol.tilegrid.TileGrid({
          resolutions: bmercResolutions,
          origin: [0, 0]
        })
      })
    })
    // 比例尺
    const scaleLineControl = new ol.control.ScaleLine({
      units: 'metric',                     //设置比例尺单位，有degrees、imperial、us、nautical或metric
    })
    // 鼠标定位点坐标显示
    const mousePositionControl = new ol.control.MousePosition({
      projection: 'EPSG:4326'
    })
    const map = new ol.Map({
      target: 'map',
      layers: [baiduLayer],
      view: new ol.View({
        center: ol.proj.transform([121.51, 31.55], 'EPSG:4326', 'baidu'),
        zoom: 6,
        projection: 'baidu',
        extent: bd09Extent
      }),
      controls: ol.control.defaults().extend([scaleLineControl, mousePositionControl])
    })
    // 地图标点
    const markVectorSource = new ol.source.Vector()
    const markVectorLayer = new ol.layer.Vector({
      source: markVectorSource,
      style: new ol.style.Style({
        image: new ol.style.Icon({
          opacity: 0.75,
          src: '../images/map_marker.png'
        }),
      })
    })
    const points = [
      [121.51, 31.55],
      [132.87, 32.61],
      [127.11, 30.41]
    ]
    for(let point of points) {
      let iconFeature = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.transform(point, 'EPSG:4326', 'baidu'), 'XY')
      })
      markVectorSource.addFeature(iconFeature)
    }
    map.addLayer(markVectorLayer)
  }
})
