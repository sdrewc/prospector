'use strict';

/*
SFCTA PROSPECTOR: Data visualization platform.

Copyright (C) 2018 San Francisco County Transportation Authority
and respective authors. See Git history for individual contributions.

This program is free software: you can redistribute it and/or modify
it under the terms of the Apache License version 2.0, as published
by the Apache Foundation, or any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
See the Apache License for more details.

You should have received a copy of the Apache License along with
this program. If not, see <https://www.apache.org/licenses/LICENSE-2.0>.
*/

// Must use npm and babel to support IE11/Safari
import 'isomorphic-fetch';
import vueSlider from 'vue-slider-component';
import Cookies from 'js-cookie';

var maplib = require('../jslib/maplib');
let styles = maplib.styles;
let getLegHTML = maplib.getLegHTML2;
let getColorFromVal = maplib.getColorFromVal2;

let baseLayer = maplib.baseLayer;
let mymap = maplib.sfmap;
mymap.setView([37.76889, -122.440997], 13);

mymap.removeLayer(baseLayer);
let url = 'https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/256/{z}/{x}/{y}?access_token={accessToken}';
let token = 'pk.eyJ1Ijoic2ZjdGEiLCJhIjoiY2ozdXBhNm1mMDFkaTJ3dGRmZHFqanRuOCJ9.KDmACTJBGNA6l0CyPi1Luw';
let attribution ='<a href="http://openstreetmap.org">OpenStreetMap</a> | ' +
                 '<a href="http://mapbox.com">Mapbox</a>';
baseLayer = L.tileLayer(url, {
  attribution:attribution,
  maxZoom: 18,
  accessToken:token,
}).addTo(mymap);

let url2 = 'https://api.mapbox.com/styles/v1/sfcta/cjscclu2q07qn1fpimxuf2wbd/tiles/256/{z}/{x}/{y}?access_token={accessToken}';
let streetLayer = L.tileLayer(url2, {
  attribution:attribution,
  maxZoom: 18,
  accessToken:token,
  pane: 'shadowPane',
});
streetLayer.addTo(mymap);

let stripes = new L.StripePattern({weight:3,spaceWeight:3,opacity:0.6,angle:135}); stripes.addTo(mymap);

const ADDLAYERS = [
  {
    view: 'sup_district_boundaries', name: 'Supervisorial District Boundaries',
    style: { opacity: 1, weight: 3, color: '#730073', fillOpacity: 0, interactive: false},
  },
  {
    view: 'coc2017_diss', name: 'Communities of Concern',
    style: { opacity: 1, weight: 2, color: 'grey', fillPattern: stripes, interactive: false},
  },
    {
    view: 'hin2017', name: 'High Injury Network',
    style: { opacity: 1, weight: 2, color: 'orange', interactive: false},
  },
]


// some important global variables.
const API_SERVER = 'https://api.sfcta.org/api/';
const GEO_VIEW = 'taz_boundaries';
const DATA_VIEW = 'tnc_land_use';

const GEOTYPE = 'TAZ';
const GEOID_VAR = 'taz';
const DATA_GEOID_VAR = 'sftaz'
const YEAR_VAR = 'year'

const YR_LIST = ['2010','2011','2012','2013','2014','2015','2015_v2','2016','2016_v2',
                 '2010-2011','2010-2012','2010-2013','2010-2014','2010-2015','2010-2015_v2','2010-2016','2010-2016_v2',
                 '2011-2012','2011-2013','2011-2014','2011-2015','2011-2015_v2','2011-2016','2011-2016_v2',
                 '2012-2013','2012-2014','2012-2015','2012-2015_v2','2012-2016','2012-2016_v2',
                 '2013-2014','2013-2015','2013-2015_v2','2013-2016','2013-2016_v2',
                 '2014-2015','2014-2015_v2','2014-2016','2014-2016_v2',
                 '2015-2015_v2','2015-2016','2015-2016_v2',
                 '2015_v2-2016','2015_v2-2016_v2',
                 '2016-2016_v2',
                 ];
const SCNYR_LIST = ['2010','2011','2012','2013','2014','2015','2016']

