async function loadRTR() {
  const res = await fetch("/api/game/6345078528");  // FIXED universe ID
  const data = await res.json();

  document.getElementById("titleRTR").innerText = data.name;
  document.getElementById("descRTR").innerText = data.description;
  document.getElementById("playersRTR").innerText = "Players: " + data.playing;
  document.getElementById("visitsRTR").innerText =
    "Visits: " + data.visits.toLocaleString();
  document.getElementById("thumbRTR").src = data.thumbnail;
}

loadRTR();
setInterval(loadRTR, 15000);
