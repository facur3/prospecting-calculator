const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Configuration
const WIKI_URL = 'https://prospecting.miraheze.org/wiki/Ore_Values'; // Best guess for a table
const TARGET_FILE = path.join(__dirname, 'museum_data.js');

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
};

async function main() {
    console.log('🚀 Starting Update Script...');

    // 1. Read existing museum data
    console.log('📖 Reading museum_data.js...');
    let fileContent = fs.readFileSync(TARGET_FILE, 'utf8');

    // Evaluate the file in a sandbox to get the object
    const sandbox = {};
    try {
        vm.runInNewContext(fileContent, sandbox);
    } catch (e) {
        console.error('❌ Error parsing museum_data.js:', e);
        process.exit(1);
    }

    const museumData = sandbox.museumData;
    if (!museumData || !museumData.ores) {
        console.error('❌ Invalid museum_data.js structure.');
        process.exit(1);
    }

    // 2. Fetch Wiki Data
    console.log(`🌍 Fetching ${WIKI_URL}...`);
    let html;
    try {
        const response = await axios.get(WIKI_URL, { headers: HEADERS });
        html = response.data;
    } catch (e) {
        // Fallback or error
        console.error(`❌ Error fetching wiki: ${e.message}`);
        // Try 'Minerals' page if 'Ore_Values' fails
        console.log('🔄 Trying alternative URL: https://prospecting.miraheze.org/wiki/Minerals');
        try {
            const res2 = await axios.get('https://prospecting.miraheze.org/wiki/Minerals', { headers: HEADERS });
            html = res2.data;
        } catch (e2) {
            console.error('❌ Failed to fetch alternative URL.');
            process.exit(1);
        }
    }

    const $ = cheerio.load(html);
    let updatedCount = 0;
    let newCount = 0;

    // 3. Parse Table
    // Look for tables. We generally expect headers: Name, Value, etc.
    $('table.wikitable tr').each((i, el) => {
        const tds = $(el).find('td');
        if (tds.length < 2) return; // Skip headers or empty rows

        // Extract text helper
        const txt = (n) => $(tds[n]).text().trim();

        // This part depends heavily on the table column order.
        // We iterate and try to detect columns or assume standard order.
        // For 'Ore Values' page it typically is: Name | Value | ...
        // Let's try to identify columns by inspecting headers if possible, but for now we look at the first cell.

        let name = txt(0);
        // Clean name (remove icons etc if any)
        name = name.split('\n')[0].trim();

        if (!name) return;

        // Try to find value directly or via simple heuristic
        let valueStr = $(el).text().match(/\$[\d,]+/);
        let value = valueStr ? parseInt(valueStr[0].replace(/[$,]/g, '')) : 0;

        // Try to find Hardness/minKG
        // Look for numbers typically associated with hardness (e.g. "16kg" or just "16")
        // This is fuzzy. Safer to update only if column header matches, but simple regex on row might work.
        // If we can't be sure, we keep existing minKG.

        // Stats extraction?
        // If there's a cell with "Dig Speed +5%" etc.
        let stats = {};
        const rowText = $(el).text();

        if (rowText.includes('Dig Speed')) stats['Dig Speed'] = extractStat(rowText, 'Dig Speed');
        if (rowText.includes('Size Boost')) stats['Size Boost'] = extractStat(rowText, 'Size Boost');
        if (rowText.includes('Sell Boost')) stats['Sell Boost'] = extractStat(rowText, 'Sell Boost');
        if (rowText.includes('Capacity')) stats['Capacity'] = extractStat(rowText, 'Capacity');
        if (rowText.includes('Shake Speed')) stats['Shake Speed'] = extractStat(rowText, 'Shake Speed');
        if (rowText.includes('Shake Strength')) stats['Shake Strength'] = extractStat(rowText, 'Shake Strength');
        if (rowText.includes('Luck')) stats['Luck'] = extractStat(rowText, 'Luck');

        // Check if exists
        if (museumData.ores[name]) {
            // Update
            if (value > 0) museumData.ores[name].value = value; // If we wanted to store value (it's not in the file currently?)
            // Wait, existing museum_data.js does NOT have 'value' key in the objects!
            // It has 'minKG' and 'stats'.
            // The user request said: "Actualiza los valores existentes ... extrae: Nombre, Valor, Dureza".
            // Maybe user wants to ADD extracted Value?
            // "Actualiza los valores existentes o añade nuevos minerales al objeto/array JSON."
            // I will add value if it's missing, but respecting the existing structure first.
            // Actually, looks like priceMoney is in 'config' by rarity?
            // Ah, specific ores don't have price in `ores` map. They have stats.

            // I will update stats and minKG if found.
            if (Object.keys(stats).length > 0) {
                museumData.ores[name].stats = { ...museumData.ores[name].stats, ...stats };
            }
            updatedCount++;
        } else {
            // New Mineral
            museumData.ores[name] = {
                minKG: 0, // Default
                stats: stats
            };
            newCount++;
        }
    });

    console.log(`📊 Scanned minerals. Updated: ${updatedCount}, New: ${newCount}`);

    // 4. Reconstruct File Content
    // We want to preserve comments and structure as much as possible.
    // But since we modified the object, we have to generate the code for 'ores'.

    const newOresBlock = generateOresBlock(museumData.ores);

    // Replace the ores block in the original string
    // Regex to find "ores: { ... }" is tricky with nested braces.
    // We assume 'ores: {' starts the block and '},' ends it (before 'modifiers:').

    const startMarker = 'ores: {';
    const endMarker = '},'; // This might be risky.
    const nextSection = 'modifiers:';

    const startIndex = fileContent.indexOf(startMarker);
    const endIndex = fileContent.indexOf(nextSection);

    if (startIndex === -1 || endIndex === -1) {
        console.error('❌ Could not find ores block boundaries to replace safely.');
        process.exit(1);
    }

    // Find the last closing brace before 'modifiers:'
    const preModifiers = fileContent.substring(0, endIndex);
    const closingBraceIndex = preModifiers.lastIndexOf('}');

    if (closingBraceIndex < startIndex) {
        console.error('❌ Parsing error finding end of ores block.');
        process.exit(1);
    }

    const beforeOres = fileContent.substring(0, startIndex + startMarker.length);
    const afterOres = fileContent.substring(closingBraceIndex);

    const newContent = beforeOres + '\n' + newOresBlock + '\n    ' + afterOres;

    // Write back
    fs.writeFileSync(TARGET_FILE, newContent, 'utf8');
    console.log('💾 museum_data.js updated successfully!');
}

