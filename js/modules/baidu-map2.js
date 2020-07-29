define(['../../lib/openlayers/ol', '../../lib/projzh'], function(ol, projzh) {
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
  const source = new ol.source.XYZ({
    projection: 'baidu',
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
  const createView = function(zoom = 8) {
    const view = new ol.View({
      center: ol.proj.transform([119.51, 29.55], 'EPSG:4326', 'baidu'),
      zoom,
      minZoom: 6,
      maxZoom: 17,
      projection: 'baidu',
      extent: bd09Extent
    })
    return view
  }
  // 比例尺
  const scaleLineControl = new ol.control.ScaleLine({
    units: 'metric',                     //设置比例尺单位，有degrees、imperial、us、nautical或metric
  })
  // 鼠标定位点坐标显示
  const mousePositionControl = new ol.control.MousePosition({
    projection: 'EPSG:4326'
  })
  // 鹰眼地图
  const overviewMapControl = new ol.control.OverviewMap({
    layers: [ new ol.layer.Tile({source}) ],
    view: createView(3)
  })
  const initMap = function(target) {
    return new ol.Map({
      target,
      layers: [ new ol.layer.Tile({source}) ],
      view: createView(),
      controls: ol.control.defaults().extend([scaleLineControl, mousePositionControl, overviewMapControl])
    })
  }
  return { initMap, ol, projzh }
})

