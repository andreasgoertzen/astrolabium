import * as d3 from 'd3';
import { geoAitoff } from "d3-geo-projection";

export const ZOOM_SCALE_EXTENT = [.5, 125];
export const PROJECTION_COLOR = d3.color('#2929a3').darker(.5);
export const DEFAULT_SHOW_MILKY_WAY = false;
export const DEFAULT_PROJECTION = 'Aitoff';
export const PROJECTIONS = {
  Aitoff: geoAitoff,
  Conic: d3.geoConicConformal,
  Gnomonic: d3.geoGnomonic,
  Mercator: d3.geoMercator,
  Natural: d3.geoNaturalEarth1,
  Orthographic: d3.geoOrthographic,
  Stereographic: d3.geoStereographic,
}

export const PLANETS = [
  {
    id: "sol",
    body: "Sun",
    de: "Sonne",
    symbol: "\u2609",
    letter: "Su",
    fill: "#ffff00",
    size: 12
  },
  {
    id: "mer",
    de: "Merkur",
    body: "Mercury",
    symbol: "\u263f",
    letter: "Me",
    fill: "#cccccc"
  },
  {
    id: "ven",
    de: "Venus",
    body: "Venus",
    symbol: "\u2640",
    letter: "V",
    fill: "#eeeecc"
  },
  {
    id: "ter",
    de: "Erde",
    body: "Earth",
    symbol: "\u2295",
    letter: "T",
    fill: "#00ccff"
  },
  {
    id: "lun",
    de: "Mond",
    body: "Moon",
    symbol: "\u25cf",
    letter: "L",
    fill: "#ffffff",
    size: 12
  },
  {
    id: "mar",
    de: "Mars",
    body: "Mars",
    symbol: "\u2642",
    letter: "Ma",
    fill: "#ff6600"
  },
  {
    id: "cer",
    de: "Ceres",
    symbol: "\u26b3",
    letter: "C",
    fill: "#cccccc"
  },
  {
    id: "ves",
    de: "Vesta",
    symbol: "\u26b6",
    letter: "Ma",
    fill: "#cccccc"
  },
  {
    id: "jup",
    de: "Jupiter",
    body: "Jupiter",
    symbol: "\u2643",
    letter: "J",
    fill: "#ffaa33"
  },
  {
    id: "sat",
    de: "Saturn",
    body: "Saturn",
    symbol: "\u2644",
    letter: "Sa",
    fill: "#ffdd66"
  },
  {
    id: "ura",
    de: "Uranus",
    body: "Uranus",
    symbol: "\u2645",
    letter: "U",
    fill: "#66ccff"
  },
  {
    id: "nep",
    de: "Neptun",
    body: "Neptune",
    symbol: "\u2646",
    letter: "N",
    fill: "#6666ff"
  },
  {
    id: "plu",
    de: "Pluto",
    body: "Pluto",
    symbol: "\u2647",
    letter: "P",
    fill: "#aaaaaa"
  },
  {
    id: "eri",
    de: "Eridanus",
    symbol: "\u26aa",
    letter: "E",
    fill: "#eeeeee"
  }
]

export const eulerAngles = {
  "equatorial": [0.0, 0.0, 0.0],
  "ecliptic": [0.0, 0.0, 23.4393],
  "galactic": [93.5949, 28.9362, -58.5988],
  "supergalactic": [137.3100, 59.5283, 57.7303]
};

export const poles = {
  "equatorial": [0.0, 90.0],
  "ecliptic": [-90.0, 66.5607],
  "galactic": [-167.1405, 27.1283],
  "supergalactic": [-76.2458, 15.7089]
};

