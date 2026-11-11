import { classSelect, loadClassGroups } from "/common.js";

const rows = document.getElementById("rows");
const errorEl = document.getElementById("error");
const groups = await loadClassGroups();

function addRow() {
  const row = document.createElement("div");
  row.className = "row";
  const name = Object.assign(document.createElement("input"), { name: "name", placeholder: "Character name", maxLength: 32 });
  const ilvl = Object.assign(document.createElement("input"), { name: "ilvl", placeholder: "Item level", type: "number", step: "any", min: 1 });
  const cp = Object.assign(document.createElement("input"), { name: "cp", placeholder: "CP (optional)", type: "number", step: 1, min: 1 });
  const remove = Object.assign(document.createElement("button"), { type: "button", className: "remove", textContent: "✕", title: "Remove this character" });
  remove.addEventListener("click", () => rows.children.length > 1 && row.remove());
  row.append(name, classSelect(groups), ilvl, cp, remove);
  rows.append(row);
}

document.getElementById("add").addEventListener("click", addRow);
addRow();

document.getElementById("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  errorEl.textContent = "";
  document.querySelectorAll(".invalid").forEach((el) => el.classList.remove("invalid"));
  const characters = [...rows.children].map((row) => ({
    name: row.querySelector("[name=name]").value,
    class: row.querySelector("[name=class]").value,
    ilvl: row.querySelector("[name=ilvl]").valueAsNumber,
    cp: row.querySelector("[name=cp]").valueAsNumber || null,
  }));
  try {
    const res = await fetch("/api/trackers", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ characters }),
    });
    const data = await res.json();
    if (!res.ok) {
      const fields = data.fields ?? {};
      let general = "";
      for (const [key, msg] of Object.entries(fields)) {
        const m = key.match(/^characters\.(\d+)\.(\w+)$/);
        if (m) rows.children[Number(m[1])]?.querySelector(`[name=${m[2]}]`)?.classList.add("invalid");
        else general = msg;
      }
      errorEl.textContent = general || Object.values(fields).join(". ") || "Something went wrong";
      return;
    }
    sessionStorage.setItem("justCreated", "1");
    location.href = data.path;
  } catch {
    errorEl.textContent = "Network error, please try again.";
  }
});
