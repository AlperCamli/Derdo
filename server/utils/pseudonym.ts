const adjectives = [
  "Kind",
  "Brave",
  "Calm",
  "Bright",
  "Gentle",
  "Swift",
  "Quiet",
  "Happy"
];

const animals = [
  "Fox",
  "Otter",
  "Koala",
  "Panda",
  "Hawk",
  "Dolphin",
  "Robin",
  "Lynx"
];

// Simple pseudonym generator like KindFox123
export const generatePseudonym = () => {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  const num = Math.floor(100 + Math.random() * 900);
  return `${adj}${animal}${num}`;
};
