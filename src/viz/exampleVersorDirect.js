import versor from "@/util/versor.js";
import Zoomer from "@/util/Zoomer.js";
import * as d3 from 'd3';
import * as topojson from 'topojson';

export default async function () {
  const svg = d3.select('#container').append('svg')
    .attr("viewBox", "0 0 1000 1000");

  const projection = d3.geoOrthographic()
    // .scale((Math.min(width, height)) / 2 - MARGIN)
    // .translate([width / 2, height / 2]);

  const path = d3.geoPath().projection(projection);

  function render() {
    svg.selectAll('path.geo-feature').attr('d', path);
  }

  new Zoomer(svg, projection, render);

  const world = await d3.json("data/versor/110m.json");

  svg.append('path').attr('class', 'geo-feature')
    .datum(topojson.feature(world, world.objects.land))
    .attr('fill', 'maroon');

  render();



}
