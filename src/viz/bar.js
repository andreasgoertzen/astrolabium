import * as d3 from 'd3';
import {color} from 'd3';

export async function showBarChart() {


  const width = 640;
  const height = 400;
  const marginTop = 20;
  const marginRight = 20;
  const marginBottom = 30;
  const marginLeft = 40;

  const svg = d3.select("#viz-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const x = d3.scaleUtc()
    .domain([new Date("2025-01-01"), new Date("2027-01-01")])
    .range([marginLeft, width - marginRight]);

  // Declare the y (vertical position) scale.
  const y = d3.scaleLinear()
    .domain([0, 100])
    .range([height - marginBottom, marginTop]);

  // Add the x-axis.
  svg.append("g")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(d3.axisBottom(x));

  // Add the y-axis.
  svg.append("g")
    .attr("transform", `translate(${marginLeft},0)`)
    .call(d3.axisLeft(y));

// // Append Rectangles for Bars
//   svg.selectAll("rect")
//     .data(dataset)
//     .enter()
//     .append("rect")
//     .attr("x", (d, i) => i * 30)        // Bar positions
//     .attr("y", (d) => h - 3 * d)       // Bar heights
//     .attr("width", 25)                 // Bar width
//     .attr("height", d => 3 * d)      // Bar height
//     .attr("fill", color('green'));             // Bar color
//
// // Add Data Labels
//   svg.selectAll("text")
//     .data(dataset)
//     .enter()
//     .append("text")
//     .attr("x", (d, i) => i * 30 + 10)  // Position labels centrally
//     .attr("y", (d) => h - 3 * d - 3)   // Position above the bars
//     .text((d) => d)                    // Text value
//     .attr("font-size", "12px")         // Font size
//     .attr("fill", color("blue"))             // Label color
//     .attr("text-anchor", "middle");
}
