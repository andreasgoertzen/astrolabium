import geoZoom from "@/util/geoZoom.js";
import Zoomer from "@/util/Zoomer.js";
import * as d3 from 'd3';
import '@public/data/globe/style.css';

const FLAG_PATH = "data/globe/flags/";

//  CLOROPLETH MAP VARIABLES
// ----------------------------------------
const COLOR_RANGE = ["#ffffff", "#5c1010"];
const COLOR_NO_DATA = "#B2B2B2";
const COLOR_HOVER = "#D3D3D3"

let GLOBE_WIDTH = 1000;
let GLOBE_HEIGHT = 1000;
let GLOBE_RADIUS = GLOBE_HEIGHT / 2.8;
let GLOBE_CENTER = [GLOBE_WIDTH / 2, GLOBE_HEIGHT / 2];

const ROTATION_SENSITIVITY = 60;

const htmlHeader = `
    <div id="header">
      <h1 id="page-title" class="bg-gray-200">2021 World Population Visualization</h1>
      <div class="w-[400px] h-[15px]" id="color-scale"></div>
    </div>
`

const htmlTooltip = `
    <div class="p-3 z-10 text-left w-[200px]
    bg-gray-100 border-1 border-primary">
        <div class="flex flex-row gap-3" id="name-flag-container">
            <b><span id="tooltip-country-name"></span></b>
            <img height="25" width="45" id="tooltip-flag"></img>
        </div>
        Ranking: <span id="tooltip-rank"></span>
        <br/>
        Population: <span id="tooltip-population"></span>
        <br/>
        Density: <span id="tooltip-density"></span>
        <br/>
        Area: <span id="tooltip-area"></span>
    </div>
</div>
`

export default async function () {
  const geoJson = await d3.json("data/globe/globeCoordinates.json");
  const worldPopulation = await d3.csv("data/globe/worldPopulation.csv");
  const worldPopulationMap = new Map();
  worldPopulation.forEach(x => worldPopulationMap.set(x.alpha3_code, x));

  const container = d3.select("#container");

  const canvas = container.append('canvas')
    .attr("width", 1000)
    .attr("height", 1000);
  const ctx = canvas.node().getContext('2d');
  ctx.fillStyle = '#69b3a2';
  ctx.fillRect(20,20,50,50);

  const svg = d3.select("#container")
    .append("svg")
    .attr("viewBox", "0 0 1000 1000")
    .attr("width", "1000")
    .attr("height", "1000")
  ;

  const [minValue, maxValue] = d3.extent(worldPopulation,  d => d.population_number);
  const colorScale = d3.scaleLinear([0, maxValue], COLOR_RANGE);

  const projection = d3.geoOrthographic().translate([500,500]).scale(500);
  const geoPathGenerator = d3.geoPath().projection(projection).context(ctx);

  function render() {
    // svg.selectAll("path.schna").attr("d", geoPathGenerator);
    ctx.clearRect(0, 0, 1000, 1000);
    ctx.beginPath();
    geoPathGenerator(graticule);
    ctx.stroke();
    geoJson.features.forEach(country => {
      ctx.beginPath();
      geoPathGenerator(country);
      const population = worldPopulationMap.has(country.id) ? worldPopulationMap.get(country.id) : null;
      const col = population ? colorScale(population.population_number) :COLOR_NO_DATA;
      ctx.fillStyle = col;
      ctx.stroke();
      ctx.fill();
    })
  }

  new Zoomer(canvas, projection, render);

  // geoZoom()
  //   .projection(projection)
  //   .onMove(render)
  //   (svg.node());

  const graticule = d3.geoGraticule().step([10, 10])();
  svg.append("g")
    // .attr("transform", `translate(300, 90)`)
    .append('path')
    .attr("class", "schna")
    .datum(graticule)
    .attr('d', geoPathGenerator)
    .style('fill', '#fff')
    .style('stroke', '#ccc');

  ctx.beginPath();
  geoPathGenerator(graticule);
  ctx.stroke();

  const xAxis = d3.axisTop(d3.scaleLinear([0, 10000000], [0, 400])).ticks(5)
    .tickFormat(d3.format(".2s"));

  const grad = svg.append("defs").append("linearGradient")
    .attr("id", "grad");
    grad.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", COLOR_RANGE[0]);
    grad.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", COLOR_RANGE[1]);

  svg.append("text")
    .attr("text-anchor", "middle")
    .attr("x", 500)
    .attr("y", 24)
    .attr("font-size", 24)
    .text("2021 World Population Visualization")

  const leg = svg.append("g")
    .attr("transform", `translate(300, 90)`);
  leg.append('rect')
    .style("width", 400)
    .style("height", 20)
    .style("fill", "url('#grad')");
  leg.call(xAxis)


  const toolTip = container.append("div")
    .style('position','absolute')
    .style('display','none')
    .style('z-index','10')
    .html(htmlTooltip);

  svg.append("g")
    .selectAll("path")
    .data(geoJson.features)
    .enter()
    .append("path")
    .attr("class", "schna")
    .style("fill", country => {
        const population = worldPopulationMap.has(country.id) ? worldPopulationMap.get(country.id) : null;
        return population ? colorScale(population.population_number) :COLOR_NO_DATA;
      }
    )


    // Update contry on mouseover & mouseout
    .on("mouseover", (event, country) => {
        d3.select(event.target).style("fill", COLOR_HOVER);

      toolTip.transition()
        .style("display", "block")
        .style("left", event.pageX + 20 + "px")
        .style("top", event.pageY + 20 + "px");

      d3.select("#tooltip-country-name").text(country.properties.name);
      d3.select("#tooltip-flag").attr("src", `data/globe/flags/${country.id}.png`);
      d3.select("#tooltip-rank").text(worldPopulationMap.get(country.id).rank);
      d3.select("#tooltip-population").text(worldPopulationMap.get(country.id).population_number);
      d3.select("#tooltip-density").text(worldPopulationMap.get(country.id).population_density);
      d3.select("#tooltip-area").text(worldPopulationMap.get(country.id).area);
    })
    .on("mouseout", function () {
      d3.select(this)
        .style("fill", country => {
            const population = worldPopulationMap.has(country.id) ? worldPopulationMap.get(country.id) : null;
            population ? colorScale(population.population_number) :COLOR_NO_DATA;
          }
        )

      toolTip.transition()
        .style("display", "none");
    });

  render();

}

