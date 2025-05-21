import fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('our-team.html', 'utf8');
const $ = cheerio.load(html);

// Adjust the max number of cards you expect in any section
const MAX_CARDS = 6;
let rows = [['Section', 'H2', ...Array.from({length: MAX_CARDS}, (_, i) => `Card ${i+1}`)]];

$('section').each((i, section) => {
  // Section name from comment or id
  let sectionName = '';
  const prev = $(section).prev();
  if (prev[0] && prev[0].type === 'comment') {
    sectionName = prev[0].data.trim();
  } else if ($(section).attr('id')) {
    sectionName = $(section).attr('id').replace(/-/g, ' ');
  } else {
    sectionName = 'Section ' + (i + 1);
  }

  const h2 = $(section).find('h2').first().text().trim();

  let cardParagraphs = [];
  // For slider sections (multiple cards)
  if ($(section).find('.reza-slide').length > 0) {
    $(section).find('.reza-slide').each((j, slide) => {
      const p = $(slide).find('p.reza-description').text().trim();
      cardParagraphs.push(p);
    });
  } else {
    // For single card sections
    const p = $(section).find('p.reza-description').text().trim();
    if (p) cardParagraphs.push(p);
  }

  // Pad to MAX_CARDS for consistent columns
  while (cardParagraphs.length < MAX_CARDS) cardParagraphs.push('');

  rows.push([sectionName, h2, ...cardParagraphs]);
});

// Convert to CSV string
const csv = rows.map(row => row.map(field => `"${field.replace(/"/g, '""')}"`).join(',')).join('\n');
fs.writeFileSync('team.csv', csv, 'utf8');
console.log('CSV written to team.csv');