export function bvToHex(bv) {
  // Clamp bv value to reasonable range
  bv = Math.max(-0.4, Math.min(2.0, bv));

  let t, r, g, b;

  // Verbesserte Berechnung für RED
  if (bv < 0.0) {
    t = (bv + 0.4) / 0.4;
    r = 0.61 + 0.11 * t + 0.1 * t * t;
  } else if (bv < 0.4) {
    t = bv / 0.4;
    r = 0.83 + 0.17 * t;
  } else {
    r = 1.0;
  }

  // Verbesserte Berechnung für GREEN
  if (bv < 0.0) {
    t = (bv + 0.4) / 0.4;
    g = 0.70 + 0.07 * t + 0.1 * t * t;
  } else if (bv < 0.4) {
    t = bv / 0.4;
    g = 0.87 + 0.11 * t;
  } else if (bv < 1.6) {
    t = (bv - 0.4) / 1.2;
    g = 0.98 - 0.16 * t;
  } else {
    t = (bv - 1.6) / 0.4;
    g = 0.82 - 0.5 * t * t;
  }

  // Verbesserte Berechnung für BLUE
  if (bv < 0.4) {
    b = 1.0;
  } else if (bv < 1.5) {
    t = (bv - 0.4) / 1.1;
    b = 1.00 - 0.47 * t + 0.1 * t * t;
  } else {
    t = (bv - 1.5) / 0.44;
    b = 0.63 - 0.6 * t * t;
  }

  // Anwendung einer Gamma-Korrektur für bessere visuelle Darstellung
  const gamma = 0.8;
  r = Math.pow(r, gamma);
  g = Math.pow(g, gamma);
  b = Math.pow(b, gamma);


  // Hex-Farbe
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
const toHex = (n) => Math.round(n * 255).toString(16).padStart(2, '0');
