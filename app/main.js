import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import axios from 'axios';

let today = new Date();
let day = today.getDate();
let month = today.getMonth() + 1;
let year = today.getFullYear();
if (day < 10) {
  day = "0" + day;
}
if (month < 10) {
  month = "0" + month;
}
$("#date").val(`${year}-${month}-${day}`);

var price = setPrice(`${year}-${month}-${day}`);
var max = getMax(price);

const map = new maplibregl.Map({
  container: 'map',
  zoom: 4,
  center: [138, 38],
  minZoom: 1,
  maxZoom: 6,
  maxBounds: [122, 20, 154, 55],
  style: {
    version: 8,
    glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
    sources: {
      // background
      osm: {
        type: 'raster',
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        maxzoom: 6,
        tileSize: 256,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      },
      areamap: {
        type: 'geojson',
        data: '/ele_area.geojson',
      },
      label_point: {
        type: 'geojson',
        data: '/label_point.geojson',
      },
    },
    layers: [
      // 背景地図
      {
        id: 'osm-layer',
        source: 'osm',
        type: 'raster',
        paint: {
          'raster-opacity': 0.8
        }
      },
      // 給電エリア輪郭
      {
        id: 'areamap-line-layer',
        type: 'line',
        source: 'areamap',
        layout: {},
        paint: {
          'line-color': '#000000',
          'line-width': 0.01
        }
      },
      // 給電エリア塗りつぶし
      {
        id: 'areamap-layer',
        type: 'fill',
        source: 'areamap',
        layout: {},
        paint: {
            'fill-color': '#ff0000',
            'fill-opacity': [
                'match',
                ['get', 'name'],
                'hokkaido', 0,
                'tohoku', 0,
                'tokyo', 0,
                'hokuriku', 0,
                'chubu', 0,
                'kansai', 0,
                'chugoku', 0,
                'shikoku', 0,
                'kyushu', 0,
                0
            ],
        }
      },
      // エリアプライス表示
      {
        id: 'polygon-label',
        type: 'symbol',
        source: 'label_point',
        layout: {
          'text-field': [
              'match',
              ['get', 'name'],
              'hokkaido', '',
              'tohoku', '',
              'tokyo', '',
              'hokuriku', '',
              'chubu', '',
              'kansai', '',
              'chugoku', '',
              'shikoku', '',
              'kyushu', '',
              ''
          ],
          'text-size': 12,
        },
        paint: {
            'text-color': '#000000',
            'text-halo-color': '#FFFFFF',
            'text-halo-width': 1.5
        }
      },
    ]
  }});

// 日付変更時
$("#date").on("input", function() {
  var date =$(this).val();
  $("#time_label").text("00:00");
  $("#timeRange").val(0);
  setPrice(date);
})

// 時刻変更時
$("#timeRange").on("input", function() {
  let value = $(this).val();
  let hours = Math.floor(value / 2);
  hours = hours < 10 ? "0" + hours : hours;
  let time = hours + ":" + (value % 2 === 0 ? "00" : "30");
  $("#time_label").text(time);

  setValue(price, time);
});

// 価格取得
async function setPrice(date) {
  const path = 'https://us-central1-electricity-market-price.cloudfunctions.net/get_electricity_price/api/electricity_market_price?area=hokkaido,tohoku,tokyo,chubu,hokuriku,kansai,chugoku,shikoku,kyushu&date=' + date
  
  try {
    const response = await axios.get(path);
    price = response.data
    max = getMax(price);
    max += 10;
    setValue(response.data, '00:00');
    return response.data;
  } catch (err) {
    alert("取得できませんでした。");
  }
}

// 最大値取得
function getMax(price) {
  let max = -Infinity;
  for (const region in price) {
    for (const time in price[region]) {
      if (price[region][time] > max) {
        max = price[region][time];
      }
    }
  }
  return max + 10
}

// 表示価格変更
function setValue(price, time) {
  var hokkaido_price = price['hokkaido'][time]
  var tohoku_price = price['tohoku'][time]
  var tokyo_price = price['tokyo'][time]
  var hokuriku_price = price['hokuriku'][time]
  var chubu_price = price['chubu'][time]
  var kansai_price = price['kansai'][time]
  var chugoku_price = price['chugoku'][time]
  var shikoku_price = price['shikoku'][time]
  var kyushu_price = price['kyushu'][time]

  var hokkaido_opa = Math.round((hokkaido_price / max) * 10) / 10;
  var tohoku_opa = Math.round((tohoku_price / max) * 10) / 10;
  var tokyo_opa = Math.round((tokyo_price / max) * 10) / 10;
  var hokuriku_opa = Math.round((hokuriku_price / max) * 10) / 10;
  var chubu_opa = Math.round((chubu_price / max) * 10) / 10;
  var kansai_opa = Math.round((kansai_price / max) * 10) / 10;
  var chugoku_opa = Math.round((chugoku_price / max) * 10) / 10;
  var shikoku_opa = Math.round((shikoku_price / max) * 10) / 10;
  var kyushu_opa = Math.round((kyushu_price / max) * 10) / 10;

  map.setPaintProperty('areamap-layer', 'fill-opacity', [
    'match',
    ['get', 'name'],
    'hokkaido', hokkaido_opa,
    'tohoku', tohoku_opa,
    'tokyo', tokyo_opa,
    'hokuriku', hokuriku_opa,
    'chubu', chubu_opa,
    'kansai', kansai_opa,
    'chugoku', chugoku_opa,
    'shikoku', shikoku_opa,
    'kyushu', kyushu_opa,
    0
  ]);

  map.setLayoutProperty('polygon-label', 'text-field', [
    'match',
    ['get', 'name'],
    'hokkaido', String(hokkaido_price.toFixed(2)),
    'tohoku', String(tohoku_price.toFixed(2)),
    'tokyo', String(tokyo_price.toFixed(2)),
    'hokuriku', String(hokuriku_price.toFixed(2)),
    'chubu', String(chubu_price.toFixed(2)),
    'kansai', String(kansai_price.toFixed(2)),
    'chugoku', String(chugoku_price.toFixed(2)),
    'shikoku', String(shikoku_price.toFixed(2)),
    'kyushu', String(kyushu_price.toFixed(2)),
    ''
  ]);
}
