import { classIcon, classSelect, loadClassGroups } from "/common.js";

const token = location.pathname.split("/")[2];
const api = (path, opts = {}) =>
  fetch(`/api/t/${token}${path}`, {
    ...opts,
    headers: opts.body ? { "content-type": "application/json" } : undefined,
  });
const $ = (id) => document.getElementById(id);
const errorEl = $("error");
const groups = await loadClassGroups();
let state = null;
let history = [];
let viewWeek = "current";

function el(tag, props = {}, ...children) {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children);
  return node;
}

function showError(msg) {
  errorEl.textContent = msg ?? "";
}

async function send(path, method, body) {
  showError("");
  const res = await api(path, { method, body: body ? JSON.stringify(body) : undefined });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(Object.values(data.fields ?? {}).join(". ") || data.error || "Request failed");
  }
}

async function load() {
  const res = await api("");
  if (res.status === 404) {
    document.querySelector("main").replaceChildren(el("h1", { textContent: "Tracker not found" }), el("p", { className: "lead", textContent: "This link is invalid. Check that you copied it fully." }));
    return false;
  }
  state = await res.json();
  history = (await (await api("/history")).json()).weeks;
  return true;
}

const MAX_RAIDS = 3; // gold-earning raids per character per week

const fmtGold = (n) => `${n.toLocaleString("en-US")} G`;
// Same rule as the server: only the 3 highest-paying cleared raids award gold.
const topGold = (golds) => golds.sort((a, b) => b - a).slice(0, MAX_RAIDS).reduce((s, g) => s + g, 0);

const fmtWeek = (iso) => new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
const prettyKey = (key) => key.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());

function renderWeeks() {
  const select = $("week");
  select.replaceChildren(new Option(`Current week (${fmtWeek(state.weekStart)})`, "current"));
  for (const w of history) select.append(new Option(`Week of ${fmtWeek(w.weekStart)}`, w.weekStart));
  select.value = viewWeek;
  const past = viewWeek !== "current";
  $("markall").hidden = past;
  $("addtoggle").hidden = past;
  if (past) $("addform").hidden = true;
}

function difficultyControl(ch, raid) {
  if (raid.options.length < 2) return el("span", { className: `badge ${raid.difficulty}`, textContent: raid.label });
  const select = el("select", { className: `diff ${raid.difficulty}` });
  for (const o of raid.options) select.append(new Option(o.label, o.difficulty));
  select.value = raid.difficulty;
  // Keep the chip's checkbox from toggling when the dropdown is used.
  select.addEventListener("click", (e) => e.stopPropagation());
  select.addEventListener("change", async () => {
    try {
      await send("/prefs", "PUT", { characterId: ch.id, raid: raid.raid, difficulty: select.value });
      await refresh();
    } catch (e) {
      select.value = raid.difficulty;
      showError(e.message);
    }
  });
  return select;
}

function raidChip(ch, raid) {
  const input = el("input", { type: "checkbox", checked: raid.cleared });
  raid.input = input;
  input.addEventListener("change", async () => {
    raid.cleared = input.checked;
    updateProgress(ch);
    try {
      await send("/clears", "PUT", { characterId: ch.id, raidKey: raid.key, cleared: input.checked });
    } catch (e) {
      raid.cleared = !input.checked;
      input.checked = raid.cleared;
      updateProgress(ch);
      showError(e.message);
    }
  });
  return el("li", {}, el("label", { className: "raid" }, input, el("span", { className: "check", textContent: "✓" }), el("span", { className: "name", textContent: raid.name }), difficultyControl(ch, raid), el("span", { className: "gold", textContent: raid.gold ? fmtGold(raid.gold) : "—", title: raid.gold ? "" : "Gold not published yet" })));
}

const progressEls = new Map();
function updateProgress(ch) {
  const p = progressEls.get(ch.id);
  if (!p) return;
  const done = ch.raids.filter((r) => r.cleared).length;
  const max = Math.min(MAX_RAIDS, ch.raids.length);
  p.text.textContent = `${done}/${max}`;
  // At the limit, the remaining raids can't be ticked until one is cleared.
  for (const r of ch.raids) if (r.input) r.input.disabled = !r.cleared && done >= MAX_RAIDS;
  p.gold.textContent = `${fmtGold(topGold(ch.raids.filter((r) => r.cleared).map((r) => r.gold ?? 0)))} this week`;
  p.bar.style.width = max ? `${(done / max) * 100}%` : "0";
}

function editForm(ch, card) {
  const name = el("input", { name: "name", value: ch.name, maxLength: 32 });
  const cls = classSelect(groups);
  cls.value = ch.class;
  const ilvl = el("input", { name: "ilvl", type: "number", step: "any", min: 1, value: ch.ilvl });
  const save = el("button", { type: "submit", className: "primary", textContent: "Save" });
  const cancel = el("button", { type: "button", textContent: "Cancel" });
  const form = el("form", { className: "addform" }, name, cls, ilvl, save);
  form.style.gridTemplateColumns = "1fr 1fr";
  form.append(cancel);
  cancel.addEventListener("click", () => render());
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await send(`/characters/${ch.id}`, "PATCH", { name: name.value, class: cls.value, ilvl: ilvl.valueAsNumber });
      await refresh();
    } catch (err) {
      showError(err.message);
    }
  });
  card.replaceChildren(form);
}

