import A from 'aladin-lite';
import * as d3 from 'd3';
const al = async () => {
  await A.init;
  const aladin = A.aladin('#container', {
    fullScreen: true,
    survey: 'https://skies.esac.esa.int/DSSColor',
    target: "andromeda",
    fov: 3,
    cooFrame: "ICRSd",
    inertia: true,
    showReticle: false,
    // showCooGrid: true, // instabil
    projection: 'SIN',
    showCatalog: false,
    showContextMenu: false,
    showCooLocation: false,
    showFullscreenControl: false,
    showFov: false,
    showFrame: false,
    showGotoControl: false,
    showLayersControl: false,
    showProjectionControl: false,
    showSimbadPointerControl: false,
    showZoomControl: false,
    // showCooGridControl: true,
    // showSimbadPointerControl: true,
    // showShareControl: true,
    // fov: 180,
    // showContextMenu: true
  });
  const searchParams = new URL(document.location).searchParams;
  if (searchParams.has('baseImageLayer')) {
    aladin.setBaseImageLayer(searchParams.get('baseImageLayer'));
  }
  if (searchParams.has('overlayImageLayer')) {
    aladin.setOverlayImageLayer(searchParams.get('overlayImageLayer'));
  }
  if (searchParams.has('cooFrame')) {
    aladin.setFrame(searchParams.get('cooFrame'));
  }
  if (searchParams.has('fov')) {
    aladin.setFoV(parseFloat(searchParams.get('fov')));
  }
  if (searchParams.has('ra') && searchParams.has('dec')) {
    aladin.gotoRaDec(parseFloat(searchParams.get('ra')), parseFloat(searchParams.get('dec')));
  }
  // aladin.on('objectHovered', obj => console.log(obj));
  // console.log(A.Utils.degreesToString(.2));
  // A.Utils.Sesame.resolveAstronomicalName("M101", (o) => {
  //     console.log("object found", o)
  //   },
  //   (err) => {
  //     console.error("errr", err)
  //   }
  // )
  // aladin.on("positionChanged", ({ra, dec}) => {
  //   console.log("positionChanged", ra, dec)
  // })
  // aladin.on("zoomChanged", zoom => {
  //   console.log("zoomChanged", zoom)
  // })
  // aladin.on("click", (r,s) => {
  //   console.log("click", r,s)
  // })
  d3.select(".aladin-logo").remove();

}

export default al;
