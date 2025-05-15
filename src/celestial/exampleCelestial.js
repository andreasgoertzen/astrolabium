import { bvToHex } from "@/util/bvToHex.js";
import Zoomer from "@/util/Zoomer.js";
import * as d3 from 'd3';

export default async () => {
  const config = {}
  const data = {
    stars: (await d3.json("/data/stars.14.json")).features,
    graticule: d3.geoGraticule().step([10, 10])(),
    selectedStars: []
  };
  const scale = {
    magnitude: d3.scaleLinear(d3.extent(data.stars, d => d.properties.mag), [2, 0.1])
  }

  let width = window.innerWidth;
  let height = window.innerHeight;

  const container = d3.select("#container");
  const canvas = container.append('canvas');
  const ctx = canvas.node().getContext('2d');
  const projection = d3.geoOrthographic();
  const geoPath = d3.geoPath()
    .projection(projection)
    .context(ctx)
    .pointRadius((d, pointRadius) => pointRadius || 1);

  // prepare data
  data.stars.forEach(x => {
    x.properties.color = bvToHex(x.properties.bv);
    x.properties.r = scale.magnitude(x.properties.mag);
  })
  console.log(data.stars);
  console.log(JSON.stringify(data.stars[0].properties, null, 2));

  const render = () => {
    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = d3.color('gray').darker(0.5);
    ctx.beginPath();
    geoPath(data.graticule);
    ctx.stroke();
    data.selectedStars.forEach(s => {
      ctx.fillStyle = s.properties.color;
      ctx.beginPath();
      geoPath(s.geometry, s.properties.pointRadius);
      // context.arc(pt[0], pt[1], s.r * projection.scale() * .002, 0, 2 * Math.PI);
      ctx.fill();
    })
  }
  const onScaleChanged = scaleFactor => {
    console.log('recalculate')
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
  onScaleChanged(1);
  onResize();
  window.addEventListener('resize', onResize)
}