function characterCard(ch) {
  const card = el("article", { className: "card" });
  card.dataset.id = ch.id;
  const grip = el("span", { className: "grip", textContent: "⠿", title: "Drag to reorder" });
  // Only draggable from the handle so selects and checkboxes keep working.
  grip.addEventListener("mousedown", () => (card.draggable = true));
  card.addEventListener("dragstart", (e) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(ch.id));
    card.classList.add("dragging");
  });
  card.addEventListener("dragend", async () => {
    card.draggable = false;
    card.classList.remove("dragging");
    await saveOrder();
  });
  const avatar = el("div", { className: "avatar", title: ch.class }, classIcon(ch.class));
  const text = el("span", { className: "text", textContent: "" });
  const bar = el("i");
  const gold = el("div", { className: "weekgold", title: "Each character can clear up to 3 raids per week for gold" });
  progressEls.set(ch.id, { text, bar, gold });
  card.append(
    el("header", {},
      el("div", { className: "who" }, grip, avatar, el("div", {}, el("h2", { textContent: ch.name }), el("small", {}, `${ch.class} · `, el("span", { className: "ilvl", textContent: ch.ilvl })))),
      el("span", { className: "progress" }, text),
    ),
    el("div", { className: "bar" }, bar),
    gold,
  );
  if (ch.raids.length) card.append(el("ul", { className: "raids" }, ...ch.raids.map((r) => raidChip(ch, r))));
  else card.append(el("p", { className: "empty", textContent: "No eligible raids at this item level." }));
  updateProgress(ch);

  const markAll = el("button", { textContent: "Mark all", disabled: !ch.raids.length, title: "Marks the 3 highest-paying raids" });
  markAll.addEventListener("click", async () => {
    try {
      await send("/mark-all", "POST", { characterId: ch.id });
      await refresh();
    } catch (e) {
      showError(e.message);
    }
  });
  const edit = el("button", { textContent: "Edit" });
  edit.addEventListener("click", () => editForm(ch, card));
  const del = el("button", { className: "danger", textContent: "Delete" });
  del.addEventListener("click", async () => {
    if (!confirm(`Delete ${ch.name} and all their clear history?`)) return;
    try {
      await send(`/characters/${ch.id}`, "DELETE");
      await refresh();
    } catch (e) {
      showError(e.message);
    }
  });
  card.append(el("footer", {}, markAll, edit, del));
  return card;
}

async function saveOrder() {
  const ids = [...$("characters").querySelectorAll(".card[data-id]")].map((n) => Number(n.dataset.id));
  const previous = state.characters.map((c) => c.id);
  if (ids.join() === previous.join()) return;
  state.characters.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
  try {
    await send("/order", "PUT", { ids });
  } catch (e) {
    showError(e.message);
    await refresh();
  }
}

$("characters").addEventListener("dragover", (e) => {
  const dragging = document.querySelector(".card.dragging");
  if (!dragging) return;
  e.preventDefault();
  const others = [...$("characters").querySelectorAll(".card[data-id]:not(.dragging)")];
  // Insert before the first card whose centre is after the cursor (row-major order).
  const next = others.find((n) => {
    const r = n.getBoundingClientRect();
    return e.clientY < r.top + r.height / 2 || (e.clientY < r.bottom && e.clientX < r.left + r.width / 2);
  });
  $("characters").insertBefore(dragging, next ?? null);
});

function historyCard(week, ch) {
  return el("article", { className: "card" },
    el("header", {}, el("div", { className: "who" }, el("h2", { textContent: ch.name })), el("span", { className: "progress", textContent: fmtGold(ch.weeklyGold) })),
    el("ul", { className: "raids" }, ...ch.clears.map((k) => el("li", {}, el("div", { className: "raid readonly" }, el("span", { className: "check", textContent: "✓" }), el("span", { className: "name", textContent: prettyKey(k) }))))),
  );
}

function render() {
  progressEls.clear();
  renderWeeks();
  const root = $("characters");
  if (viewWeek === "current") {
    root.replaceChildren(...(state.characters.length ? state.characters.map(characterCard) : [el("p", { className: "empty", textContent: "No characters yet. Add one above." })]));
    return;
  }
  const w = history.find((h) => h.weekStart === viewWeek);
  root.replaceChildren(...(w ? w.characters.map((ch) => historyCard(w, ch)) : [el("p", { className: "empty", textContent: "No clears recorded that week." })]));
}

async function refresh() {
  if (await load()) render();
}

$("week").addEventListener("change", (e) => {
  viewWeek = e.target.value;
  render();
});
$("addtoggle").addEventListener("click", () => ($("addform").hidden = !$("addform").hidden));
$("addclass").replaceWith(Object.assign(classSelect(groups), { id: "addclass" }));
$("addform").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.currentTarget;
  try {
    await send("/characters", "POST", { name: f.elements.name.value, class: f.elements.class.value, ilvl: f.elements.ilvl.valueAsNumber });
    f.reset();
    f.hidden = true;
    await refresh();
  } catch (err) {
    showError(err.message);
  }
});
$("markall").addEventListener("click", async () => {
  try {
    await send("/mark-all", "POST", {});
    await refresh();
  } catch (e) {
    showError(e.message);
  }
});

if (sessionStorage.getItem("justCreated")) {
  sessionStorage.removeItem("justCreated");
  $("link").value = location.href;
  $("notice").hidden = false;
  $("copy").addEventListener("click", async () => {
    await navigator.clipboard.writeText(location.href);
    $("copy").textContent = "Copied!";
  });
}

await refresh();
