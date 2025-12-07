const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Configuration
const WIKI_URL = 'https://prospecting.miraheze.org/wiki/Minerals';
const TARGET_FILE = path.join(__dirname, 'museum_data.js');

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

const NEW_MODIFIERS = {
    "Normal": 1,
    "Shiny": 1.2,
    "Pure": 1.35,
    "Glowing": 1.6,
    "Scorching": 2.0,
    "Irradiated": 2.5,
    "Electrified": 5.0,
    "Voidtorn": 11.0
};

async function main() {
    console.log('🚀 Starting Update Script (Miraheze Edition)...');

    // 1. Read existing museum data
    console.log('📖 Reading museum_data.js...');
    let fileContent = '';
    try {
        fileContent = fs.readFileSync(TARGET_FILE, 'utf8');
    } catch (e) {
        console.error('❌ Could not read museum_data.js', e);
        process.exit(1);
    }

    // Evaluate valid JS to get the object
    const sandbox = {};
    let extractedData;
    try {
        // "const" variables in runInNewContext don't attach to sandbox automatically.
        // We append a statement to return it, or modify the source to simple assignment.
        // Easiest: append "; museumData;" and capture return value.
        extractedData = vm.runInNewContext(fileContent + ';\nmuseumData;', sandbox);
    } catch (e) {
        console.error('❌ Error parsing museum_data.js:', e);
        process.exit(1);
    }

    const museumData = extractedData;
    if (!museumData || !museumData.ores) {
        console.error('❌ Invalid museum_data.js: missing museumData.ores');
        process.exit(1);
    }

    // 2. Fetch Wiki Data
    console.log(`🌍 Fetching ${WIKI_URL}...`);
    let html;
    try {
        const response = await axios.get(WIKI_URL, { headers: HEADERS });
        html = response.data;
    } catch (e) {
        console.error(`❌ Error fetching wiki: ${e.message}`);
        process.exit(1);
    }

    const $ = cheerio.load(html);
    let updatedCount = 0;
    let newCount = 0;

    // 3. Parse Table
    // The Minerals page appears to have multiple tables (likely one per rarity tab: Common, Uncommon, etc.).
    // We should iterate ALL tables and check if they look like a mineral list.

    $('table.wikitable').each((i, table) => {
        // analyze headers of this table
        let nameIdx = -1;
        let valueIdx = -1;

        const headers = $(table).find('tr').first().find('th');
        headers.each((j, th) => {
            const txt = $(th).text().trim().toLowerCase();
            if (txt.includes('mineral') || txt.includes('name')) nameIdx = j;
            if (txt.includes('value') || txt.includes('price') || txt.includes('$/kg')) valueIdx = j;
        });

        if (nameIdx !== -1 && valueIdx !== -1) {
            console.log(`ℹ️ Table ${i} matched: Name(col ${nameIdx}), Value(col ${valueIdx})`);
        } else {
            // Check if it's a fallback candidate (sometimes headers are <td> or different structure)
            // But strict matching is safer to avoid random tables.
            return; // Continue to next table
        }

        // Process rows of this table
        $(table).find('tr').each((rowIdx, row) => {
            const tds = $(row).find('td');
            if (tds.length === 0) return; // Skip header row

            // Name extraction
            let name = $(tds[nameIdx]).text().trim();
            name = name.split('\n')[0].trim();

            // Value extraction
            const valueText = $(tds[valueIdx]).text().trim();
            // Clean value: remove '$', ',', '/kg', etc.
            const valueClean = valueText.replace(/[$,]/g, '').replace(/\/kg/i, '').trim();
            const value = parseInt(valueClean, 10);

            if (!name || isNaN(value)) return;

            // Update or Add
            if (museumData.ores[name]) {
                // Update existing
                museumData.ores[name].value = value;
                updatedCount++;
            } else {
                // New Mineral
                museumData.ores[name] = {
                    minKG: 0,
                    value: value,
                    stats: {}
                };
                newCount++;
                console.log(`✨ New mineral found: ${name} ($${value})`);
            }
        });
    });

    console.log(`📊 Scanned minerals. Updated: ${updatedCount}, New: ${newCount}`);

    // 4. Update File Content

    // PART A: Update 'ores' object in the file
    // We will reconstruct the 'ores' object string.

    const newOresLines = [];
    newOresLines.push('    ores: {');

    // Sort keys for tidiness
    const oreKeys = Object.keys(museumData.ores).sort();

    oreKeys.forEach((key, index) => {
        const ore = museumData.ores[key];
        const minKG = ore.minKG !== undefined ? ore.minKG : 0;
        const val = ore.value !== undefined ? ore.value : 0;

        // Format stats: { "Stat": Val, ... }
        const statEntries = Object.entries(ore.stats || {}).map(([k, v]) => `"${k}": ${v}`);
        const statsStr = `{ ${statEntries.join(', ')} }`;

        // We add 'value' property
        // Format: "Name": { minKG: X, value: Y, stats: { ... } },
        const entryStr = `        "${key}": { minKG: ${minKG}, value: ${val}, stats: ${statsStr} }`;

        // Add comma mainly, logic to omit on last one if desired (but trailing comma is valid JS)
        newOresLines.push(entryStr + (index < oreKeys.length - 1 ? ',' : ''));
    });
    newOresLines.push('    },');

    const newOresBlock = newOresLines.join('\n');

    // Replace the existing ores block
    // Safer approach: Find "ores: {" and the matching closing "}," before "modifiers:"
    const startMarker = 'ores: {';
    const postMarker = 'modifiers:';

    const startIdx = fileContent.indexOf(startMarker);
    const postIdx = fileContent.indexOf(postMarker);

    if (startIdx === -1) {
        console.error('❌ Could not find "ores: {" in file.');
        process.exit(1);
    }

    let endIdx = -1;
    // If we have modifiers, we search backwards from there for the closing comma/brace
    if (postIdx !== -1) {
        const segment = fileContent.substring(startIdx, postIdx);
        const lastBrace = segment.lastIndexOf('}');
        if (lastBrace !== -1) {
            endIdx = startIdx + lastBrace + 1; // Include the brace
            // Check for comma
            if (fileContent[endIdx] === ',') endIdx++;
        }
    } else {
        // Just Regex replace if structure is different
        console.warn('⚠️ "modifiers:" section not found, using loose regex replacement.');
        fileContent = fileContent.replace(/ores:\s*\{[\s\S]*?\},?/, newOresBlock);
        // We set endIdx to -2 to skip manual splice
        endIdx = -2;
    }

    if (endIdx > 0) {
        const before = fileContent.substring(0, startIdx);
        const after = fileContent.substring(endIdx);
        fileContent = before + newOresBlock.trim() + '\n    ' + after.trim();
    }

    // PART B: Add/Update MODIFIERS constant
    // Check if MODIFIERS already exists
    const modifiersMarker = 'const MODIFIERS =';
    if (fileContent.includes(modifiersMarker)) {
        console.log('ℹ️ Updating existing MODIFIERS constant...');
        // Regex replace it
        // Assumes it ends with }; 
        const modRegex = /const MODIFIERS = \{[\s\S]*?\};/;
        const newModifiersCode = `const MODIFIERS = ${JSON.stringify(NEW_MODIFIERS, null, 4)};`;
        fileContent = fileContent.replace(modRegex, newModifiersCode);
    } else {
        console.log('➕ Appending new MODIFIERS constant...');
        // Append to the end
        const newModifiersCode = `\n\nconst MODIFIERS = ${JSON.stringify(NEW_MODIFIERS, null, 4)};\n`;
        fileContent += newModifiersCode;
    }

    // Write File
    fs.writeFileSync(TARGET_FILE, fileContent, 'utf8');
    console.log('💾 museum_data.js updated successfully!');
}

main();
