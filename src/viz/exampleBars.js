import * as d3 from 'd3';
import {color} from 'd3';

export default async function() {

  const dataset = [12, 31, 22, 17, 25, 18, 29, 14, 9];

  const width = 270;
  const height = 150;

  const svg = d3.select("#viz-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "border: 1px solid gray;max-width: 100%; height: auto;");

  // Append Rectangles for Bars
  svg.selectAll("rect")
    .data(dataset)
    .enter()
    .append("rect")
    .attr("x", (d, i) => i * 30)        // Bar positions
    .attr("y", d => height - 3 * d)       // Bar heights
    .attr("width", 25)                 // Bar width
    .attr("height", d => 3 * d)      // Bar height
    .attr("fill", color("teal"));             // Bar color

  // Add Data Labels
  svg.selectAll("text")
    .data(dataset)
    .enter()
    .append("text")
    .attr("x", (d, i) => i * 30 + 10)  // Position labels centrally
    .attr("y", d => height - 3 * d - 3)   // Position above the bars
    .text(d => d)                    // Text value
    .attr("font-size", "12px")         // Font size
    .attr("fill", color("plum"))             // Label color
    .attr("text-anchor", "middle");    // Text alignment
}
