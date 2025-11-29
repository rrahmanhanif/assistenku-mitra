// src/modules/gpsTrackerMitra.js
export function startMitraTracking(mitraId, onUpdate) {
  if (!navigator.geolocation) {
    console.error("GPS tidak didukung perangkat");
    return null;
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      console.log(`[Mitra] GPS position:`, lat, lng);

      // Kirim data ke callback / server
      if (onUpdate) {
        onUpdate({ mitraId, lat, lng });
      }
    },
    (error) => console.error("GPS Error:", error),
    { enableHighAccuracy: true, maximumAge: 1000 }
  );

  return watchId;
}

export function stopMitraTracking(watchId) {
  if (watchId !== null) navigator.geolocation.clearWatch(watchId);
}
