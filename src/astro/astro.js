import { BACKGROUND_COLOR, PROJECTION_COLOR } from "@/astro/const.js";
import { bvToHex, isPointVisible } from "@/util/calc.js";
import { logj } from "@/util/log.js";
import { renderTextGraticule } from "@/util/render.js";
import Zoomer from "@/util/Zoomer.js";
import simplify from "@turf/simplify";
import * as d3 from 'd3';

export default async () => {
  let showMilkyWay = true;

  const data = {
    asterisms: (await d3.json("/data/asterisms.json")).features,
    constellations: (await d3.json("/data/constellations.json")).features,
    constellationLines: (await d3.json("/data/constellations.lines.json")).features,
    constellationBounds: (await d3.json("/data/constellations.borders.json")).features,
    dsonames: (await d3.json("/data/dsonames.json")),
    graticuleLines: d3.geoGraticule().step([15, 10]).lines(),
    messier: (await d3.json("/data/messier.json")).features,
    milkyWay: (await d3.json("/data/milkyway.json")).features,
    milkyWaySimple: [],
    stars: (await d3.json("/data/stars.6.json")).features,
    starNames: (await d3.json("/data/starnames.json")),
    selectedStars: []
  };
  const scale = {
    magnitude: d3.scaleLinear(d3.extent(data.stars, d =>d.properties.mag), [4, 0.5])
  }

  // logj(data.milkyWay)

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
  let unityScale = projection.scale();
  function zoomFactor() { return projection.scale() / unityScale;}
  const geoPath = d3
    .geoPath()
    .projection(projection)
    .context(ctx)
    .pointRadius((d, pointRadius) => pointRadius || 1);

  // prepare data
  data.stars.forEach(x => {
    x.properties.color = bvToHex(x.properties.bv);
    x.properties.r = scale.magnitude(x.properties.mag);
  })

  data.milkyWay.forEach(x => simplify(x, {
    tolerance: 10,
    highQuality: false
  }))

  const render = () => {
    ctx.clearRect(0, 0, width, height);

    // background
    ctx.beginPath();
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, width, height);

    // projection background
    ctx.beginPath();
    ctx.fillStyle = PROJECTION_COLOR;
    ctx.arc(width / 2, height / 2, projection.scale(), 0, 2 * Math.PI);
    ctx.fill();

    // graticule
    ctx.beginPath();
    ctx.lineWidth = .8;
    ctx.strokeStyle = d3.color('rgba(200,100,200, .5)');
    data.graticuleLines.forEach(x => geoPath(x));
    ctx.stroke();

    // milky way
    if (showMilkyWay) {
      data.milkyWay.forEach(x => {
        ctx.beginPath();
        ctx.fillStyle ='rgba(255, 255, 255, .05)';
        geoPath(x);
        ctx.fill();
      })
    }

    // constellation bounds
    ctx.lineWidth = 2;
    ctx.strokeStyle = d3.color('lightskyblue').darker(1.5);
    data.constellationBounds.forEach(x => {
      ctx.beginPath();
      ctx.lineWidth = 1.5;
      geoPath(x.geometry);
      ctx.stroke();
    })

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
    data.asterisms.forEach(x => {
      ctx.beginPath();
      geoPath(x.geometry);
      ctx.stroke();
    })

    // messier objects
    ctx.strokeStyle = d3.color('red');
    data.messier.forEach(x => {
      const coords = x.geometry.coordinates;
      if (isPointVisible(projection, coords) && x.properties.mag < 6 * zoomFactor()) {
        const pixelCoords = projection(coords);
        ctx.beginPath();
        ctx.arc(pixelCoords[0], pixelCoords[1], 4, 0, 2 * Math.PI);
        ctx.stroke();
          // log(coords)
          ctx.font = '15px sans-serif';
          ctx.fillStyle = d3.color('red').darker(.5);
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          const dsoname = data.dsonames[x.properties.desig]
        ctx.fillText(x.properties.name, pixelCoords[0], pixelCoords[1] - 6);
        if (dsoname && dsoname.de) {
          ctx.fillText(dsoname.de, pixelCoords[0], pixelCoords[1] + 20);
        }
      }
    })

    // stars
    data.stars.forEach(x => {
      const coords = x.geometry.coordinates;
      if (isPointVisible(projection, coords)) {
        ctx.beginPath();
        ctx.fillStyle = x.properties.color;
        const pcoords = projection(coords);
        ctx.arc(pcoords[0], pcoords[1], x.properties.pointRadius, 0, 2 * Math.PI);
        ctx.fill();
      }
    })

    // star names
    data.selectedStars.forEach(x => {
      const starNames = data.starNames[x.id];
      let starName;
      if (starNames?.de) {
        starName = starNames.de
      } else if (starNames?.name && starNames.name.length > 3 && x.properties.pointRadius > 2 ) {
        starName = starNames.name
      } else if (starNames?.bayer && x.properties.pointRadius > 2) {
        starName = starNames.bayer
      } else if (starNames?.flam && x.properties.pointRadius > 2) {
        starName = starNames.flam
      } else if (starNames?.desig && x.properties.pointRadius > 2) {
        starName = starNames.desig
      }
      if (starName) {
        ctx.beginPath();
        const coordinates = x.geometry.coordinates;
        if (isPointVisible(projection, coordinates)) {
          const pixelCoords = projection([coordinates[0], coordinates[1]]);
          // log(coords)
          ctx.font = '15px sans-serif';
          ctx.fillStyle = d3.color('darkkhaki').darker(.5);
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillText(starName, pixelCoords[0], pixelCoords[1] - x.properties.pointRadius);
        }
      }
    })

    // graticule labels
    data.graticuleLines.forEach(x => {
        if (x.coordinates[0][0] === x.coordinates[1][0]) {
          // lon
          const coords = x.coordinates[Math.floor(x.coordinates.length / 2)];
          if (coords[0] % 90 !== 0) {
            for (let i = -60; i <= 60; i += 30) {
              renderTextGraticule(
                projection,
                [coords[0], i],
                ctx,
                (coords[0] / 15 + 24) % 24,
                d3.color('lightsteelblue')
              );
            }
          }
        } else {
          // lat
          x.coordinates.forEach((coords, i) => {
            if (coords[0] % 90 === 0) {
              renderTextGraticule(
                projection,
                coords,
                ctx,
                coords[1],
                d3.color('darkkhaki')
              );
            }
          })
        }
      }
    );

    // constellation names
    data.constellations.forEach(x => {
      const coordinates = x.geometry.coordinates;
      if (isPointVisible(projection, coordinates)) {
        const pixelCoords = projection([coordinates[0], coordinates[1]]);
        ctx.font = '16px sans-serif';
        ctx.fillStyle = d3.color('lightskyblue').darker(1.5);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(x.properties.de, pixelCoords[0], pixelCoords[1]);
      }
    })

    // asterism names
    data.asterisms.forEach(x => {
      const pixelCoords = geoPath.centroid(x);
      // if (isPointVisible(projection, coordinates)) {
      //   const pixelCoords = projection([coordinates[0], coordinates[1]]);
      ctx.font = '14px sans-serif';
      ctx.fillStyle = d3.color('darkseagreen');
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(x.properties.de, pixelCoords[0], pixelCoords[1]);
      // }
    })
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
    unityScale = projection.scale();
    zoomer.unityScale = unityScale;
    render();
  }

  onScaleChanged(1);
  onResize();
  window.addEventListener('resize', onResize)
}
