import geoZoom from "@/util/geoZoom"
import * as d3 from 'd3';
import * as topojson from 'topojson';

export default async function () {

  const MARGIN = 5;
  const width = window.innerWidth;
  const height = window.innerHeight;

  const svg = d3.select('#container').append('svg')
    .attr('width', width)
    .attr('height', height);

  const projection = d3.geoOrthographic()
    .scale((Math.min(width, height)) / 2 - MARGIN)
    .translate([width / 2, height / 2]);

  const path = d3.geoPath()
    .projection(projection);

  geoZoom()
    .projection(projection)
    .onMove(render)
    (svg.node());

  const world = await d3.json("data/versor/110m.json");

  svg.append('path').attr('class', 'geo-feature')
    .datum({type: 'Sphere'})
    .attr('fill', 'aqua');

  svg.append('path').attr('class', 'geo-feature')
    .datum(topojson.feature(world, world.objects.land))
    .attr('fill', 'maroon');

  render();


  function render() {
    svg.selectAll('path.geo-feature').attr('d', path);
  }
}
