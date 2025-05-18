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