const DISCRETE_VAR_LIMIT = 10;
const MISSING_COLOR = '#f3f3f3';
const NEGATIVES = ['#de425b','#e66572','#ec838a','#f09fa2','#f3babc','#f3d6d6']
const POSITIVES = ['#d4e1e7','#b7d2de','#99c4d5','#79b5cc','#55a6c3','#1c98ba']
const COLORRAMP = {SEQ: ['#f9f9f9','#fae4e4','#f9cecf','#f8b9ba','#f5a3a6','#f18d93','#eb7680','#e55e6d','#de425b'],
                   //DIV: ['#1c98ba','#55a6c3','#79b5cc','#99c4d5','#b7d2de','#d4e1e7','#f1f1f1','#f3d6d6','#f3babc','#f09fa2','#ec838a','#e66572','#de425b'],
                   DIV: ['#de425b','#e66572','#ec838a','#f09fa2','#f3babc','#f3d6d6','#f1f1f1','#d4e1e7','#b7d2de','#99c4d5','#79b5cc','#55a6c3','#1c98ba'],
                  };

const MIN_BWIDTH = 2;
const MAX_BWIDTH = 10;
const DEF_BWIDTH = 4;
const BWIDTH_MAP = {
  1: DEF_BWIDTH,
  2: DEF_BWIDTH,
  3: [2.5, 5],
  4: [1.6, 3.2, 4.8],
  5: [1.25, 2.5, 3.75, 5],
  6: [1, 2, 3, 4, 5]
};
const MAX_PCTDIFF = 200;
const CUSTOM_BP_DICT = {
  'totalemp': {'base':[50,100,200,400,800,1600,3200,6400], 'diff':[-1600, -800, -400, -200, -100, 100, 200, 400, 800, 1600], 'pctdiff':[-20, -5, 5, 20]},
  'hhlds': {'base':[50,100,200,400,800,1600,3200,6400], 'diff':[-500,-200, -100, 100, 200, 500], 'pctdiff':[-20, -5, 5, 20]},
  'pop': {'base':[50,100,200,400,800,1600,3200,6400], 'diff':[-500,-200, -100, 100, 200, 500], 'pctdiff':[-20, -5, 5, 20]},
}

let sel_colorvals, sel_colors, sel_binsflag;

let chart_deftitle = 'All Segments Combined';

let geoLayer, mapLegend;
let _featJson;
let _aggregateData;
let prec;
let addLayerStore = {};

async function initialPrep() {
  //console.log('1...');
  _featJson = await fetchMapFeatures();

  //console.log('2... ');
  await drawMapFeatures();
  
  //console.log('3... ');
  await buildChartHtmlFromData();
  
  //console.log('3... ');
  await fetchAddLayers();

  //console.log('4 !!!');
}

async function fetchMapFeatures() {
  const geo_url = API_SERVER + GEO_VIEW + '?taz=lt.982&select=taz,geometry';

  try {
    let resp = await fetch(geo_url);
    let features = await resp.json();
    // do some parsing and stuff
    for (let feat of features) {
      feat['type'] = 'Feature';
      feat['geometry'] = JSON.parse(feat.geometry);
    }
    return features;

  } catch (error) {
    console.log('map feature error: ' + error);
  }
}

async function fetchAddLayers() {
  try {
    for (let item of ADDLAYERS) {
      let resp = await fetch(API_SERVER + item.view);
      let features = await resp.json();
      for (let feat of features) {
        feat['type'] = 'Feature';
        feat['geometry'] = JSON.parse(feat.geometry);
      }
      let lyr = L.geoJSON(features, {
        style: item.style,
        pane: 'shadowPane',
      }).addTo(mymap);
      addLayerStore[item.view] = lyr;
      mymap.removeLayer(lyr);
    }
  } catch (error) {
    console.log('additional layers error: ' + error);
  }
}

// hover panel -------------------
let infoPanel = L.control();

infoPanel.onAdd = function(map) {
  // create a div with a class "info"
  this._div = L.DomUtil.create('div', 'info-panel-hide');
  return this._div;
};

function getInfoHtml(geo) {
  let metric_val = null;
  let retval = '<b>Census Block: </b>' + `${geo[GEOID_VAR]}<br/>`;
  retval += `<b>${app.metric_options[0]['text']}</b><br/>` ;
  
  let years = app.sliderValue;
  years.push(app.selected_year);
  for (let yr of years) {
    if (base_lookup[yr].hasOwnProperty(geo[GEOID_VAR])) {
      metric_val = base_lookup[yr][geo[GEOID_VAR]][app.selected_metric];
      
      if (metric_val !== null) {
        metric_val = Math.round(metric_val*prec)/prec;
      }
    }
    retval += `${yr}: ${metric_val}<br/>`;
    if (years[0] == years[1]) break;
  }
  return retval; 
}

