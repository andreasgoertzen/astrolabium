import { isPointVisible } from "@/util/calc.js";
import * as d3 from 'd3';

export const renderTextGraticule = (projection, coords, ctx, label, color) => {
  if (isPointVisible(projection, coords)) {
    const pixelCoords = projection(coords);
    ctx.font = '14px sans-serif';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'center';
    ctx.fillText(label, pixelCoords[0], pixelCoords[1]);
  }
}
