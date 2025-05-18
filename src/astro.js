import { BACKGROUND_COLOR, PROJECTION_COLOR } from "@/config/const.js";
import { isPointVisible } from "@/util/calc.js";
import { renderTextGraticule } from "@/util/render.js";
import Zoomer from "@/util/Zoomer.js";
import simplify from "@turf/simplify";
import { center } from "@turf/turf";
import axios from "axios";
import * as d3 from 'd3';
import { geoAitoff } from "d3-geo-projection";

export default async () => {
  let showMilkyWay = false;

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
    stars: (await axios("/data/stars.8.json")).data.features,
    starNames: (await axios("/data/starnames.json")).data,
  };

  const scaleMag = d3.scaleLinear(d3.extent(data.stars, d => d.properties.mag), [4, 0.5]);
  const scaleBv = d3.scaleOrdinal([3.347, -0.335], ['#ff4700', '#ff4b00', '#ff4f00', '#ff5300', '#ff5600', '#ff5900', '#ff5b00', '#ff5d00', '#ff6000', '#ff6300', '#ff6500', '#ff6700', '#ff6900', '#ff6b00', '#ff6d00', '#ff7000', '#ff7300', '#ff7500', '#ff7800', '#ff7a00', '#ff7c00', '#ff7e00', '#ff8100', '#ff8300', '#ff8506', '#ff870a', '#ff8912', '#ff8b1a', '#ff8e21', '#ff9127', '#ff932c', '#ff9631', '#ff9836', '#ff9a3c', '#ff9d3f', '#ffa148', '#ffa34b', '#ffa54f', '#ffa753', '#ffa957', '#ffab5a', '#ffad5e', '#ffb165', '#ffb269', '#ffb46b', '#ffb872', '#ffb975', '#ffbb78', '#ffbe7e', '#ffc184', '#ffc489', '#ffc78f', '#ffc892', '#ffc994', '#ffcc99', '#ffce9f', '#ffd1a3', '#ffd3a8', '#ffd5ad', '#ffd7b1', '#ffd9b6', '#ffdbba', '#ffddbe', '#ffdfc2', '#ffe1c6', '#ffe3ca', '#ffe4ce', '#ffe8d5', '#ffe9d9', '#ffebdc', '#ffece0', '#ffefe6', '#fff0e9', '#fff2ec', '#fff4f2', '#fff5f5', '#fff6f8', '#fff9fd', '#fef9ff', '#f9f6ff', '#f6f4ff', '#f3f2ff', '#eff0ff', '#ebeeff', '#e9edff', '#e6ebff', '#e3e9ff', '#e0e7ff', '#dee6ff', '#dce5ff', '#d9e3ff', '#d7e2ff', '#d3e0ff', '#c9d9ff', '#bfd3ff', '#b7ceff', '#afc9ff', '#a9c5ff', '#a4c2ff', '#9fbfff', '#9bbcff']);

  let width = window.innerWidth;
  let height = window.innerHeight;

  const container = d3.select("#container");
  const canvas = container
    .append('canvas')
    .attr("width", width)
    .attr("height", height);
  ;
  const ctx = canvas.node().getContext('2d');
  const p = geoAitoff()
    .clipAngle(90)
    .reflectX(true)
    .translate([width / 2, height / 2])
    .scale(Math.max(width, height))
  ;
  let unityScale = p.scale();
  const geoPath = d3
    .geoPath()
    .projection(p)
    .context(ctx);

  const onResize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.attr("width", width)
      .attr("height", height);
    p.translate([width / 2, height / 2])
      .scale(Math.max(width, height));
    unityScale = p.scale();
    zoomer.unityScale = unityScale;
    render();
  }
  window.addEventListener('resize', onResize);

  data.milkyWay.forEach(x => simplify(x, {
    tolerance: 10,
    highQuality: false
  }))

  const render = () => {
    const zoomFactor = p.scale() / unityScale;
    ctx.clearRect(0, 0, width, height);

    // background
    ctx.beginPath();
    ctx.fillStyle = PROJECTION_COLOR;
    ctx.fillRect(0, 0, width, height);

    // projection background
    ctx.beginPath();
    ctx.fillStyle = PROJECTION_COLOR;
    ctx.arc(width / 2, height / 2, p.scale(), 0, 2 * Math.PI);
    ctx.fill();

    // graticule
    ctx.beginPath();
    ctx.lineWidth = .8;
    ctx.strokeStyle = d3.color('rgba(200,100,200, .5)');
    data.graticuleLines.forEach(x => geoPath(x));
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
      if (scaleMag(x.properties.mag) * zoomFactor < .5) continue;
      const pc = p(c);
      ctx.beginPath();
      ctx.arc(pc[0], pc[1], 4, 0, 2 * Math.PI);
      ctx.stroke();
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
      ctx.arc(pc[0], pc[1], Math.min(r,5), 0, 2 * Math.PI);
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
      ctx.fillText(x.name, pc[0], pc[1] - Math.min(r,5));
    }
  }

  render();
  const zoomer = new Zoomer(canvas, p, render);
}
