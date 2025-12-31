// Static mission briefings and tips (no API required)

const missionBriefings: { [key: number]: string } = {
  1: "Welcome to Sangmin Galaxy, Pilot. Enemy forces detected. Engage with caution.",
  2: "Hostile activity increased. Multiple targets inbound. Stay alert!",
  3: "Heavy resistance ahead. Command expects casualties. Prove them wrong.",
  4: "Enemy reinforcements detected. This is where legends are made, Pilot.",
  5: "Critical sector breach. The galaxy depends on your skills. No retreat!",
  6: "Final approach. Overwhelming enemy presence. Victory or nothing!",
};

const pilotTips = [
  "Never stop moving; a stationary target is a dead one.",
  "Watch the patterns. Every enemy has a weakness.",
  "Conserve your special weapons for tough situations.",
  "Stay centered - control the battlefield from the middle.",
  "Predict enemy movement. Shoot where they'll be, not where they are.",
  "Speed is survival. Hesitation is defeat.",
  "Trust your reflexes. They're faster than thought.",
];

export async function getMissionBriefing(stage: number): Promise<string> {
  return missionBriefings[stage] || 
    `Stage ${stage}: Intelligence reports high activity. Proceed with extreme caution.`;
}

export async function getPilotTip(): Promise<string> {
  const randomIndex = Math.floor(Math.random() * pilotTips.length);
  return pilotTips[randomIndex];
}
