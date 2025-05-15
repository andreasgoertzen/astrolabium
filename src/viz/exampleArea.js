import * as d3 from 'd3';
import {color} from 'd3';

export default async function() {

  const strictIsoParse = d3.utcParse("%Y-%m-%dT%H:%M:%S.%LZ");
  const aapl = (await d3.json("/data/other/aapl.json")).map(d => ({date: strictIsoParse(d.date), close: d.close}));

  const width = 928;
  const height = 500;
  const marginTop = 20;
  const marginRight = 30;
  const marginBottom = 30;
  const marginLeft = 40;

  const svg = d3.select("#container")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "border: 1px solid gray;max-width: 100%; height: auto;");

  // Declare the x (horizontal position) scale.
  const x = d3.scaleUtc(d3.extent(aapl, d => d.date), [marginLeft, width - marginRight]);

  // Declare the y (vertical position) scale.
  const y = d3.scaleLinear([0, d3.max(aapl, d => d.close)], [height - marginBottom, marginTop]);

  // Declare the area generator.
  const area = d3.area()
    .x(d => x(d.date))
    .y0(y(0))
    .y1(d => y(d.close));

  svg.append("path")
    .attr("fill", "steelblue")
    .attr("d", area(aapl));

  // Add the x-axis.
  svg.append("g")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));

  // Add the y-axis, remove the domain line, add grid lines and a label.
  svg.append("g")
    .attr("transform", `translate(${marginLeft},0)`)
    .call(d3.axisLeft(y).ticks(height / 40))
    .call(g => g.select(".domain").remove())
    .call(g => g.selectAll(".tick line").clone()
      .attr("x2", width - marginLeft - marginRight)
      .attr("stroke-opacity", 0.1))
    .call(g => g.append("text")
      .attr("x", -marginLeft)
      .attr("y", 10)
      .attr("fill", "currentColor")
      .attr("text-anchor", "start")
      .text("↑ Daily close ($)"));
}
