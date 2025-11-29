async function loadCNC() {
  const res = await fetch("/api/game/8118809589");  // FIXED universe ID
  const data = await res.json();

  document.getElementById("titleCNC").innerText = data.name;
  document.getElementById("descCNC").innerText = data.description;
  document.getElementById("playersCNC").innerText = "Players: " + data.playing;
  document.getElementById("visitsCNC").innerText =
    "Visits: " + data.visits.toLocaleString();
  document.getElementById("thumbCNC").src = data.thumbnail;
}

loadCNC();
setInterval(loadCNC, 15000);
