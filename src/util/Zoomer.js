import versor from "@/util/versor.js";
import * as d3 from 'd3';

export default class Zoomer {
  northUp = false;
  unityScale;
  projection;
  render;
  onScaleChanged;
  r0;
  v0;
  q0;

  constructor(svg, projection, render, onScaleChanged) {
    this.projection = projection;
    this.unityScale = projection.scale();
    this.render = render;
    this.onScaleChanged = onScaleChanged;
    const zoomFkt = d3.zoom()
      .scaleExtent([0.1, 1e3])
      .on('start', ev => this.zoomStarted(ev))
      .on('zoom', ev => this.zoomed(ev));
    svg.call(zoomFkt);
  }

  zoomStarted(ev) {
    this.v0 = versor.cartesian(this.projection.invert(d3.pointer(ev)));
    this.r0 = this.projection.rotate();
    this.q0 = versor(this.r0);
  }

  zoomed(ev) {
    const scale = ev.transform.k * this.unityScale;
    if (scale !== this.projection.scale()) {
      this.projection.scale(scale);
      this.onScaleChanged && this.onScaleChanged(scale / this.unityScale);
    }
    const v1 = versor.cartesian(this.projection.rotate(this.r0).invert(d3.pointer(ev)));
    const q1 = versor.multiply(this.q0, versor.delta(this.v0, v1))
    const rotation = versor.rotation(q1);
    if (this.northUp) {
      rotation[2] = 0; // Don't rotate on Z axis
    }
    this.projection.rotate(rotation);
    this.render({
      scale,
      rotation
    });
  }
}