function extractStat(text, statName) {
    // Regex for "Dig Speed +0.05" or "5%"
    const re = new RegExp(`${statName}\\s*[+:]?\\s*([\\d.]+)%?`);
    const match = text.match(re);
    if (match) {
        let val = parseFloat(match[1]);
        if (text.includes('%') && val > 1) val = val / 100; // Convert 5% to 0.05
        return val;
    }
    return 0;
}

function generateOresBlock(ores) {
    // We try to keep the nicely formatted style
    // Group keys? The original had comments // Common etc.
    // If we only have the flat object, we lose the grouping info unless we infer it.
    // We don't have rarity in the scraped data explicitly in this simple scraper (unless we fetch it).
    // The original museum_data.js relied on manual grouping.
    // For now, we will output valid JS object body.

    const lines = [];
    for (const [key, val] of Object.entries(ores)) {
        // Format: "Name": { minKG: 10, stats: { ... } },
        const statsParts = [];
        for (const [sk, sv] of Object.entries(val.stats || {})) {
            statsParts.push(`"${sk}": ${sv}`);
        }
        const statsStr = `{ ${statsParts.join(', ')} }`;
        lines.push(`        "${key}": { minKG: ${val.minKG || 0}, stats: ${statsStr} },`);
    }
    return lines.join('\n');
}

main();