infoPanel.update = function(geo) {
  infoPanel._div.innerHTML = '';
  infoPanel._div.className = 'info-panel';
  if (geo) this._div.innerHTML = getInfoHtml(geo);

  infoPanelTimeout = setTimeout(function() {
    // use CSS to hide the info-panel
    infoPanel._div.className = 'info-panel-hide';
    // and clear the hover too
    if (oldHoverTarget.feature[GEOID_VAR] != selGeoId) geoLayer.resetStyle(oldHoverTarget);
  }, 2000);
};
infoPanel.addTo(mymap);

async function getMapData() {
  let data_url = API_SERVER + DATA_VIEW;
  let resp = await fetch(data_url);
  let jsonData = await resp.json();
  base_lookup = {}; // collects attributes for each geometry
  
  let tmp = {}; // aggregates attributes across all geometries
  for (let yr of YR_LIST) {
    tmp[yr] = {};
    base_lookup[yr] = {};
      for (let met of app.metric_options) {
        tmp[yr][met.value] = 0;
      }
  }
  
  for (let entry of jsonData) {
    try {
      base_lookup[entry[YEAR_VAR]][entry[DATA_GEOID_VAR]] = entry;
    } catch(err) {
      console.log(err);
      console.log(entry[YEAR_VAR]);
    }
    for (let met of app.metric_options) {
      tmp[entry[YEAR_VAR]][met.value] += entry[met.value];
    }
  }
  
  _aggregateData = [];

  for (let yr of SCNYR_LIST) {
    let row = {};
    row['year'] = yr.toString();
    for (let met of app.metric_options) {
      row[met.value] = Math.round(tmp[yr][met.value]*prec)/prec;
    }
    _aggregateData.push(row);
  }
}

let base_lookup;
let map_vals;

async function drawMapFeatures(queryMapData=true) {
  // create a clean copy of the feature Json
  if (!_featJson) return;
  let cleanFeatures = _featJson.slice();
  let sel_metric = app.selected_metric;

  prec = 1; //(FRAC_COLS.includes(sel_metric) ? 100 : 1);
  
  try {
    if (queryMapData) {
      if (base_lookup == undefined) await getMapData();
      let map_metric;
      map_vals = [];
      for (let feat of cleanFeatures) {
        map_metric = null;
        if (base_lookup[app.selected_year].hasOwnProperty(feat[GEOID_VAR])) {
          map_metric = base_lookup[app.selected_year][feat[GEOID_VAR]][sel_metric];
        }
        if (map_metric !== null) {
          map_metric = Math.round(map_metric*prec)/prec;
          map_vals.push(map_metric);
        }
        feat['metric'] = map_metric;
      }
      map_vals = map_vals.sort((a, b) => a - b);  
    }
    
    if (map_vals.length > 0) {
      let color_func;
      let sel_colorvals2;
      let bp;
      
      if (queryMapData) {
        sel_colorvals = Array.from(new Set(map_vals)).sort((a, b) => a - b);
        
        //calculate distribution
        let dist_vals = map_vals;
        if (sel_colorvals.length <= DISCRETE_VAR_LIMIT) {
          sel_binsflag = false;
          color_func = chroma.scale(app.selected_colorscheme).mode(getColorMode(app.selected_colorscheme)).classes(sel_colorvals.concat([sel_colorvals[sel_colorvals.length-1]+1]));
          sel_colorvals2 = sel_colorvals.slice(0);
          
        } else {
          let mode = 'base';
          if (app.selected_year.includes('-')) {
            mode = 'diff';
            app.selected_colorscheme = COLORRAMP.DIV;
          } else {
            app.selected_colorscheme = COLORRAMP.SEQ;
          }
          
          let custom_bps = CUSTOM_BP_DICT[sel_metric][mode];
          sel_colorvals = [map_vals[0]];
          for (var i = 0; i < custom_bps.length; i++) {
            //if (custom_bps[i]>map_vals[0] && custom_bps[i]<map_vals[map_vals.length-1]) sel_colorvals.push(custom_bps[i]);
            sel_colorvals.push(custom_bps[i]);
          }
          sel_colorvals.push(map_vals[map_vals.length-1]);
          sel_colorvals = Array.from(new Set(sel_colorvals)).sort((a, b) => a - b);
          //updateColorScheme(sel_colorvals);
          
          sel_binsflag = true; 
          color_func = chroma.scale(app.selected_colorscheme).mode(getColorMode(app.selected_colorscheme)).classes(sel_colorvals);
          sel_colorvals2 = sel_colorvals.slice(0,sel_colorvals.length-1);
        }

      } else {
        throw 'ERROR: This step should not be occurring!!!';
      }
      
      sel_colors = [];
      for(let i of sel_colorvals2) {
        sel_colors.push(color_func(i).hex());
      }
      
      if (geoLayer) mymap.removeLayer(geoLayer);
      if (mapLegend) mymap.removeControl(mapLegend);
      geoLayer = L.geoJSON(cleanFeatures, {
        style: styleByMetricColor,
        onEachFeature: function(feature, layer) {
          layer.on({
            mouseover: hoverFeature,
            click: clickedOnFeature,
            });
        },
      });
      geoLayer.addTo(mymap);
      
      mapLegend = L.control({ position: 'bottomright' });
      mapLegend.onAdd = function(map) {
        let div = L.DomUtil.create('div', 'info legend');
        let legHTML = getLegHTML(
          sel_colorvals,
          sel_colors,
          sel_binsflag,
        );
        legHTML = '<h4>'+app.selected_metric+'</h4>' + legHTML;
        div.innerHTML = legHTML;
        return div;
      };
      mapLegend.addTo(mymap);
      
      if (selectedGeo) {
        if (base_lookup[app.selected_year].hasOwnProperty(selectedGeo.feature[GEOID_VAR])) {
          //buildChartHtmlFromData(selectedGeo.feature[GEOID_VAR]);
          return cleanFeatures.filter(entry => entry[GEOID_VAR] == selectedGeo.feature[GEOID_VAR])[0];
        } else {
          resetPopGeo();
        }
      } else {
        buildChartHtmlFromData();
        return null;
      }
    }

  } catch(error) {
    console.log(error);
    alert(error);
  }
}

