import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.static("public"));

/* ---------------------------
   🔵 GET GAME DETAILS
---------------------------- */
async function getGameDetails(universeId) {
  const r = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`);
  const j = await r.json();
  return j.data?.[0] || null;
}

async function getThumbnail(universeId) {
  const r = await fetch(
    `https://thumbnails.roblox.com/v1/games/icons?universeIds=${universeId}&size=512x512&format=Png`
  );
  const j = await r.json();
  return j.data?.[0]?.imageUrl || "/Pictures/Logo.png";
}

app.get("/api/game/:uid", async (req, res) => {
  try {
    const id = req.params.uid;
    const details = await getGameDetails(id);
    const thumbnail = await getThumbnail(id);

    res.json({
      name: details?.name || "Unknown Game",
      description: details?.description || "",
      playing: details?.playing || 0,
      visits: details?.visits || 0,
      thumbnail
    });
  } catch (err) {
    res.json({ error: "Failed to fetch game" });
  }
});


/* ---------------------------
   🔴 GET ROBLOX GROUP MEMBERS
---------------------------- */
app.get("/api/group/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const r = await fetch(`https://groups.roblox.com/v2/groups/${id}`, {
      headers: {
        "x-api-key": process.env.ROBLOX_API_KEY,
        "User-Agent": "KOR-Studios"
      }
    });

    const txt = await r.text();
    let json;

    try { json = JSON.parse(txt); }
    catch { return res.json({ memberCount: 0, raw: txt }); }

    const count =
      json?.data?.memberCount ??
      json?.memberCount ??
      0;

    res.json({ memberCount: count });

  } catch (err) {
    console.error("GROUP ERROR:", err);
    res.json({ memberCount: 0 });
  }
});



/* ---------------------------
   🔵 GET DISCORD SERVER COUNTS
---------------------------- */
app.get("/api/discord/:invite", async (req, res) => {
  const invite = req.params.invite;

  try {
    const r = await fetch(
      `https://discord.com/api/v9/invites/${invite}?with_counts=true`,
      {
        headers: {
          "User-Agent": "DiscordBot (KOR Studios, 1.0)"
        }
      }
    );

    const txt = await r.text();
    let j;
    try { j = JSON.parse(txt); }
    catch { return res.json({ approximate_member_count: 0 }); }

    res.json({
      approximate_member_count:
        j.approximate_member_count ??
        j.approximate_presence_count ??
        0
    });

  } catch (err) {
    res.json({ approximate_member_count: 0 });
  }
});


/* ---------------------------
   🟢 START SERVER
---------------------------- */
const PORT = 3000;
app.listen(PORT, () =>
  console.log(`✅ Server running at http://localhost:${PORT}`)
);
