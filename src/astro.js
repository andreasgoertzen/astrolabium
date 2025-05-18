import {
  DEFAULT_PROJECTION,
  DEFAULT_SHOW_MILKY_WAY,
  PLANETS,
  PROJECTION_COLOR,
  PROJECTIONS,
  ZOOM_SCALE_EXTENT
} from "@/config/const.js";
import { formatDate, formatDec, formatRa, generateEclipticGeoJSON, isPointVisible } from "@/util/calc.js";
import { renderTextGraticule } from "@/util/render.js";
import Zoomer from "@/util/Zoomer.js";
import { center, simplify } from "@turf/turf";
import * as Astronomy from 'astronomy-engine';
import axios from "axios";
import * as d3 from 'd3';

export default async () => {
  let showMilkyWay = DEFAULT_SHOW_MILKY_WAY;

  const data = {
    xhip: (await axios("/converted/xhip.json")).data,
    iauCsn: (await axios("/converted/iau-csn.json")).data,
    asterisms: (await axios("/data/asterisms.json")).data.features,
    constellations: (await axios("/data/constellations.json")).data.features,
    constellationLines: (await axios("/data/constellations.lines.json")).data.features,
    constellationBounds: (await axios("/data/constellations.borders.json")).data.features,
    dsonames: (await axios("/data/dsonames.json")).data,
    graticuleLines: d3.geoGraticule().step([15, 10]).lines(),
    messier: (await axios("/data/messier.json")).data.features,
    milkyWay: (await axios("/data/milkyway.json")).data.features,
    milkyWaySimple: [],
    starNames: (await axios("/data/starnames.json")).data,
  };

  let latitude = 53.52;
  let longitude = 12.25;
  let date = new Date();

  const observer = new Astronomy.Observer(latitude, longitude, 0);
  const planets = PLANETS.filter(x => x.body && x.body !== "Earth");
  for (let planet of planets) {
    let equ_2000 = Astronomy.Equator(planet.body, date, observer, false, true);
    planet.ra = equ_2000.ra;
    planet.dec = equ_2000.dec;
  }
  let sunset   = Astronomy.SearchRiseSet('Sun',  observer, -1, date, 300);
  let moonrise = Astronomy.SearchRiseSet('Moon', observer, +1, date, 300);


  const ecliptic = generateEclipticGeoJSON();

  const scaleMag = d3.scaleLinear(d3.extent(data.xhip, d => d.mag), [4, 0.5]);
  const scaleBv = d3.scaleOrdinal([3.347, -0.335], ['#ff4700', '#ff4b00', '#ff4f00', '#ff5300', '#ff5600', '#ff5900', '#ff5b00', '#ff5d00', '#ff6000', '#ff6300', '#ff6500', '#ff6700', '#ff6900', '#ff6b00', '#ff6d00', '#ff7000', '#ff7300', '#ff7500', '#ff7800', '#ff7a00', '#ff7c00', '#ff7e00', '#ff8100', '#ff8300', '#ff8506', '#ff870a', '#ff8912', '#ff8b1a', '#ff8e21', '#ff9127', '#ff932c', '#ff9631', '#ff9836', '#ff9a3c', '#ff9d3f', '#ffa148', '#ffa34b', '#ffa54f', '#ffa753', '#ffa957', '#ffab5a', '#ffad5e', '#ffb165', '#ffb269', '#ffb46b', '#ffb872', '#ffb975', '#ffbb78', '#ffbe7e', '#ffc184', '#ffc489', '#ffc78f', '#ffc892', '#ffc994', '#ffcc99', '#ffce9f', '#ffd1a3', '#ffd3a8', '#ffd5ad', '#ffd7b1', '#ffd9b6', '#ffdbba', '#ffddbe', '#ffdfc2', '#ffe1c6', '#ffe3ca', '#ffe4ce', '#ffe8d5', '#ffe9d9', '#ffebdc', '#ffece0', '#ffefe6', '#fff0e9', '#fff2ec', '#fff4f2', '#fff5f5', '#fff6f8', '#fff9fd', '#fef9ff', '#f9f6ff', '#f6f4ff', '#f3f2ff', '#eff0ff', '#ebeeff', '#e9edff', '#e6ebff', '#e3e9ff', '#e0e7ff', '#dee6ff', '#dce5ff', '#d9e3ff', '#d7e2ff', '#d3e0ff', '#c9d9ff', '#bfd3ff', '#b7ceff', '#afc9ff', '#a9c5ff', '#a4c2ff', '#9fbfff', '#9bbcff']);

  const formatNumber = d3.format(".2f");

  let width = window.innerWidth;
  let height = window.innerHeight;

  const container = d3.select("#container");
  const canvas = container
    .append('canvas')
    .attr("width", width)
    .attr("height", height);

  const info = container
    .append('div')
    .style('position', 'absolute')
    .style('bottom', '10px')
    .style('left', '10px')
    .style('overflow-y', 'auto');

  info.html(`
        <div class="p-2 rounded bg-orange-400">
            <div id="radec"></div>
            <div>
            Projektion
            <select id="projection" class="select"></select>
            </div>
            <div id="phases"></div>
            </div>
        `);

  info.select('#phases').append('div').html(`↓ Sonne: ${formatDate(sunset.date)}<br/>↑ Mond: ${formatDate(moonrise.date)}`)
  const handleSelect = (e => {
    const selectedProjection = PROJECTIONS[e.target.value];
    if (selectedProjection) chooseProjection(selectedProjection)
  })
  info.select('#projection')
    .on('change', handleSelect)
    .selectAll('option')
    .data(Object.keys(PROJECTIONS))
    .enter()
    .append('option')
    .attr('value', d => d)
    .property('selected', d => d === DEFAULT_PROJECTION)
    .text(d => d)
    .on('click', handleSelect);

  const ctx = canvas.node().getContext('2d');
  let p; // projection
  const geoPath = d3.geoPath().context(ctx);
  const zoomer = new Zoomer();
  const zoomFkt = d3.zoom()
    .scaleExtent(ZOOM_SCALE_EXTENT)
    .on('start', ev => zoomer.zoomStarted(ev))
    .on('zoom', ev => zoomer.zoomed(ev));
  canvas.call(zoomFkt);

  let render;
  const chooseProjection = proj => {
    const scale = p ? p.scale() : Math.max(width, height);
    p = proj();
    p.clipAngle(90)
      .reflectX(true)
      .translate([width / 2, height / 2])
      .scale(scale);
    zoomer.projection = p;
    geoPath.projection(p);
    if (render) render();
  }
  chooseProjection(PROJECTIONS[DEFAULT_PROJECTION]);
  zoomer.unityScale = p.scale();

  let unityScale = p.scale();

  container.append('div')
    .style('position', 'absolute')
    .style('right', '10px')
    .style('bottom', '10px')
    .append('div')
    .append('svg')
    .attr('id', 'north')
    .attr('viewBox', '0 0 100 100')
    .attr('width', 50)
    .attr('height', 50)
    .append('path')
    .attr('d', "M 50,0 C 48.115043,0.22071533 47.947485,2.5854588 47.028768,3.8841202 43.627964,10.754409 40.112887,17.581087 36.7832,24.478516 c -0.679562,1.821295 1.911714,2.930961 3.022939,1.51794 2.842641,-2.030721 5.685281,-4.061442 8.527922,-6.092163 0,13.73047 0,27.46094 0,41.19141 -3.790785,4.91832 -7.676419,9.777137 -11.408283,14.732422 -0.564063,2.193509 -0.116889,4.571476 -0.25977,6.840593 0.06022,5.363847 -0.12024,10.752268 0.08984,16.100813 0.72041,2.202869 3.254785,0.839618 3.911079,-0.719279 C 43.777952,94.049778 46.888976,90.049303 50,86.048828 c 3.479963,4.449745 6.917357,8.941903 10.423832,13.365234 1.636649,1.695918 3.454957,-0.598006 2.910204,-2.322021 -0.02742,-6.873681 0.05479,-13.758531 -0.04102,-20.625244 -0.899873,-2.07979 -2.715752,-3.68213 -3.996302,-5.562116 -2.543566,-3.269659 -5.087132,-6.539319 -7.630698,-9.808978 0,-13.730469 0,-27.460937 0,-41.191406 3.191914,2.203111 6.255953,4.623024 9.527342,6.691409 1.803265,0.545667 2.744137,-1.858366 1.594723,-3.080403 C 58.972082,15.940324 55.243507,8.3100878 51.373047,0.76953125 51.098303,0.26963663 50.545149,0.04157802 50,0 Z")
  ;
  container.select('#north').on('click', () => {
    d3.selection().transition()
      .duration(1000).tween("rotate", function () {
      const i = d3.interpolate(p.rotate()[2], 0);
      return t => {
        const rotation = p.rotate();
        p.rotate([rotation[0], rotation[1], i(t)]);
        render();
      }
    })
  });


  const onResize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.attr("width", width)
      .attr("height", height);
    p.translate([width / 2, height / 2])
      .scale(Math.max(width, height));
    unityScale = p.scale();
    render();
  }
  window.addEventListener('resize', onResize);

  data.milkyWay.forEach(x => simplify(x, {
    tolerance: 10,
    highQuality: false
  }))

  render = () => {
    const zoomFactor = p.scale() / unityScale;
    ctx.clearRect(0, 0, width, height);

    // background
    ctx.beginPath();
    ctx.fillStyle = PROJECTION_COLOR;
    ctx.fillRect(0, 0, width, height);

    // graticule
    ctx.beginPath();
    ctx.lineWidth = .8;
    ctx.strokeStyle = d3.color('rgba(200,100,200, .5)');
    data.graticuleLines.forEach(x => geoPath(x));
    ctx.stroke();

    // graticule
    ctx.beginPath();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = d3.color('orange');
    geoPath(ecliptic);
    ctx.stroke();


    // milky way
    for (const x of data.milkyWay) {
      if (!showMilkyWay) continue;
      ctx.beginPath();
      ctx.fillStyle = 'rgba(255, 255, 255, .05)';
      geoPath(x);
      ctx.fill();
    }

    // constellation bounds
    ctx.lineWidth = 2;
    ctx.strokeStyle = d3.color('lightskyblue').darker(1.5);
    for (const x of data.constellationBounds) {
      ctx.beginPath();
      ctx.lineWidth = 1.5;
      geoPath(x.geometry);
      ctx.stroke();
    }

    // constellation lines
    ctx.lineWidth = 2;
    ctx.strokeStyle = d3.color('gray');
    data.constellationLines.forEach(x => {
      ctx.beginPath();
      ctx.lineWidth = 2;
      geoPath(x.geometry);
      ctx.stroke();
    })

    // asterism lines
    ctx.lineWidth = 2;
    ctx.strokeStyle = d3.color('darkseagreen');
    for (const x of data.asterisms) {
      ctx.beginPath();
      geoPath(x.geometry);
      ctx.stroke();
    }

    // messier objects
    ctx.strokeStyle = d3.color('red');
    for (const x of data.messier) {
      const c = x.geometry.coordinates;
      if (!isPointVisible(p, c)) continue;
      const pc = p(c);
      ctx.beginPath();
      ctx.arc(pc[0], pc[1], 4, 0, 2 * Math.PI);
      ctx.stroke();
      // if (scaleMag(x.properties.mag) * zoomFactor < .4) continue;
      ctx.font = '16px sans-serif';
      ctx.fillStyle = d3.color('red').darker(.5);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      const dsoname = data.dsonames[x.properties.desig]
      ctx.fillText(x.properties.name, pc[0], pc[1] - 6);
      if (dsoname && dsoname.de) {
        ctx.fillText(dsoname.de, pc[0], pc[1] + 20);
      }
    }

    for (const x of planets) {
      const c = [x.ra * 15, x.dec];
      if (!isPointVisible(p, c)) continue;
      ctx.fillStyle = x.fill;
      const pc = p(c);
      ctx.beginPath();
      ctx.arc(pc[0], pc[1], 10, 0, 2 * Math.PI);
      ctx.fill();

      ctx.font = '16px sans-serif';
      ctx.fillStyle = x.fill;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(x.de, pc[0], pc[1] + 20);
    }

    // graticule labels
    for (const x of data.graticuleLines) {
      if (x.coordinates[0][0] === x.coordinates[1][0]) {
        // lon
        const c = x.coordinates[Math.floor(x.coordinates.length / 2)];
        if (c[0] % 90 !== 0) {
          for (let i = -60; i <= 60; i += 30) {
            renderTextGraticule(
              p,
              [c[0], i],
              ctx,
              (c[0] / 15 + 24) % 24,
              d3.color('lightsteelblue')
            );
          }
        }
      } else {
        // lat
        for (const c of x.coordinates) {
          if (c[0] % 90 === 0) {
            renderTextGraticule(
              p,
              c,
              ctx,
              c[1],
              d3.color('darkkhaki')
            );
          }
        }
      }
    }

    // constellation names
    for (const x of data.constellations) {
      const c = x.geometry.coordinates;
      if (!isPointVisible(p, c)) continue;
      const pc = p([c[0], c[1]]);
      ctx.font = '16px sans-serif';
      ctx.fillStyle = d3.color('lightskyblue').darker(1.5);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(x.properties.de, pc[0], pc[1]);
    }

    // asterism names
    for (const x of data.asterisms) {
      const c = center(x).geometry.coordinates;
      if (!isPointVisible(p, c)) continue;
      const pc = p(c);
      ctx.font = '14px sans-serif';
      ctx.fillStyle = d3.color('darkseagreen');
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(x.properties.de, pc[0], pc[1]);
    }

    // stars xhip
    for (const x of data.xhip) {
      const c = [x.ra, x.dec];
      if (!isPointVisible(p, c)) continue;
      const r = scaleMag(x.mag) * zoomFactor;
      const pc = p([x.ra, x.dec]);
      ctx.beginPath();
      ctx.fillStyle = scaleBv(x.bv);
      ctx.arc(pc[0], pc[1], Math.min(r, 5), 0, 2 * Math.PI);
      ctx.fill();
    }
    // star names
    for (const x of data.iauCsn) {
      const c = [x.ra, x.dec];
      if (!isPointVisible(p, c)) continue;
      const r = scaleMag(x.mag) * zoomFactor;
      if (r < 1.1) continue;
      const pc = p([x.ra, x.dec]);
      ctx.font = '15px sans-serif';
      ctx.fillStyle = d3.color('darkkhaki');
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(x.name, pc[0], pc[1] - Math.min(r, 5));
    }

    // center cross
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(200, 200, 200, .5)';
    const cw = width / 36;
    const cc = width / 144;
    ctx.moveTo(width / 2 - cw, height / 2);
    ctx.lineTo(width / 2 - cc, height / 2);
    ctx.moveTo(width / 2 + cc, height / 2);
    ctx.lineTo(width / 2 + cw, height / 2);

    ctx.moveTo(width / 2, height / 2 - cw);
    ctx.lineTo(width / 2, height / 2 - cc);
    ctx.moveTo(width / 2, height / 2 + cc);
    ctx.lineTo(width / 2, height / 2 + cw);

    ctx.stroke();

    const north = p.rotate()[2];
    container.select('#north').style('transform', `rotate(${north}deg)`);
    const rotation = p.rotate();
    const ra = -rotation[0];
    const dec = -rotation[1];
    info.select('#radec').html(`ra: ${formatRa(ra)}<br/>dec: ${formatDec(dec)}`);
  }

  render();
  zoomer.render = render;

}