function updateColorScheme(colorvals) {
  if (colorvals[0] * colorvals[colorvals.length-1] >= 0) {
    app.selected_colorscheme = COLORRAMP.SEQ;
  } else {
    app.selected_colorscheme = COLORRAMP.DIV;
  } 
}

function styleByMetricColor(feat) {
  let color = getColorFromVal(
              feat['metric'],
              sel_colorvals,
              sel_colors,
              sel_binsflag
              );
  if (!color) color = MISSING_COLOR;
  if (feat['metric']==0) {
    color = MISSING_COLOR;
  }
  return { fillColor: color, opacity: 1, weight: 1, color: color, fillOpacity: 1};
}

let infoPanelTimeout;
let oldHoverTarget;

function hoverFeature(e) {
  clearTimeout(infoPanelTimeout);
  infoPanel.update(e.target.feature);
  
  // don't do anything else if the feature is already clicked
  if (selGeoId === e.target.feature[GEOID_VAR]) return;

  // return previously-hovered segment to its original color
  if (oldHoverTarget && e.target.feature[GEOID_VAR] != selGeoId) {
    if (oldHoverTarget.feature[GEOID_VAR] != selGeoId)
      geoLayer.resetStyle(oldHoverTarget);
  }

  let highlightedGeo = e.target;
  highlightedGeo.bringToFront();
  highlightedGeo.setStyle(styles.selected);
  oldHoverTarget = e.target; 
}

function highlightSelectedSegment() {
  if (!selGeoId) return;

  mymap.eachLayer(function (e) {
    try {
      if (e.feature[GEOID_VAR] === selGeoId) {
        e.bringToFront();
        e.setStyle(styles.popup);
        selectedGeo = e;
        return;
      }
    } catch(error) {}
  });
}

let selGeoId;
let selectedGeo, prevSelectedGeo;
let selectedLatLng;

