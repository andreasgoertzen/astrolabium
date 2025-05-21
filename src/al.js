import A from 'aladin-lite';
import axios from "axios";
import { logJson } from "@/util/convertUtil.js";
import * as d3 from 'd3';
const al = async () => {
  await A.init;
  const aladin = A.aladin('#container', {
    fullScreen: true,
    survey: 'https://skies.esac.esa.int/DSSColor',
    target: 'andromeda',
    fov: 30,
    cooFrame: "ICRSd",
    inertia: true,
    showReticle: true,
    // showCooGrid: true, // instabil
    projection: 'SIN',
    showCatalog: true,
    showContextMenu: false,
    showCooLocation: true,
    showFullscreenControl: false,
    showFov: true,
    showFrame: false,
    showGotoControl: false,
    showLayersControl: false,
    showProjectionControl: false,
    showSimbadPointerControl: false,
    showZoomControl: false,
    // showCooGridControl: true,
    // showSimbadPointerControl: true,
    // showShareControl: true,
    // fov: 180,
    // showContextMenu: true
  });

  d3.select(".aladin-logo").remove();

  var drawFunction = function(source, ctx, viewParams) {
    ctx.beginPath();
    ctx.arc(source.x, source.y, source.data['size'] * 2, 0, 2 * Math.PI, false);
    ctx.closePath();
    ctx.strokeStyle = '#c38';
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.7,
      ctx.stroke();
    var fov = Math.max(viewParams['fov'][0], viewParams['fov'][1]);

    // object name is displayed only if fov<10°
    if (source.data.fovMin && fov<source.data.fovMin) {
      return;
    }
    if (source.data.fovMax && fov>source.data.fovMax) {
      return;
    }

    ctx.globalAlpha = 0.9;
    ctx.globalAlpha = 1;

    var xShift = 0;

    ctx.font = '15px Arial'
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = source.data['color'];
    ctx.fillText(source.data['name'], source.x + xShift, source.y -4);
    if (source.data['name2'] != null) {
      ctx.fillText(source.data['name2'], source.x + xShift, source.y + 16);
    }
  };

  const constellationLines = (await axios.get('/data/constellations.lines.json')).data.features.map(x => x.geometry.coordinates);
  const constellationBounds = (await axios.get('/data/constellations.bounds.json')).data.features.map(x => x.geometry.coordinates);

  var overlay = A.graphicOverlay({color: '#ee2345', lineWidth: 2});
  aladin.addOverlay(overlay);
  for (let constellationLine of constellationLines) {
    for (let line of constellationLine) {
      overlay.add(A.polyline(line, { color: d3.color('gray').hex(), lineWidth: 1 }));
    }
  }
  for (let constellationLine of constellationBounds) {
    for (let line of constellationLine) {
        overlay.add(A.polyline(line, {
          color: d3.color('lightskyblue').darker(1.5).hex(),
          lineWidth: 1
        }));
    }
  }
  // const cata = (await axios.get('http://cdsxmatch.u-strasbg.fr/QueryCat/QueryCat?catName=SIMBAD&mode=cone&pos=M1&r=50arcmin&format=votable&limit=3000')).data;
  // logJson(cata);
  // var cat = A.catalogFromURL('/xmatch/QueryCat/QueryCat?catName=SIMBAD&mode=cone&pos=M1&r=50arcmin&format=votable&limit=3000', {sourceSize:12, color: '#cc99bb', displayLabel: true, labelColumn: 'main_id', labelColor: '#ae4', labelFont: '9px sans-serif'});
  // aladin.addCatalog(cat);
  var cat = A.catalog({color: 'red', shape: drawFunction });
  var sources = [];
  (await axios.get('/converted/iau-csn.json')).data
  .forEach(x => {
    sources.push(A.source(x.ra, x.dec, {
      name: x.name,
      color: d3.color('darkkhaki').hex(),
      fovMin: 7,
    }));
  });
  (await axios.get('/data/constellations.json')).data.features
    .forEach(x => {
      sources.push(A.source(x.geometry.coordinates[0], x.geometry.coordinates[1], {
        name: x.properties.de,
        color: d3.color('lightskyblue').darker(1.5).hex()
      }));
    });

  const dsos6 = (await axios.get('/data/dsos.14.json')).data.features;
  const dsonames = (await axios.get('/data/dsonames.json')).data;

  dsos6.forEach(x => {
    const ra = x.geometry.coordinates[0];
    const dec = x.geometry.coordinates[1];
    const id = x.id;
    const dsoname = dsonames[id];
    let name = x.properties.desig;
    let name2 = dsoname?.de != null ? dsoname.de : null;
    if (name2 != null) {
      sources.push(A.source(ra, dec, {
        name,
        name2,
        fovMax: 50,
        color: d3.color('sandybrown').hex()
      }))
    }
  })

  cat.addSources(sources);

  aladin.addCatalog(cat);

}

export default al;
