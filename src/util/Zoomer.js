import versor from "@/util/versor.js";

const eventPoint = (ev) => {
  let clientX = ev.clientX;
  let clientY = ev.clientY;
  if (ev.touches && ev.touches.length > 0) {
    clientX = ev.touches[0].clientX;
    clientY = ev.touches[0].clientY;
  }
  return [clientX, clientY];
}

export default class Zoomer {
  northUp = false;
  unityScale;
  projection;
  render;
  r0;
  v0;
  q0;

  zoomStarted(ev) {
    if (!this.projection) return;
    this.v0 = versor.cartesian(this.projection.invert(eventPoint(ev.sourceEvent)));
    this.r0 = this.projection.rotate();
    this.q0 = versor(this.r0);
  }

  zoomed(ev) {
    if (!this.projection || !this.render) return;
    const scale = ev.transform.k * this.unityScale;
    if (scale !== this.projection.scale()) {
      this.projection.scale(scale);
    }
    const v1 = versor.cartesian(this.projection.rotate(this.r0).invert(eventPoint(ev.sourceEvent)));
    const q1 = versor.multiply(this.q0, versor.delta(this.v0, v1))
    const rotation = versor.rotation(q1);
    if (this.northUp) {
      rotation[2] = 0; // Don't rotate on Z axis
    }
    this.projection.rotate(rotation);
    this.render();
  }
}
