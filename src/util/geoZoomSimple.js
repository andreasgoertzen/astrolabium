import * as d3 from 'd3';
import versor from './versor';
import Kapsule from 'kapsule';

export default Kapsule({
  props: {
    projection: {
      onChange(projection, state) {
        state.unityScale = projection ? projection.scale() : 1;
      }
    },
    northUp: { default: false },
    onMove: { defaultVal: () => {} }
  },
  init(nodeEl, state) {
    const zoomFkt = d3.zoom()
      .scaleExtent([0.1, 1e3])
      .on('start', zoomStarted)
      .on('zoom', zoomed);
    d3.select(nodeEl).call(zoomFkt);

    let v0, r0, q0;

    function zoomStarted(ev) {
      v0 = versor.cartesian(state.projection.invert(d3.pointer(ev, nodeEl)));
      r0 = state.projection.rotate();
      q0 = versor(r0);
    }

    function zoomed(ev) {
      const scale = ev.transform.k * state.unityScale;
      state.projection.scale(scale);
      const v1 = versor.cartesian(state.projection.rotate(r0).invert(d3.pointer(ev, nodeEl))),
        q1 = versor.multiply(q0, versor.delta(v0, v1)),
        rotation = versor.rotation(q1);

      if (state.northUp) {
        rotation[2] = 0; // Don't rotate on Z axis
      }
      state.projection.rotate(rotation);
      state.onMove({ scale, rotation });
    }
  }
});
