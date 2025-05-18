import { isPointVisible } from "@/util/calc.js";
import * as d3 from 'd3';

export const renderTextGraticule = (p, c, ctx, label, color) => {
  if (isPointVisible(p, c)) {
    const pc = p(c);
    ctx.font = '14px sans-serif';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'center';
    ctx.fillText(label, pc[0], pc[1]);
  }
}
