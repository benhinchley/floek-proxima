if (typeof(Number.prototype.toRad) === "undefined") {
  Number.prototype.toRad = function() {
    return this * Math.PI / 180;
  }
}

const R = 6371e3;

function calculateDistance(coord1, coord2) {
  const φ1 = coord1.latitude.toRad(),
        φ2 = coord2.latitude.toRad(),
        Δλ = (coord2.longitude-coord1.longitude).toRad(); 
  
  return Math.acos( Math.sin(φ1)*Math.sin(φ2) + Math.cos(φ1)*Math.cos(φ2) * Math.cos(Δλ) ) * R;
}

module.exports = {
  calculateDistance
}