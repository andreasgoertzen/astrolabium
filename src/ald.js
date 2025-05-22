import { DEFAULT_PROJECTION, PROJECTIONS } from "@/config/const.js";
import { logj } from "@/util/log.js";
import { requestFullscreen } from "@/util/render.js";
import A from 'aladin-lite';
import axios from "axios";
import * as d3 from 'd3';

const al = async () => {
  d3.select("#container").attr("style",`width: ${window.innerWidth}px; height: ${window.innerHeight}px;`);
  addEventListener("resize", (event) => {
    d3.select("#container").attr("style",`width: ${window.innerWidth}px; height: ${window.innerHeight}px;`);
  })
  await A.init;
  const aladin = A.aladin('#container', {
    // survey: 'https://skies.esac.esa.int/DSSColor',
    // https://aladin.cds.unistra.fr/hips/list
//     survey: `
// CDS/P/JWST/EPO
//     `.trim(),
    // target: 'Cartwheel Galaxy',
    // survey: 'CDS/P/JWST/EPO',
    target: 'andromeda',
    fov: 15,
    cooFrame: "ICRSd",
    showCooGrid: false,
    showCatalog: true,
    showCooLocation: false,
    showFullscreenControl: false,
    showFov: false,
    showFrame: false,
    showGotoControl: false,
    showLayersControl: false,
    showProjectionControl: false,
    showSimbadPointerControl: false,
    showZoomControl: false,
  });

  d3.select(".aladin-logo").remove();

  d3.select('#container')
    .append('div')
    .attr('style', 'position: absolute; bottom: 10px; right:10px; color: green')
    .html(`
        <div class="text-gray-500 bg-amber-300 px-3 py-1 rounded">
      <div class="flex flex-row justify-end mb-2">
        <div id="fs" class="btn btn-primary btn-sm btn-outline">FS</div>
      </div>
       <div class="flex flex-col">      
        <select id="objSelect" class="select select-primary select-sm mb-2"></select>
        <input id="opacityRange" type="range" min="0" max="100" value="100" class="range range-primary mb-2" />
        <div id="raDec"></div>
        <div id="fov"></div>
        </div>
      </div>
    `)
  d3.select('#fs').on('click', () => requestFullscreen());


  const formatNumber = d3.format("08.4f")
   const updateInfo  = () => {
     const raDec = aladin.getRaDec();
     d3.select('#raDec').html(`<div class="font-mono text-right">ra ${formatNumber(raDec[0])} dec ${formatNumber(raDec[1])}</div>`);
     const fov = aladin.getFov();
     d3.select('#fov').html(`<div class="font-mono text-right">fw ${formatNumber(fov[0])}&nbsp;&nbsp;fh ${formatNumber(fov[1])}</div>`);
   }

  aladin.on('positionChanged', updateInfo);
  aladin.on('zoomChanged', updateInfo);

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

 const showHips = (id) => {
   const s = aladin.newImageSurvey(id);
   aladin.setImageLayer(s);
 }

  // console.log(aladin.getBaseImageLayer());
  const hipsList = {
    mars: 'CDS/P/Mars/Pan-Stimson',
  }
 // showHips(`CDS/P/Moon/geological-map`)
 // aladin.gotoRaDec(159.2075, -58.6230)
 //  aladin.setFov(.2)
 //  aladin.gotoObject('m 4', {
 //    success: raDec => console.log(raDec)
 //  })
 //  aladin.adjustFovForObject('carina nebula');

  // https://cdsarc.cds.unistra.fr/saadavizier/download?oid=864972989978905533
  // https://archive.stsci.edu/hlsps/jwst-ero/hlsp_jwst-ero_jwst_miri_carina_f770w_v1_i2d.fits

  // aladin.displayFITS(
  //   'https://cdsarc.cds.unistra.fr/saadavizier/download?oid=864972989978905533', // url of the fits file
  //   {}, // no optional params
  //   (ra, dec, fov, image) => { // ra, dec and fov are centered around the fits image
  //     image.setColormap('magma', {stretch: 'sqrt'});
  //
  //     aladin.gotoRaDec(ra, dec);
  //
  //     aladin.setFoV(2 * fov);
  //
  //   }
  // );

  const jwstTargetsRaw = [['30 Doradus', 84.67665, -69.10093333], ['Abell 2744', 3.58345833, -30.38827778], ['Arp 107', 163.06228295, 30.05788068], ['Arp 142', 144.43583333, 2.75416667], ['Arp 220', 233.73843317, 23.50322456], ['CEERS field', 214.90587, 52.8664313], ['Carina Nebula', 159.208306, -58.6163655], ['Cartwheel Galaxy', 9.4213055, -33.71625419], ['Cas A', 350.8584, 58.8113], ['Cha 1', 166.658837, -77.3881568], ['Cosmic Seahorse', 186.712741, 21.833142], ['Crab Nebula', 83.6324, 22.0174], ['Eagle Nebula', 274.72545, -13.8337142], ['EGSY8p7', 215.03549, 52.89069], ['El Gordo', 15.71875, -49.24944444], ['GOODS-N Field', 189.22916667, 62.2375], ['GRB 230307A', 60.85933333, -75.37883333], ['HH 211', 55.9855, 32.01466667], ['HH 30', 67.90627312, 18.20677332], ['HH 46/47', 126.43166667, -51.01], ['HH 49', 166.50020833, -77.56], ['HH 797', 55.98129167, 32.07088889], ['Horsehead Nebula', 85.24583333, -2.45833333], ['Hubble Ultra Deep Field', 53.1625, -27.79138889], ['I Zw 18', 143.50875, 55.24027778], ['IC 1623', 16.947418, -17.506809], ['IC 348', 56.132, 32.159], ['IC 2163', 94.11652976, -21.37587034], ['IC 5332', 353.61453333, -36.10108056], ['II ZW 96', 314.34845, 17.129055], ['Leo P', 155.438013, 18.088024], ['LDN 483', 274.39583333, -4.66333333], ['LDN 1527', 69.9763371, 26.0534377], ['LEDA 2046648', 254.64602372, 34.2751902], ['LMC N79', 73.0, -69.375], ['M 74', 24.17393802, 15.78364098], ['M 82', 148.96845833, 69.67970278], ['M 83', 204.25383, -29.86576111], ['M 106', 184.74008333, 47.30371944], ['MACS J0138.0 -2155', 24.5, -21.91666667], ['MACS J0416.1-2403', 64.03491667, -24.07244444], ['MACS J0417.5-1154', 64.39416667, -11.90888889], ['MACS J1423.8+2404', 215.94875, 24.07777778], ['NGC 602', 22.383888, -73.560593], ['NGC 604', 23.63375, 30.78361111], ['NGC 1087', 41.60481256, -0.49873829], ['NGC 1300', 49.92102592, -19.41116321], ['NGC 1333', 52.297, 31.31], ['NGC 1365', 53.40190833, -36.14065833], ['NGC 1385', 54.3680125, -24.50127778], ['NGC 1433', 55.50618642, -47.22192475], ['NGC 1512', 60.97617083, -43.34885], ['NGC 1514', 62.32077328, 30.77596414], ['NGC 1559', 64.39896192, -62.78368099], ['NGC 1566', 65.00165353, -54.93795131], ['NGC 1672', 71.4273, -59.24741111], ['NGC 2090', 86.75773211, -34.25046646], ['NGC 2283', 101.46995878, -18.21043064], ['NGC 2566', 124.69003333, -25.49951944], ['NGC 2835', 139.4702183, -22.35467753], ['NGC 3132', 151.75735684, -40.43642515], ['NGC 3256', 156.96368333, -43.90376389], ['NGC 3351', 160.99054729, 11.70369478], ['NGC 346', 14.76833333, -72.1775], ['NGC 3627', 170.0626, 12.9915], ['NGC 4254', 184.70677083, 14.41648889], ['NGC 4303', 185.47886774, 4.47377705], ['NGC 4321', 185.728875, 15.82230452], ['NGC 4449', 187.046325, 44.09355833], ['NGC 4535', 188.58476813, 8.19775236], ['NGC 5068', 199.7283625, -21.0391], ['NGC 5468', 211.64537744, -5.45297745], ['NGC 628', 24.17393802, 15.78364098], ['NGC 6440', 267.21945833, -20.35958333], ['NGC 7317', 338.96611739, 33.94493279], ['NGC 7469', 345.8151, 8.8739], ['NGC 7496', 347.44703202, -43.42785546], ['QSO J1131-1231', 172.96474458, -12.53297667], ['RX J2129.6+0005', 322.41875, 0.09638889], ['SDSS J165202.64+172852.3', 253.01103537, 17.48122197], ['SN 1987A', 83.86675, -69.26974167], ['Sagittarius C', 266.15125, -29.47027778], ['Serpens Nebula', 277.48333333, 1.24666667], ['Spiderweb Protocluster', 175.19917, -26.48931], ['VV191', 207.09319731278998, 25.68046081747], ['ZS7', 150.099, 2.34360278], ['Westerlund 1', 251.76, -45.852], ['[WHL2012] J013719.8-082841', 24.35375, -8.45611111], ['WR 124', 287.87864549, 16.86061137], ['WR 140', 305.1165658, 43.85452412], ['[BOM2000] d203-506', 83.834625, -5.41821389], ['[PGU2007] cep35', 0.49208333, -15.48275], ['[SCB2018] SPTJ0615-JD1', 93.97929167, -57.7721], ['[YKT2006b] Cloud2-S', 42.11958333, 58.39294444]];
  const targets = jwstTargetsRaw.map(([name, ra, dec], id) => ({id: id + 1, name: "JWST: " + name, ra, dec}));
  targets.unshift({name: 'Andromeda Galaxie', ra: 10.6847, dec: 41.2687, id: 0})
  const jwst = aladin.newImageSurvey('CDS/P/JWST/EPO');
  aladin.setOverlayImageLayer(jwst);

  let selectedTargetIndex = -1;
  const handleSelect = (e => {
    console.log(e.target.value);
    const selectedTarget = targets[e.target.value];
    aladin.gotoRaDec(selectedTarget.ra, selectedTarget.dec);
    // aladin.setFov(.1)
  })
  d3.select('#objSelect')
    .on('change', handleSelect)
    .selectAll('option')
    .data(targets)
    .enter()
    .append('option')
    .attr('value', d => d.id)
    .property('selected', d => d.id === selectedTargetIndex)
    .text(d => `${d.name}`)
    .on('click', handleSelect);

  d3.select('#opacityRange').on('input', (e) => {
    const value = e.target.value;
    jwst.setOpacity(value / 100);
  })
}

export default al;
