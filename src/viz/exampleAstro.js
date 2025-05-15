import Zoomer from "@/util/Zoomer.js";
import * as d3 from 'd3';
import {color} from 'd3';

export default async function() {

  const stars = await d3.json("/data/stars.6.json");
  const starnames = await d3.json("/data/starnames.json");
  const constellationLines = await d3.json("/data/constellations.lines.json");

  const width = 954 + 28;
  const height = width;

  const svg = d3.select("#container")
    .append("svg")
    // .attr("width", width)
    // .attr("height", height)
    .attr("viewBox", [0, 0, width, height]);

    // .attr("style", "display: block; margin: 0 -14px; width: 100%; height: auto; font: 10px sans-serif; color: white; background: radial-gradient(#081f4b 0%, #061616 100%);")
    // .attr("text-anchor", "middle")
    // .attr("fill", "currentColor")


  const projection = d3.geoOrthographic()
    // .clipExtent([[0, 0], [width, height]])
    // .scale((width - 120) * 0.5)
    // .translate([width / 2, height / 2])
    // .precision(0.1);

  // Scale the radius of the stars
  const magnitudeScale = d3.scaleLinear()
    .domain(d3.extent(stars.features, d => d.properties.mag))
    .range([3, 0.5])

  const starPath = d3.geoPath(projection).pointRadius(d => magnitudeScale(d.properties.mag ));


  svg.selectAll("path")
    .data(stars.features)
    .enter()
    .append('path')
    .attr("class", "schna")
    .attr("d", starPath)
    .attr("fill", "#ddd");

  function render() {
    svg.selectAll("path.schna").attr("d", starPath);
  }

  // render();

  new Zoomer(svg, projection, render);

}
