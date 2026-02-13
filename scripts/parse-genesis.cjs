const fs = require('fs');

const raw = fs.readFileSync('attached_assets/Genesis_Decoded_REVISED_(1)_1770953705680.pdf', 'utf-8');
const lines = raw.split('\n');

const chapters = [];
let currentChapter = null;
let currentVerse = null;
let mode = null; // 'kjv', 'decoded', 'context'
let buffer = '';
let chapterIntros = {};
let currentIntroChapter = null;
let introBuffer = '';

// Find where actual verse content starts
let verseStarted = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  
  // Match "Genesis X:Y" pattern for verse references
  const verseMatch = line.match(/^Genesis\s+(\d+):(\d+)$/);
  
  // Match chapter headers like "Genesis Chapter X" 
  const chapterHeaderMatch = line.match(/^Genesis Chapter\s+(\d+)$/);
  
  if (chapterHeaderMatch) {
    const chapNum = parseInt(chapterHeaderMatch[1]);
    // Skip duplicate headers (the PDF has them twice sometimes)
    if (!currentChapter || currentChapter.number !== chapNum) {
      // Save previous verse
      if (currentVerse && mode && buffer.trim()) {
        currentVerse[mode] = buffer.trim();
      }
      if (currentVerse && currentChapter) {
        currentChapter.verses.push(currentVerse);
      }
      currentVerse = null;
      mode = null;
      buffer = '';
      
      // Save previous chapter
      if (currentChapter && currentChapter.verses.length > 0) {
        chapters.push(currentChapter);
      }
      
      currentChapter = { number: chapNum, title: '', verses: [] };
    }
    continue;
  }
  
  if (verseMatch) {
    verseStarted = true;
    const chapNum = parseInt(verseMatch[1]);
    const verseNum = parseInt(verseMatch[2]);
    
    // Save previous buffer
    if (currentVerse && mode && buffer.trim()) {
      currentVerse[mode] = buffer.trim();
    }
    
    // Push previous verse
    if (currentVerse && currentChapter) {
      currentChapter.verses.push(currentVerse);
    }
    
    // Create chapter if needed
    if (!currentChapter || currentChapter.number !== chapNum) {
      if (currentChapter && currentChapter.verses.length > 0) {
        chapters.push(currentChapter);
      }
      currentChapter = { number: chapNum, title: '', verses: [] };
    }
    
    currentVerse = { verse: verseNum, kjv: '', decoded: '', context: '' };
    mode = null;
    buffer = '';
    continue;
  }
  
  if (!verseStarted) continue;
  
  // Detect mode switches
  if (line.match(/^King James Version:/i) || line === 'King James Version:​') {
    if (currentVerse && mode && buffer.trim()) {
      currentVerse[mode] = buffer.trim();
    }
    mode = 'kjv';
    buffer = '';
    // Check if text is on same line
    const afterColon = line.replace(/^King James Version:\s*​?\s*/i, '').trim();
    if (afterColon) buffer = afterColon;
    continue;
  }
  
  if (line.match(/^Decoded\s*\(Modern Language\):/i) || line.match(/^Decoded \(Modern Language\):​/)) {
    if (currentVerse && mode && buffer.trim()) {
      currentVerse[mode] = buffer.trim();
    }
    mode = 'decoded';
    buffer = '';
    const afterColon = line.replace(/^Decoded\s*\(Modern Language\):\s*​?\s*/i, '').trim();
    if (afterColon) buffer = afterColon;
    continue;
  }
  
  if (line.match(/^Context:/i) || line === 'Context:​') {
    if (currentVerse && mode && buffer.trim()) {
      currentVerse[mode] = buffer.trim();
    }
    mode = 'context';
    buffer = '';
    const afterColon = line.replace(/^Context:\s*​?\s*/i, '').trim();
    if (afterColon) buffer = afterColon;
    continue;
  }
  
  // Accumulate text
  if (mode && currentVerse && line) {
    if (buffer) buffer += ' ';
    buffer += line;
  }
}

// Save last verse and chapter
if (currentVerse && mode && buffer.trim()) {
  currentVerse[mode] = buffer.trim();
}
if (currentVerse && currentChapter) {
  currentChapter.verses.push(currentVerse);
}
if (currentChapter && currentChapter.verses.length > 0) {
  chapters.push(currentChapter);
}

// Clean up unicode zero-width spaces
function cleanText(text) {
  return text.replace(/\u200B/g, '').replace(/​/g, '').replace(/\s+/g, ' ').trim();
}

for (const ch of chapters) {
  for (const v of ch.verses) {
    v.kjv = cleanText(v.kjv);
    v.decoded = cleanText(v.decoded);
    v.context = cleanText(v.context);
  }
}

// Add chapter titles based on table of contents
const chapterTitles = {
  1: "Creation and Order",
  2: "Humanity and Responsibility",
  3: "Choice, Consequence, and Awareness",
  4: "Conflict, Violence, and Continuation",
  5: "Genealogies and Continuity",
  6: "Human Corruption and the Decision to Preserve",
  7: "The Flood",
  8: "Recession and Renewal",
  9: "Covenant and Reestablished Order",
  10: "The Spread of Peoples",
  11: "Language, Power, and Dispersion",
  12: "Abram and the Call",
  13: "Separation and Settlement",
  14: "Conflict and Alliance",
  15: "Covenant and Promise",
  16: "Hagar and Ishmael",
  17: "Covenant Expanded",
  18: "Promise and Judgment",
  19: "Sodom and Gomorrah",
  20: "Power and Protection",
  21: "Isaac and Separation",
  22: "Testing and Trust",
  23: "Death and Inheritance",
  24: "Marriage and Continuity",
  25: "Generations and Transition",
  26: "Repetition and Conflict",
  27: "Deception and Blessing",
  28: "Vision and Promise",
  29: "Labor and Relationship",
  30: "Competition and Growth",
  31: "Departure and Boundary",
  32: "Conflict and Transformation",
  33: "Reconciliation",
  34: "Violence and Consequence",
  35: "Renewal and Loss",
  36: "Edom and Lineage",
  37: "Joseph Sold",
  38: "Judah and Tamar",
  39: "Joseph in Egypt",
  40: "Imprisonment and Interpretation",
  41: "Power and Preparation",
  42: "Famine and Reunion",
  43: "Testing and Return",
  44: "Judgment and Mercy",
  45: "Revelation and Forgiveness",
  46: "Migration and Preservation",
  47: "Settlement in Egypt",
  48: "Blessings and Legacy",
  49: "Final Words and Identity",
  50: "Death, Memory, and Continuity"
};

for (const ch of chapters) {
  ch.title = chapterTitles[ch.number] || '';
}

const result = {
  title: "The Book of Genesis Decoded",
  author: "Brittany Johnson",
  description: "Every sentence of the King James Version of Genesis translated into modern, plain English with contextual clarification.",
  copyright: "© 2025 Brittany Johnson. All rights reserved.",
  totalChapters: chapters.length,
  chapters
};

console.log(`Parsed ${chapters.length} chapters`);
for (const ch of chapters) {
  console.log(`  Chapter ${ch.number}: ${ch.verses.length} verses - ${ch.title}`);
}

fs.writeFileSync('server/data/genesis-decoded.json', JSON.stringify(result, null, 2));
console.log('\nSaved to server/data/genesis-decoded.json');