function clickedOnFeature(e) {
  e.target.setStyle(styles.popup);
  let geo = e.target.feature;
  selGeoId = geo[GEOID_VAR];

  // unselect the previously-selected selection, if there is one
  if (selectedGeo && selectedGeo.feature[GEOID_VAR] != geo[GEOID_VAR]) {
    prevSelectedGeo = selectedGeo;
    geoLayer.resetStyle(prevSelectedGeo);
  }
  selectedGeo = e.target;
  let selfeat = selectedGeo.feature;
  app.chartSubtitle = GEOTYPE + ' ' + selfeat[GEOID_VAR];
  selectedLatLng = e.latlng;
  if (base_lookup[app.selected_year].hasOwnProperty(selGeoId)) {
    showGeoDetails(selectedLatLng);
    buildChartHtmlFromData(selGeoId);
  } else {
    resetPopGeo();
  }
}

let popSelGeo;
function showGeoDetails(latlng) {
  // show popup
  popSelGeo = L.popup()
    .setLatLng(latlng)
    .setContent(infoPanel._div.innerHTML)
    .addTo(mymap);

  // Revert to overall chart when no segment selected
  popSelGeo.on('remove', function(e) {
    resetPopGeo();
  });
}

function resetPopGeo() {
  geoLayer.resetStyle(selectedGeo);
  prevSelectedGeo = selectedGeo = selGeoId = null;
  app.chartSubtitle = chart_deftitle;
  buildChartHtmlFromData();
}

let trendChart = null
function buildChartHtmlFromData(geoid = null) {
  document.getElementById('longchart').innerHTML = '';
  if (geoid) {
    let selgeodata = [];
    for (let yr of SCNYR_LIST) {
      let row = {};
      row['year'] = yr.toString();
      row[app.selected_metric] = base_lookup[yr][geoid][app.selected_metric];
      selgeodata.push(row);
    } 
    trendChart = new Morris.Line({
      data: selgeodata,
      element: 'longchart',
      gridTextColor: '#aaa',
      hideHover: true,
      labels: [app.selected_metric.toUpperCase()],
      lineColors: ['#f66'],
      xkey: 'year',
      smooth: false,
      parseTime: false,
      xLabelAngle: 45,
      ykeys: [app.selected_metric],
    });
  } else {
    trendChart = new Morris.Line({
      data: _aggregateData,
      element: 'longchart',
      gridTextColor: '#aaa',
      hideHover: true,
      labels: [app.selected_metric.toUpperCase()],
      lineColors: ['#f66'],
      xkey: 'year',
      smooth: false,
      parseTime: false,
      xLabelAngle: 45,
      ykeys: [app.selected_metric],
    });
  }
}

async function selectionChanged(thing) {
  for (let met of app.metric_options) {
    if (met.value == app.selected_metric) {
      app.chartTitle = met.text.toUpperCase() + ' TREND';
      break;
    }
  }
  
  if (app.selected_year && app.selected_metric) {
    let selfeat = await drawMapFeatures();
    if (selfeat) {
      highlightSelectedSegment();
      popSelGeo.setContent(getInfoHtml(selfeat));
    }
  }
}

async function updateMap(thing) {
  app.isUpdActive = false;
  let selfeat = await drawMapFeatures(false);
  if (selfeat) {
    highlightSelectedSegment();
    popSelGeo.setContent(getInfoHtml(selfeat));
  }
}
function customBreakPoints(thing) {
  if(thing) {
    app.isUpdActive = false;
  } else {
    drawMapFeatures();
  }
}

function colorschemeChanged(thing) {
  app.selected_colorscheme = thing;
  drawMapFeatures(false);
}

function yrChanged(yr) {
  app.selected_year = yr;
  if (yr=='diff') {
    app.sliderValue = YR_LIST;
  } else {
    app.sliderValue = [yr,yr];
  }
}

function metricChanged(metric) {
  app.selected_metric = metric;
}

function getColorMode(cscheme) {
  if (app.modeMap.hasOwnProperty(cscheme.toString())) {
    return app.modeMap[cscheme];
  } else {
    return 'lrgb';
  }
}

function showExtraLayers(e) {
  for (let lyr in addLayerStore) {
    mymap.removeLayer(addLayerStore[lyr]);
  }
  for (let lyr of app.addLayers) {
    addLayerStore[lyr].addTo(mymap);
  }
}

