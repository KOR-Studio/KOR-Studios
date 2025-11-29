// gallery.js
const GAMES = [
  { universeId: "6345078528", playUrl: "https://www.roblox.com/games/18726327858" },
  { universeId: "8118809589", playUrl: "https://www.roblox.com/games/125228123184929" }
];

const GROUP_ID = "34029001";    // Keep-On-Rising-Studios group id (from your link)
const DISCORD_INVITE = "8BdjmNmBv8"; // invite code from your discord link

async function fetchJSON(url){
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return await res.json();
}

// fetch and build the gallery
async function buildGallery(){
  const grid = document.getElementById('gamesGrid');

  // show skeleton quickly (improves perceived speed)
  for (let i=0;i<GAMES.length;i++){
    const sk = document.createElement('div');
    sk.className = 'game-card';
    sk.innerHTML = `<div style="width:100%; height:160px; background:linear-gradient(90deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));"></div>
      <div class="game-info"><h3 style="background:rgba(255,255,255,0.04); width:60%; height:18px; border-radius:6px;"></h3>
      <p style="background:rgba(255,255,255,0.02); height:40px; border-radius:6px;"></p></div>`;
    grid.appendChild(sk);
  }

  // fetch game data in parallel
  const promises = GAMES.map(g => fetchJSON(`/api/game/${g.universeId}`).catch(e => ({ error: true })));
  const results = await Promise.all(promises);

  // clear skeletons
  grid.innerHTML = "";

  results.forEach((data, idx) => {
    const g = GAMES[idx];
    if (data && !data.error) {
      const card = document.createElement('div');
      card.className = 'game-card';
      card.innerHTML = `
        <img class="thumb" src="${data.thumbnail}" alt="${data.name}">
        <div class="game-info">
          <h3>${escapeHtml(data.name)}</h3>
          <p>${escapeHtml(shorten(data.description, 140))}</p>
          <div class="row">
            <div class="stat">Players: ${Number(data.playing).toLocaleString()}</div>
            <div class="stat">Visits: ${Number(data.visits).toLocaleString()}</div>
          </div>
          <a class="play-btn" href="${g.playUrl}" target="_blank" rel="noopener">Play</a>
        </div>
      `;
      // enable hover sound and small tilt - handled globally
      grid.appendChild(card);
    } else {
      const err = document.createElement('div');
      err.className = 'game-card';
      err.innerHTML = `<div class="game-info"><h3>Failed to load</h3><p>Game info unavailable.</p></div>`;
      grid.appendChild(err);
    }
  });

  // after building gallery, fetch counts
  refreshCounts();

  // notify page to hide loading
  if (window.__KOR && window.__KOR.loadingDone) window.__KOR.loadingDone();

  // poll some things
  setInterval(refreshCounts, 30_000); // every 30s
}

// shorten text safely
function shorten(s, n){
  if (!s) return "";
  s = s.replace(/\r\n/g," ").replace(/\n/g," ");
  return s.length > n ? s.slice(0,n-1).trim() + "…" : s;
}
function escapeHtml(s){
  if (!s) return "";
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
}

// Fetch group and discord counts
async function refreshCounts(){
  try {
    const [group, discord] = await Promise.all([
      fetchJSON(`/api/group/${GROUP_ID}`).catch(()=>({memberCount:0})),
      fetchJSON(`/api/discord/${DISCORD_INVITE}`).catch(()=>({approximate_member_count:0}))
    ]);

    const gCount = group.memberCount ?? 0;
    const dCount = discord.approximate_member_count ?? 0;

    if (window.__KOR) {
      window.__KOR.setGroupCount(gCount);
      window.__KOR.setDiscordCount(dCount);
    }
  } catch (err) {
    console.warn("Counts refresh failed", err);
  }
}

// Start
buildGallery();
