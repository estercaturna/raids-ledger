export async function loadClassGroups() {
  const res = await fetch("/api/meta");
  return (await res.json()).classGroups;
}

/** Builds a <select name="class"> with classes grouped by archetype. */
export function classSelect(groups) {
  const select = document.createElement("select");
  select.name = "class";
  select.required = true;
  const placeholder = new Option("Class", "", true, true);
  placeholder.disabled = true;
  select.append(placeholder);
  for (const g of groups) {
    const optgroup = document.createElement("optgroup");
    optgroup.label = g.group;
    for (const c of g.classes) optgroup.append(new Option(c, c));
    select.append(optgroup);
  }
  return select;
}

const ICONS = {
  Berserker: "🪓", Destroyer: "🔨", Gunlancer: "🛡️", "Guardian Knight": "🐴", Paladin: "✨", Slayer: "⚔️", Valkyrie: "🪽",
  Wardancer: "🥋", Scrapper: "🥊", Soulfist: "🔥", Glaivier: "🔱", Striker: "⚡", Breaker: "💥",
  Deadeye: "🎯", Gunslinger: "🔫", Artillerist: "💣", Machinist: "⚙️", Sharpshooter: "🏹", Scouter: "🔭",
  Bard: "🎵", Arcanist: "🃏", Summoner: "🌿", Sorceress: "❄️",
  Deathblade: "🗡️", Shadowhunter: "🦇", Reaper: "🌑", Souleater: "🌙",
  Artist: "🎨", Aeromancer: "☔", Wildsoul: "🐾", Dimensionalist: "🌀",
};

const emoji = (cls) => ICONS[cls] ?? "❔";

/** Uses /icons/<Class>.png when present (e.g. Bard.png), otherwise falls back to an emoji. */
export function classIcon(cls) {
  const wrap = document.createElement("span");
  wrap.textContent = emoji(cls);
  const img = new Image();
  img.alt = cls;
  img.className = "classimg";
  img.addEventListener("load", () => wrap.replaceChildren(img));
  img.src = `/icons/${cls}.png`;
  return wrap;
}

const HUES = { Warrior: 8, "Martial Artist": 28, Gunner: 48, Mage: 265, Assassin: 330, Specialist: 170 };

export function classColor(groups, cls) {
  const group = groups.find((g) => g.classes.includes(cls))?.group;
  return `hsl(${HUES[group] ?? 250} 65% 45%)`;
}