let scnSlider = {
  data: SCNYR_LIST,
  //direction: 'vertical',
  //reverse: true,
  lazy: true,
  height: 3,
  //width: 'auto',
  style: {marginTop: '10px'},
  processDragable: true,
  eventType: 'auto',
  piecewise: true,
  piecewiseLabel: true,
  tooltip: 'always',
  tooltipDir: 'bottom',
  tooltipStyle: { backgroundColor: '#eaae00', borderColor: '#eaae00', marginLeft:'5px'},
  processStyle: { backgroundColor: "#eaae00"},
  labelStyle: {color: "#ccc", marginLeft:'5px', marginTop:'5px'},
  piecewiseStyle: {backgroundColor: '#ccc',width: '8px',height: '8px',visibility: 'visible'},
};

let app = new Vue({
  el: '#panel',
  delimiters: ['${', '}'],
  data: {
    isPanelHidden: false,
    extraLayers: ADDLAYERS,
    comp_check: false,
    pct_check: false,
    bp0: 0.0,
    bp1: 0.0,
    bp2: 0.0,
    bp3: 0.0,
    bp4: 0.0,
    bp5: 0.0,
    
    scnSlider: scnSlider,
    sliderValue: [SCNYR_LIST[0],SCNYR_LIST[SCNYR_LIST.length-1]],
    
    //selected_year: '2010',
    year_options: [
    {text: '2010', value: '2010'},
    {text: '2015', value: '2015'},
    {text: '2016', value: '2016'},
    {text: '2010 to 2015', value: '2010-2015'},
    {text: '2010 to 2016', value: '2010-2016'},
    {text: '2015 to 2016', value: '2015-2016'},
    ],
    
    selected_metric: 'totalemp',
    metric_options: [
    {text: 'Jobs', value: 'totalemp'},
    {text: 'Population', value: 'pop'},
    {text: 'Households', value: 'hhlds'},
    ],
    
    chartTitle: 'Jobs',
    chartSubtitle: chart_deftitle,
    
    selected_colorscheme: COLORRAMP.SEQ,
    modeMap: {
      '#ffffcc,#663399': 'lch',
      '#ebbe5e,#3f324f': 'hsl',
      '#ffffcc,#3f324f': 'hsl',
      '#3f324f,#ffffcc': 'hsl',
      '#fafa6e,#2A4858': 'lch',
    },
    comment: '',
    addLayers:[],
    selected_breaks: 5,
  },
  computed: {
    selected_year: function() {
      if (this.sliderValue[0] == this.sliderValue[1]) {
        return this.sliderValue[0];
      } else {
        return this.sliderValue[0]+'-'+this.sliderValue[1];
      }
    }
  },
  watch: {
    selected_year: selectionChanged,
    selected_metric: selectionChanged,
    addLayers: showExtraLayers,
  },
  methods: {
    yrChanged: yrChanged,
    metricChanged: metricChanged,
    updateMap: updateMap,
    clickToggleHelp: clickToggleHelp,
    clickedShowHide: clickedShowHide,
  },
  components: {
    vueSlider,
  },
});

let slideapp = new Vue({
  el: '#slide-panel',
  delimiters: ['${', '}'],
  data: {
    isPanelHidden: false,
  },
  methods: {
    clickedShowHide: clickedShowHide,
  },
});

function clickedShowHide(e) {
  slideapp.isPanelHidden = !slideapp.isPanelHidden;
  app.isPanelHidden = slideapp.isPanelHidden;
  // leaflet map needs to be force-recentered, and it is slow.
  for (let delay of [50, 100, 150, 200, 250, 300, 350, 400, 450, 500]) {
    setTimeout(function() {
      mymap.invalidateSize()
    }, delay)
  }
}

// eat some cookies -- so we can hide the help permanently
let cookieShowHelp = Cookies.get('showHelp');
function clickToggleHelp() {
  helpPanel.showHelp = !helpPanel.showHelp;

  // and save it for next time
  if (helpPanel.showHelp) {
    Cookies.remove('showHelp');
  } else {
    Cookies.set('showHelp', 'false', { expires: 365 });
  }
}

let helpPanel = new Vue({
  el: '#helpbox',
  data: {
    showHelp: cookieShowHelp == undefined,
  },
  methods: {
    clickToggleHelp: clickToggleHelp,
  },
  mounted: function() {
    document.addEventListener('keydown', e => {
      if (this.showHelp && e.keyCode == 27) {
        clickToggleHelp();
      }
    });
  },
});

initialPrep();
