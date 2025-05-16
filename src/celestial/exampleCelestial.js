import { bvToHex } from "@/util/bvToHex.js";
import { logj } from "@/util/log.js";
import Zoomer from "@/util/Zoomer.js";
import * as d3 from 'd3';

export default async () => {
  const config = {}
  const data = {
    constellations: (await d3.json("/data/constellations.json")).features,
    constellationLines: (await d3.json("/data/constellations.lines.json")).features,
    graticuleLines: d3.geoGraticule().step([15, 10]).lines(),
    stars: (await d3.json("/data/stars.6.json")).features,
    starNames: (await d3.json("/data/starnames.json")),
    selectedStars: []
  };
  const scale = {
    magnitude: d3.scaleLinear(d3.extent(data.stars, d => d.properties.mag), [4, 0.5])
  }

  let width = window.innerWidth;
  let height = window.innerHeight;

  const container = d3.select("#container");
  const canvas = container.append('canvas');
  const ctx = canvas.node().getContext('2d');
  const projection = d3
    .geoOrthographic()
    .clipAngle(90)
    .reflectX(true)
  ;
  const geoPath = d3
    .geoPath()
    .projection(projection)
    .context(ctx)
    .pointRadius((d, pointRadius) => pointRadius || 1);
  // logj(data.graticuleLines)
  // prepare data
  data.stars.forEach(x => {
    x.properties.color = bvToHex(x.properties.bv);
    x.properties.r = scale.magnitude(x.properties.mag);
  })

  function isPointVisible(coords) {
    // D3's Projektion gibt null zurück, wenn der Punkt nicht sichtbar ist
    // Aber wir wollen eine etwas robustere Lösung

    // Berechne den "dot product" mit der Sichtrichtung
    const lambda = coords[0] * Math.PI / 180;
    const phi = coords[1] * Math.PI / 180;
    const rotation = projection.rotate();
    const rotLambda = rotation[0] * Math.PI / 180;
    const rotPhi = rotation[1] * Math.PI / 180;

    // Einfache Version: Berechne den Winkel zwischen dem Punkt und dem Zentrum der Kugel
    const angle = Math.acos(
      Math.sin(phi) * Math.sin(-rotPhi) +
      Math.cos(phi) * Math.cos(-rotPhi) * Math.cos(lambda - (-rotLambda))
    );

    // Sichtbar, wenn der Winkel kleiner als 90° ist
    return angle < Math.PI / 2;
  }

  logj(data.graticuleLines);

  const renderText = (label, coords) => {
    if (isPointVisible(coords)) {
      const pixelCoords = projection(coords);
      ctx.font = '14px sans-serif';
      ctx.fillStyle = d3.color('darkkhaki');
      ctx.textAlign = 'center';
      ctx.textBaseline = 'center';
      ctx.fillText(label, pixelCoords[0], pixelCoords[1]);
    }
  }

  const render = () => {
    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = d3.color('gray').darker(0.5);
    ctx.beginPath();
    data.graticuleLines.forEach((x, i) => {

        if (x.coordinates[0][0] === x.coordinates[1][0]) {
          // lon
          const coords = x.coordinates[Math.floor(x.coordinates.length / 2)];
          if (coords[0] !== 0) {
            for (let i = -60; i <= 60; i += 30) {
              renderText((coords[0] / 15 + 24) % 24, [coords[0], i]);
            }
          }
        } else {
          x.coordinates.forEach((coords, i) => {
            if (coords[0] % 90 === 0) {
              renderText(coords[1], coords);
            }
          })
          // const coords = x.coordinates[Math.floor(x.coordinates.length / 2)];
        }
        geoPath(x);
      }
    );
    ctx.stroke();

    data.constellationLines.forEach(x => {
      ctx.beginPath();
      geoPath(x.geometry);
      ctx.stroke();
    })
    data.selectedStars.forEach(x => {
      ctx.fillStyle = x.properties.color;
      ctx.beginPath();
      geoPath(x.geometry, x.properties.pointRadius);
      // context.arc(pt[0], pt[1], s.r * projection.scale() * .002, 0, 2 * Math.PI);
      ctx.fill();
      const starName = data.starNames[x.id]?.name;
      if (starName && x.properties.pointRadius > 2.4) {
        const coordinates = x.geometry.coordinates;
        if (isPointVisible(coordinates)) {
          const pixelCoords = projection([coordinates[0], coordinates[1]]);
          // log(coords)
          ctx.font = '14px sans-serif';
          ctx.fillStyle = d3.color('darkkhaki');
          ctx.textAlign = 'right';
          ctx.textBaseline = 'bottom';
          ctx.fillText(starName, pixelCoords[0], pixelCoords[1]);
        }
      }
    })

    data.constellations.forEach(x => {
      const coordinates = x.geometry.coordinates;
      if (isPointVisible(coordinates)) {
        const pixelCoords = projection([coordinates[0], coordinates[1]]);
        // log(coords)
        ctx.font = '14px sans-serif';
        ctx.fillStyle = d3.color('darkcyan');
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(x.properties.de, pixelCoords[0], pixelCoords[1]);
      }
    })

    // data.starNames.forEach(x => {
    //   const coordinates = x.geometry.coordinates;
    //   if (isPointVisible(coordinates)) {
    //     const pixelCoords = projection([coordinates[0], coordinates[1]]);
    //     // log(coords)
    //     ctx.font = '14px sans-serif';
    //     ctx.fillStyle = d3.color('darkcyan');
    //     ctx.textAlign = 'center';
    //     ctx.textBaseline = 'middle';
    //     ctx.fillText(x.properties.de, pixelCoords[0], pixelCoords[1]);
    //   }
    // })

  }
  const onScaleChanged = scaleFactor => {
    data.selectedStars = data.stars.filter(x => x.properties.r * scaleFactor > .5);
    data.selectedStars.forEach(x => x.properties.pointRadius = x.properties.r * scaleFactor);
  }
  const zoomer = new Zoomer(canvas, projection, render, onScaleChanged);
  const onResize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas
      .attr("width", width)
      .attr("height", height);
    projection
      .translate([width / 2, height / 2])
      .scale(Math.min(width, height) / 2);
    zoomer.unityScale = projection.scale();
    render();
  }


  function updateRotationBasedOnTime() {
    const now = new Date();
    const hour = now.getUTCHours() + now.getUTCMinutes() / 60;

    // Berechne Sternzeit (vereinfacht)
    const siderealTime = (hour * 15) % 360; // 15° pro Stunde

    // Setze Rotation für aktuellen Himmelsausschnitt
    projection.rotate([siderealTime, viewerLatitude, 0]);
    render();
  }


  onScaleChanged(1);
  onResize();
  window.addEventListener('resize', onResize)
}
