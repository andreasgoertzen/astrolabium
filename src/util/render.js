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

export const requestFullscreen = async () => {
  const elem = d3.select('#container').node();
  const isFullscreen = !!document.fullscreenElement;
  if (isFullscreen) {
    await document.exitFullscreen();
  } else {
    if (elem.requestFullscreen) {
      await elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
      await elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
      await elem.msRequestFullscreen();
    }
  }
}
