export interface ClassGroup {
  group: string;
  classes: string[];
}

export const CLASS_GROUPS: ClassGroup[] = [
  { group: "Warrior", classes: ["Berserker", "Destroyer", "Gunlancer", "Guardian Knight", "Paladin", "Slayer", "Valkyrie"] },
  { group: "Martial Artist", classes: ["Wardancer", "Scrapper", "Soulfist", "Glaivier", "Striker", "Breaker"] },
  { group: "Gunner", classes: ["Deadeye", "Gunslinger", "Artillerist", "Machinist", "Sharpshooter"] },
  { group: "Mage", classes: ["Bard", "Arcanist", "Summoner", "Sorceress"] },
  { group: "Assassin", classes: ["Deathblade", "Shadowhunter", "Reaper", "Souleater"] },
  { group: "Specialist", classes: ["Artist", "Aeromancer", "Wildsoul", "Dimensionalist"] },
];

export const CLASSES: string[] = CLASS_GROUPS.flatMap((g) => g.classes);
