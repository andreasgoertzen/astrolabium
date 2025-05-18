export function isPointVisible(projection, coords) {
  const lambda = coords[0] * Math.PI / 180;
  const phi = coords[1] * Math.PI / 180;
  const rotation = projection.rotate();
  const rotLambda = rotation[0] * Math.PI / 180;
  const rotPhi = rotation[1] * Math.PI / 180;

  // Einfache Version: Berechne den Winkel zwischen dem Punkt und dem Zentrum der Kugel
  const angle = Math.acos(
    Math.sin(phi) * Math.sin(-rotPhi) +
    Math.cos(phi) * Math.cos(-rotPhi) * Math.cos(lambda - (-rotLambda))
  );

  // Sichtbar, wenn der Winkel kleiner als 90° ist
  return angle < Math.PI / 2;
}

export function formatRa(degrees) {
  // Stunden (1 Stunde = 15 Grad)
  const totalHours = degrees / 15 >= 0 ? degrees / 15 : degrees / 15 + 24;

  // Ganze Stunden
  const hours = Math.floor(totalHours);

  // Restliche Minuten (1 Minute = 1/60 Stunde)
  const totalMinutes = (totalHours - hours) * 60;
  const minutes = Math.floor(totalMinutes);

  // Restliche Sekunden (1 Sekunde = 1/60 Minute)
  const totalSeconds = (totalMinutes - minutes) * 60;

  // Format mit führenden Nullen und Komma als Dezimaltrennzeichen
  const formattedHours = hours.toString().padStart(2, '0');
  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedSeconds = totalSeconds.toFixed(3).replace('.', ',').padStart(6, '0');

  return `${formattedHours}h ${formattedMinutes}m ${formattedSeconds}s`;
}

export function formatDec(degrees) {
  // Vorzeichen bestimmen und für die Berechnung den Absolutwert verwenden
  const sign = degrees >= 0 ? '+' : '-';
  const absDegrees = Math.abs(degrees);

  // Ganze Grad
  const wholeDegrees = Math.floor(absDegrees);

  // Bogenminuten (1 Bogenminute = 1/60 Grad)
  const totalMinutes = (absDegrees - wholeDegrees) * 60;
  const minutes = Math.floor(totalMinutes);

  // Bogensekunden (1 Bogensekunde = 1/60 Bogenminute)
  const totalSeconds = (totalMinutes - minutes) * 60;

  // Format mit führenden Nullen und Komma als Dezimaltrennzeichen
  const formattedDegrees = wholeDegrees.toString().padStart(2, '0');
  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedSeconds = totalSeconds.toFixed(2).replace('.', ',').padStart(5, '0');

  return `${sign}${formattedDegrees}° ${formattedMinutes}′ ${formattedSeconds}″`;
}

export function generateEclipticGeoJSON(steps = 360) {
  const ε = -23.439281; // Schiefe der Ekliptik in Grad
  const coordinates = [];

  for (let λ = 0; λ <= 360; λ += 360 / steps) {
    // λ = ekliptische Länge, β = 0 (auf der Ekliptik)
    // Umrechnung nach Äquator-Koordinaten (Ra/Dec → Lon/Lat)
    const rad = Math.PI / 180;
    const λ_rad = λ * rad;
    const ε_rad = ε * rad;

    const sinDec = Math.sin(ε_rad) * Math.sin(λ_rad);
    const dec = Math.asin(sinDec) / rad;

    const y = Math.cos(ε_rad) * Math.sin(λ_rad);
    const x = Math.cos(λ_rad);
    let ra = Math.atan2(y, x) / rad;
    if (ra < 0) ra += 360;

    // in GeoJSON: Lon = RA * -1, Lat = Dec
    coordinates.push([ -ra, dec ]);
  }

  return {
    type: "Feature",
    properties: { name: "Ekliptik" },
    geometry: {
      type: "LineString",
      coordinates: coordinates
    }
  };
}

function Pad(s, w) {
  s = s.toFixed(0);
  while (s.length < w) {
    s = '0' + s;
  }
  return s;
}

export function formatDate(date) {
  var year = Pad(date.getFullYear(), 4);
  var month = Pad(1 + date.getMonth(), 2);
  var day = Pad(date.getDate(), 2);
  var hour = Pad(date.getHours(), 2);
  var minute = Pad(date.getMinutes(), 2);
  var second = Pad(date.getSeconds(), 2);
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}


