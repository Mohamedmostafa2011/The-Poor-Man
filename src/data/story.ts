export type StoryPage = {
  kind: "cover" | "text" | "end" | "credits";
  heading?: string;
  chapter?: string;
  paragraphs?: string[];
  pull?: string;
  decor?: string;
};

/**
 * The built-in (typed) version of the story.
 * It is shown whenever no PDF link has been added yet,
 * so the QR code ALWAYS leads to a readable story.
 */
export const STORY: StoryPage[] = [
  { kind: "cover" },
  {
    kind: "text",
    chapter: "Chapter One",
    heading: "The Village of Dusty Roads",
    decor: "🏜️",
    paragraphs: [
      "At the edge of the desert, where the wind carried more sand than news, there was a small village called Beit El-Noor — the House of Light.",
      "It was a village of narrow streets, of bread baked on hot stones, and of people who knew every one of their neighbours by name.",
      "And in that village lived a man whom everybody called, quite simply, the poor man.",
    ],
  },
  {
    kind: "text",
    chapter: "Chapter One",
    heading: "Hamid, the Water Carrier",
    decor: "🫖",
    paragraphs: [
      "His name was Hamid. Every morning, before the sun had finished climbing the hills, he walked to the well with two clay jars tied to a wooden pole.",
      "He carried water to the baker, to the old women, to the school with the blue door. For every jar he earned a coin so small it could hide under a fingernail.",
      "His house had one room, one window, and one lamp. Yet whoever passed by his door at sunset heard him singing.",
    ],
    pull: "“A man who sings is never completely empty,” he used to say.",
  },
  {
    kind: "text",
    chapter: "Chapter Two",
    heading: "The Merchant Who Had Everything",
    decor: "🐫",
    paragraphs: [
      "One evening a caravan entered the village: twelve camels, four servants, and a merchant named Salem, whose rings were worth more than the whole street.",
      "Salem was travelling to the city to buy a house with forty windows. He had gold in his bags, silk on his back — and a strange, heavy feeling in his chest that he could not sell.",
      "“Tell me,” he said to the villagers, “who is the poorest man here? I wish to see what true poverty looks like, so I may thank God for my fortune.”",
    ],
  },
  {
    kind: "text",
    chapter: "Chapter Two",
    heading: "A Door Without a Lock",
    decor: "🚪",
    paragraphs: [
      "They pointed to a small house at the end of the road. “Hamid,” they said. “He owns nothing but his jars.”",
      "Salem knocked. The door opened at once, for it had no lock — there was nothing inside worth stealing.",
      "“Welcome!” said Hamid, as though a king had arrived. “Come in, come in. You must be tired from the road.”",
    ],
  },
  {
    kind: "text",
    chapter: "Chapter Three",
    heading: "One Loaf of Bread",
    decor: "🍞",
    paragraphs: [
      "On the floor, on a cloth, lay the man's whole dinner: one loaf of bread and a small bowl of salt.",
      "Hamid broke the loaf in two and offered the larger half to his guest. Then he poured water into the only cup he owned and placed it in Salem's hands.",
      "“But this is all your food,” Salem said quietly. “What will you eat tomorrow?”",
      "Hamid smiled. “Tomorrow has its own bread. Tonight I have a guest.”",
    ],
  },
  {
    kind: "text",
    chapter: "Chapter Three",
    heading: "The Longest Night",
    decor: "🌙",
    paragraphs: [
      "That night Salem could not sleep. He lay on silk cushions in his tent and counted, not stars, but memories.",
      "He remembered the beggar he had passed without looking. The worker he had paid late. The brother he had not spoken to in nine years. The forty windows of a house that no friend would ever knock upon.",
      "He had crossed a desert to see poverty — and found it, at last, inside his own chest.",
    ],
    pull: "He had everything in his hands and nothing in his heart.",
  },
  {
    kind: "text",
    chapter: "Chapter Four",
    heading: "The Morning Gift",
    decor: "🌅",
    paragraphs: [
      "At dawn Salem returned with a heavy purse of gold and placed it before Hamid. “Take it,” he said. “You fed me when you had nothing.”",
      "Hamid pushed the purse gently back. “Keep enough to build a well for the village,” he answered, “and the children will never carry heavy jars again.”",
      "So they built it together: a well of white stone, with a bucket of iron and a shaded bench beside it.",
    ],
  },
  {
    kind: "text",
    chapter: "Chapter Four",
    heading: "What the Village Learned",
    decor: "💧",
    paragraphs: [
      "Salem never bought the house with forty windows. He stayed, opened a small shop, and learned the names of his neighbours.",
      "And when travellers stopped at the white well and asked, “Who was the poor man of this village?” the children would laugh and answer:",
      "“He was the rich one — until the poor one taught him how to give.”",
    ],
  },
  {
    kind: "text",
    heading: "The Moral",
    decor: "✨",
    paragraphs: [
      "Poverty is not an empty pocket. Poverty is an empty heart.",
      "The richest person in any village is the one who can still share the only loaf he owns.",
    ],
    pull: "Give, even when your hands are small.",
  },
  { kind: "end" },
  { kind: "credits" },
];
