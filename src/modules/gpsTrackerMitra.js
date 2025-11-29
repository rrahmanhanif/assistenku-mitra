export function startMitraTracking(mitraId, onUpdate) {
  if (!navigator.geolocation) {
    console.error("GPS tidak tersedia");
    return null;
  }

  const watchId = navigator.geolocation.watchPosition(
    async (pos) => {
      const latitude = pos.coords.latitude;
      const longitude = pos.coords.longitude;

      console.log("[Mitra] tracking:", latitude, longitude);

      if (onUpdate) onUpdate({ mitraId, latitude, longitude });

    },
    (err) => console.error("GPS Error:", err),
    { enableHighAccuracy: true }
  );

  return watchId;
}

export function stopMitraTracking(id) {
  if (id !== null) navigator.geolocation.clearWatch(id);
}
