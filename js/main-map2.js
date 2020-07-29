require(['./modules/baidu-map2',
  '../lib/openlayers/ol',
  '../lib/projzh',
  '../lib/vue.min.js'], function(initMap, ol, projzh, Vue){
  const map = initMap('map')
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
  map.addLayer(markVectorLayer)

  new Vue({
    el: '#setting-panel',
    data: {
      clickMark: false, // 点击标点
      markpoint: {
        longitude: 0, //经度
        latitude: 0 // 纬度
      },
      pointList: []
    },
    watch: {
      clickMark(newVal) {
        if(newVal) {
          map.on('singleclick', this.mapClick)
        } else {
          map.un('singleclick', this.mapClick)
        }
      }
    },
    methods: {
      // 地图单击事件
      mapClick(event) {
        const iconFeature = new ol.Feature({
          geometry: new ol.geom.Point(event.coordinate, 'XY')
        })
        markVectorSource.addFeature(iconFeature)
        const result = projzh.bmerc2ll(event.coordinate)
        this.pointList.push({coordinate: result, feature: iconFeature})
        this.markpoint.longitude = result[0]
        this.markpoint.latitude = result[1]
      },
      addPoint() {
        this.mapClick({
          coordinate: projzh.ll2bmerc([this.markpoint.longitude, this.markpoint.latitude])
        })
      },
      removePoint(index) {
        markVectorSource.removeFeature(this.pointList[index].feature)
        this.pointList.splice(index, 1)
      },
      clearAll() {
        while(this.pointList.length) {
          const point = this.pointList.pop()
          markVectorSource.removeFeature(point.feature)
        }
      }
    }
  })
})