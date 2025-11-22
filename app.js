document.addEventListener('DOMContentLoaded', () => {
    if (typeof scrapedDatabase === 'undefined') {
        document.getElementById('error-overlay').style.display = 'flex';
        return;
    }

    // --- CONFIGURATION ---
    const rarityRank = { "common": 1, "uncommon": 2, "rare": 3, "epic": 4, "legendary": 5, "mythic": 6, "exotic": 7 };
    const rarityEfficiency = { "exotic": 0.65, "mythic": 0.75, "legendary": 0.80, "epic": 0.65, "rare": 0.65, "uncommon": 0.65, "common": 0.70 };

    // Zone Colors Configuration
    const zoneThemes = {
        "Infernal Heart": "var(--z-fire)", "The Magma Furnace": "var(--z-fire)",
        "Volcanic Sands": "var(--z-sand)", "Sunset Beach": "var(--z-sand)", "Windswept Beach": "var(--z-sand)", "Beach": "var(--z-sand)",
        "Frozen Peak": "var(--z-ice)", "Frostbite River": "var(--z-ice)", "Frostbite Waterfall": "var(--z-ice)",
        "Rotwood Swamp": "var(--z-nature)", "Fungal Marsh": "var(--z-nature)", "Overgrown Grotto": "var(--z-nature)", "Deeproot Spring": "var(--z-nature)",
        "The Void": "var(--z-void)", "Abyssal Depths": "var(--z-void)", "The void (if in loot pool)": "var(--z-void)",
        "Azuralite Oasis": "var(--z-water)", "Fortune River": "var(--z-water)", "Fortune River Delta": "var(--z-water)",
        "Crystal Cavern River": "var(--z-cave)", "Rubble Creek Deposits": "var(--z-cave)", "Rubble Creek Sands": "var(--z-cave)"
    };
    const defaultZoneColor = "var(--text-muted)";

    // --- STATE ---
    const state = {
        zoneFilter: '',
        mineralFilter: '',
        rarityFilter: 'all',
        luck: 1,
        capacity: 50,
        sortBy: 'effort',
        sortDesc: true
    };

    // --- TIMERS ---
    function updateTimers() {
        const now = new Date();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();

        // --- Merchant (Arrives XX:45, Lasts 15m -> Ends XX:00) ---
        const merchantEl = document.getElementById('timer-merchant');
        const merchantLabel = merchantEl.parentElement.querySelector('.timer-label');

        if (minutes >= 45) {
            // Active (45-59)
            merchantLabel.textContent = "Merchant (Active!)";
            merchantEl.classList.add('active-text');
            let diff = 60 - minutes;
            let secs = (diff * 60) - seconds;
            merchantEl.textContent = formatTime(secs);
        } else {
            // Inactive (00-44)
            merchantLabel.textContent = "Merchant Arrives in";
            merchantEl.classList.remove('active-text');
            let diff = 45 - minutes;
            let secs = (diff * 60) - seconds;
            merchantEl.textContent = formatTime(secs);
        }

        // --- Infernal Heart (Opens XX:15, Lasts 30m -> Ends XX:45) ---
        const infernalEl = document.getElementById('timer-infernal');
        const infernalLabel = infernalEl.parentElement.querySelector('.timer-label');

        if (minutes >= 15 && minutes < 45) {
            // Active (15-44)
            infernalLabel.textContent = "Infernal Heart (Active!)";
            infernalEl.classList.add('active-text');
            let diff = 45 - minutes;
            let secs = (diff * 60) - seconds;
            infernalEl.textContent = formatTime(secs);
        } else {
            // Inactive (45-59, 00-14)
            infernalLabel.textContent = "Infernal Heart Opens in";
            infernalEl.classList.remove('active-text');

            let diff;
            if (minutes < 15) {
                diff = 15 - minutes;
            } else {
                // minutes >= 45
                diff = (60 - minutes) + 15;
            }
            let secs = (diff * 60) - seconds;
            infernalEl.textContent = formatTime(secs);
        }
    }

    function formatTime(totalSeconds) {
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${m}m ${s.toString().padStart(2, '0')}s`;
    }

    // --- UI ELEMENTS ---
    const ui = {
        luck: document.getElementById('luck'),
        capacity: document.getElementById('capacity'),
        tableBody: document.querySelector('#resultsTable tbody'),
        headers: document.querySelectorAll('th[data-sort]'),
        noResults: document.getElementById('no-results'),

        // Custom Dropdown Elements
        minInput: document.getElementById('mineralInput'),
        minDrop: document.getElementById('mineralDropdown'),

        zoneInput: document.getElementById('zoneInput'),
        zoneDrop: document.getElementById('zoneDropdown'),

        rarityTrigger: document.getElementById('rarityTrigger'),
        rarityDrop: document.getElementById('rarityDropdown')
    };

    // --- INITIALIZATION ---
    function init() {
        buildRarityDropdown();
        buildZoneDropdown();
        buildMineralDropdown();

        setupGlobalListeners();

        updateTimers();
        setInterval(updateTimers, 1000);

        renderTable();
    }

    // --- CUSTOM DROPDOWN LOGIC ---

    function toggleDropdown(menu, show) {
        if (show) menu.classList.add('open');
        else menu.classList.remove('open');
    }

    // 1. RARITY DROPDOWN BUILDER
    function buildRarityDropdown() {
        const options = ['all', 'common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'exotic'];
        ui.rarityDrop.innerHTML = '';

        options.forEach(opt => {
            const div = document.createElement('div');
            div.className = 'dropdown-item';

            const label = opt === 'all' ? 'Todas' : opt.charAt(0).toUpperCase() + opt.slice(1);
            // Use specific color or white for 'all'
            const colorVar = opt === 'all' ? 'var(--text-main)' : `var(--r-${opt})`;

            div.innerHTML = `
                <div class="color-dot" style="background-color: ${colorVar};"></div>
                <div class="item-label" style="color: ${colorVar}; font-weight: 600;">${label}</div>
            `;

            div.addEventListener('click', () => {
                state.rarityFilter = opt;
                ui.rarityTrigger.innerHTML = div.innerHTML; // Copy visual to trigger
                toggleDropdown(ui.rarityDrop, false);
                renderTable();
            });
            ui.rarityDrop.appendChild(div);
        });
    }

    // 2. ZONE DROPDOWN BUILDER
    function buildZoneDropdown() {
        const zones = Object.keys(scrapedDatabase).sort();

        const renderList = (filterText = '') => {
            ui.zoneDrop.innerHTML = '';
            const filtered = zones.filter(z => z.toLowerCase().includes(filterText.toLowerCase()));

            // "All Zones" option
            if (filterText === '') {
                const allDiv = document.createElement('div');
                allDiv.className = 'dropdown-item';
                allDiv.innerHTML = `<div class="item-label">Todas las zonas...</div>`;
                allDiv.addEventListener('click', () => {
                    state.zoneFilter = '';
                    ui.zoneInput.value = '';
                    toggleDropdown(ui.zoneDrop, false);
                    renderTable();
                });
                ui.zoneDrop.appendChild(allDiv);
            }

            if (filtered.length === 0) {
                ui.zoneDrop.innerHTML += `<div class="dropdown-item" style="color:var(--text-dim)">Sin resultados</div>`;
                return;
            }

            filtered.forEach(zone => {
                const div = document.createElement('div');
                div.className = 'dropdown-item';
                const color = zoneThemes[zone] || defaultZoneColor;

                div.innerHTML = `
                    <div class="color-dot" style="background-color: ${color}; box-shadow: 0 0 5px ${color}40;"></div>
                    <div class="item-label">${zone}</div>
                `;
                div.addEventListener('click', () => {
                    state.zoneFilter = zone.toLowerCase();
                    ui.zoneInput.value = zone;
                    toggleDropdown(ui.zoneDrop, false);
                    renderTable();
                });
                ui.zoneDrop.appendChild(div);
            });
        };

        // Input Listeners
        ui.zoneInput.addEventListener('focus', () => { toggleDropdown(ui.zoneDrop, true); renderList(ui.zoneInput.value); });
        ui.zoneInput.addEventListener('input', (e) => { toggleDropdown(ui.zoneDrop, true); renderList(e.target.value); state.zoneFilter = e.target.value.toLowerCase(); renderTable(); });
    }

    // 3. MINERAL DROPDOWN BUILDER
    function buildMineralDropdown() {
        const allMinerals = new Set();
        Object.values(scrapedDatabase).forEach(list => list.forEach(m => allMinerals.add(m)));
        // Convert to array of objects to keep rarity info
        const uniqueMinerals = Array.from(allMinerals).reduce((acc, current) => {
            const x = acc.find(item => item.name === current.name);
            if (!x) return acc.concat([current]);
            else return acc;
        }, []).sort((a, b) => a.name.localeCompare(b.name));

        const renderList = (filterText = '') => {
            ui.minDrop.innerHTML = '';
            const filtered = uniqueMinerals.filter(m => m.name.toLowerCase().includes(filterText.toLowerCase()));

            if (filtered.length === 0) {
                ui.minDrop.innerHTML = `<div class="dropdown-item" style="color:var(--text-dim)">Sin resultados</div>`;
                return;
            }

            filtered.forEach(min => {
                const div = document.createElement('div');
                div.className = 'dropdown-item';
                const rClass = `type-${min.type.toLowerCase()}`;

                div.innerHTML = `
                    <div class="item-label">${min.name}</div>
                    <div class="item-badge ${rClass}">${min.type}</div>
                `;
                div.addEventListener('click', () => {
                    state.mineralFilter = min.name.toLowerCase();
                    ui.minInput.value = min.name;
                    toggleDropdown(ui.minDrop, false);
                    renderTable();
                });
                ui.minDrop.appendChild(div);
            });
        };

        ui.minInput.addEventListener('focus', () => { toggleDropdown(ui.minDrop, true); renderList(ui.minInput.value); });
        ui.minInput.addEventListener('input', (e) => {
            toggleDropdown(ui.minDrop, true);
            renderList(e.target.value);
            state.mineralFilter = e.target.value.toLowerCase();
            renderTable();
        });
    }

    // --- LISTENERS ---
    function setupGlobalListeners() {
        // Rarity Trigger
        ui.rarityTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = ui.rarityDrop.classList.contains('open');
            toggleDropdown(ui.rarityDrop, !isOpen);
        });

        // Stats Inputs
        ui.luck.addEventListener('input', (e) => { state.luck = parseFloat(e.target.value) || 1; renderTable(); });
        ui.capacity.addEventListener('input', (e) => { state.capacity = parseInt(e.target.value) || 1; renderTable(); });

        // Sorting
        ui.headers.forEach(th => {
            th.addEventListener('click', () => {
                const col = th.getAttribute('data-sort');
                if (state.sortBy === col) state.sortDesc = !state.sortDesc;
                else {
                    state.sortBy = col;
                    state.sortDesc = !(col === 'name' || col === 'location');
                }
                updateHeaderVisuals();
                renderTable();
            });
        });

        // Close Dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.control-group')) {
                toggleDropdown(ui.rarityDrop, false);
                toggleDropdown(ui.zoneDrop, false);
                toggleDropdown(ui.minDrop, false);
            }
        });
    }

    function updateHeaderVisuals() {
        ui.headers.forEach(th => {
            th.classList.remove('active-sort');
            th.querySelector('.sort-icon').style.opacity = '0.3';
            if (th.getAttribute('data-sort') === state.sortBy) {
                th.classList.add('active-sort');
                th.querySelector('.sort-icon').style.opacity = '1';
                // Rotate icon if asc? (Optional, keeping simple for now)
            }
        });
    }

    // --- CALCULATION & RENDER ---
    function calculateChance(item) {
        const pBase = 1 / item.oneIn;
        const pFailOnce = 1 - pBase;
        const typeKey = item.type.toLowerCase();
        const efficiency = rarityEfficiency[typeKey] || 1.0;

        const effectiveLuck = state.luck * efficiency;
        const pFoundInSlot = 1 - Math.pow(pFailOnce, effectiveLuck);
        const actualItemsPerPan = Math.sqrt(state.capacity);
        const pFailBatch = Math.pow(1 - pFoundInSlot, actualItemsPerPan);

        return 1 - pFailBatch;
    }

    function formatMoney(val) {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
    }

    function renderTable() {
        ui.tableBody.innerHTML = '';
        let rawData = [];
        Object.entries(scrapedDatabase).forEach(([zoneName, minerals]) => {
            const mineralsWithLoc = minerals.map(m => ({ ...m, location: zoneName }));
            rawData = rawData.concat(mineralsWithLoc);
        });

        let filtered = rawData.filter(item => {
            const matchZone = state.zoneFilter === '' || item.location.toLowerCase().includes(state.zoneFilter);
            const matchMineral = state.mineralFilter === '' || item.name.toLowerCase().includes(state.mineralFilter);
            const matchRarity = state.rarityFilter === 'all' || item.type.toLowerCase() === state.rarityFilter;
            return matchZone && matchMineral && matchRarity;
        });

        if (filtered.length === 0) {
            ui.noResults.style.display = 'block';
            return;
        }
        ui.noResults.style.display = 'none';

        const processed = filtered.map(item => ({
            ...item,
            calcChance: calculateChance(item)
        }));

        processed.sort((a, b) => {
            let valA, valB;
            switch (state.sortBy) {
                case 'rarity': valA = rarityRank[a.type.toLowerCase()] || 0; valB = rarityRank[b.type.toLowerCase()] || 0; break;
                case 'value': valA = a.value; valB = b.value; break;
                case 'oneIn': valA = a.oneIn; valB = b.oneIn; break;
                case 'effort': valA = a.calcChance; valB = b.calcChance; break;
                case 'name': valA = a.name.toLowerCase(); valB = b.name.toLowerCase(); break;
                case 'location': valA = a.location.toLowerCase(); valB = b.location.toLowerCase(); break;
                default: valA = 0; valB = 0;
            }
            if (valA < valB) return state.sortDesc ? 1 : -1;
            if (valA > valB) return state.sortDesc ? -1 : 1;
            return 0;
        });

        const fragment = document.createDocumentFragment();
        processed.forEach((item, index) => {
            const tr = document.createElement('tr');

            // Location Color Logic
            const zoneColor = zoneThemes[item.location] || defaultZoneColor;

            let locationHTML = `<div class="color-dot" style="background-color:${zoneColor};"></div> <span class="location-text" style="color:${index === 0 ? 'var(--text-main)' : 'var(--text-muted)'}">${item.location}</span>`;

            if (index === 0) {
                tr.classList.add('row-best');
                locationHTML = `<span class="best-badge">🏆 TOP</span> ${locationHTML}`;
            }

            const chance = item.calcChance;
            let batchesStr = "", percentStr = "", effortClass = "effort-mid";
            const avgBatches = 1 / chance;

            if (chance >= 0.99) {
                batchesStr = "1"; percentStr = "Garantizado"; effortClass = "effort-easy";
            } else {
                if (avgBatches > 10000) effortClass = "effort-insane";
                else if (avgBatches > 1000) effortClass = "effort-hard";
                else if (avgBatches < 50) effortClass = "effort-easy";
                batchesStr = Math.ceil(avgBatches).toLocaleString();
                percentStr = (chance * 100).toFixed(4) + "%";
            }

            tr.innerHTML = `
                <td><div class="location-text">${locationHTML}</div></td>
                <td><a href="${item.wikiUrl}" target="_blank" class="mineral-link">${item.name}</a></td>
                <td><span class="badge type-${item.type.toLowerCase()}">${item.type}</span></td>
                <td style="text-align: right;"><span class="mono-text">${formatMoney(item.value)}</span></td>
                <td style="text-align: right;"><span class="mono-text">1 / ${item.oneIn.toLocaleString()}</span></td>
                <td style="text-align: right;">
                    <div class="prob-cell">
                        <span class="batches-val ${effortClass}">${batchesStr}</span>
                        <span class="batches-sub">Bateas</span>
                        <span class="percent-val">${percentStr}</span>
                    </div>
                </td>
            `;
            fragment.appendChild(tr);
        });
        ui.tableBody.appendChild(fragment);
    }

    init();

    // --- MUSEUM PLANNER LOGIC ---

    // State for Museum
    let museumState = JSON.parse(localStorage.getItem('museumState')) || {};
    // Structure: { "rarity_slotIndex": { ore: "OreName", modifier: "ModName", unlocked: boolean } }

    const museumUI = {
        tabs: document.querySelectorAll('.nav-tab'),
        views: {
            calculator: {
                controls: document.getElementById('view-calculator-controls'),
                content: document.getElementById('view-calculator-content')
            },
            museum: {
                controls: document.getElementById('view-museum-controls'),
                content: document.getElementById('view-museum-content')
            }
        },
        museumGrid: document.getElementById('museum-grid'),
        statsGrid: document.getElementById('museum-stats-grid')
    };

    // Tab Switching
    museumUI.tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-tab');

            // Update Tabs
            museumUI.tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update Views
            if (target === 'calculator') {
                museumUI.views.calculator.controls.style.display = 'grid';
                museumUI.views.calculator.content.style.display = 'block';
                museumUI.views.museum.controls.style.display = 'none';
                museumUI.views.museum.content.style.display = 'none';
            } else {
                museumUI.views.calculator.controls.style.display = 'none';
                museumUI.views.calculator.content.style.display = 'none';
                museumUI.views.museum.controls.style.display = 'block';
                museumUI.views.museum.content.style.display = 'block';
                renderMuseum();
            }
        });
    });

    function saveMuseumState() {
        localStorage.setItem('museumState', JSON.stringify(museumState));
        calculateMuseumStats();
    }

    function renderMuseum() {
        if (museumUI.museumGrid.innerHTML !== '') return; // Already rendered

        const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'exotic'];

        rarities.forEach(rarity => {
            const config = museumData.config[rarity];
            const row = document.createElement('div');
            row.className = 'rarity-row';

            // Header
            const header = document.createElement('div');
            header.className = 'rarity-header';
            header.innerHTML = `
                <div class="rarity-title" style="color: var(--r-${rarity})">
                    <div class="color-dot" style="background-color: var(--r-${rarity})"></div>
                    ${rarity}
                </div>
                <div class="rarity-stats">
                    Free: ${config.free} | Locked: ${config.locked}
                </div>
            `;
            row.appendChild(header);

            // Slots Container
            const slotsContainer = document.createElement('div');
            slotsContainer.className = 'slots-container';

            // Free Slots
            for (let i = 0; i < config.free; i++) {
                slotsContainer.appendChild(createSlot(rarity, i, false));
            }

            // Locked Slots
            for (let i = 0; i < config.locked; i++) {
                slotsContainer.appendChild(createSlot(rarity, config.free + i, true));
            }

            row.appendChild(slotsContainer);
            museumUI.museumGrid.appendChild(row);
        });

        calculateMuseumStats();
    }

    function createSlot(rarity, index, isLockedType) {
        const slotId = `${rarity}_${index}`;
        const slotState = museumState[slotId] || {};
        const isUnlocked = !isLockedType || slotState.unlocked;

        const slot = document.createElement('div');
        slot.className = `museum-slot ${isUnlocked ? '' : 'locked'} ${slotState.ore ? 'filled' : ''}`;
        slot.dataset.id = slotId;
        slot.dataset.rarity = rarity;

        updateSlotContent(slot, slotState, isUnlocked, isLockedType);

        slot.addEventListener('click', (e) => {
            if (e.target.closest('.remove-btn')) return; // Handled by remove btn

            if (!isUnlocked) {
                // Unlock logic
                museumState[slotId] = { ...museumState[slotId], unlocked: true };
                saveMuseumState();
                // Re-render slot
                slot.className = `museum-slot ${slotState.ore ? 'filled' : ''}`; // Remove locked class
                updateSlotContent(slot, museumState[slotId], true, isLockedType);
                return;
            }

            // Open Selection Modal
            openSelectionModal(rarity, slotId);
        });

        return slot;
    }

    function updateSlotContent(slot, state, isUnlocked, isLockedType) {
        slot.innerHTML = '';

        if (!isUnlocked) {
            const config = museumData.config[slot.dataset.rarity];
            // Determine cost (Money or Shards)
            // Logic: Mythic locked slots cost Money+Shards?
            // "Mythic -> only 2 displays (money + shards, no free)"
            // Actually the config object I made has priceMoney and priceShards.
            // I'll just show a lock icon.
            slot.innerHTML = `
                <div class="slot-content">
                    <div class="slot-lock-icon">🔒</div>
                    <div class="slot-label">Locked</div>
                    <div class="slot-cost">Click to Unlock</div>
                </div>
            `;
        } else if (state.ore) {
            const oreData = museumData.ores[state.ore];
            const modData = state.modifier && state.modifier !== 'None' ? museumData.modifiers[state.modifier] : null;

            // Format stats
            let statsHtml = '';
            for (const [stat, val] of Object.entries(oreData.stats)) {
                statsHtml += `<div>${stat}: +${val}x</div>`;
            }

            slot.innerHTML = `
                <div class="remove-btn">×</div>
                <div class="slot-content">
                    <div class="ore-name">${state.ore}</div>
                    <div class="ore-bonus">${statsHtml}</div>
                    ${state.modifier && state.modifier !== 'None' ? `<div class="modifier-badge">${state.modifier}</div>` : ''}
                </div>
            `;

            slot.querySelector('.remove-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                delete museumState[slot.dataset.id].ore;
                delete museumState[slot.dataset.id].modifier;
                saveMuseumState();
                slot.classList.remove('filled');
                updateSlotContent(slot, museumState[slot.dataset.id], true, isLockedType);
            });
        } else {
            slot.innerHTML = `
                <div class="slot-content">
                    <div class="slot-add-icon">+</div>
                    <div class="slot-label">Add Mineral</div>
                </div>
            `;
        }
    }

    // --- MODAL LOGIC ---
    let currentModal = null;

    function openSelectionModal(rarity, slotId) {
        // Close existing
        if (currentModal) currentModal.remove();

        const modal = document.createElement('div');
        modal.className = 'selection-modal';

        const content = document.createElement('div');
        content.className = 'modal-content';

        const header = document.createElement('div');
        header.className = 'modal-header';
        header.innerHTML = `
            <div class="modal-title">Select Mineral</div>
            <button class="close-modal">×</button>
        `;

        const body = document.createElement('div');
        body.className = 'modal-body';

        // 1. Ores List
        const ores = Object.keys(museumData.ores).filter(ore => {
            // We need to match rarity. The museumData.ores doesn't store rarity directly in the object, 
            // but I can infer it or I should have stored it.
            // Wait, I didn't store rarity in museumData.ores.
            // However, I can check `scrapedDatabase` (global) to find the rarity of the ore.
            // Or I can just list ALL ores and let user search? 
            // The request says "Each display accepts minerals of a specific rarity".
            // So I MUST filter by rarity.
            // I will use `scrapedDatabase` to find ores of this rarity.
            // `scrapedDatabase` is { "Zone": [ {name, type, ...} ] }
            return getRarityForOre(ore).toLowerCase() === rarity;
        }).sort();

        if (ores.length === 0) {
            body.innerHTML = '<div style="color:var(--text-muted)">No ores found for this rarity.</div>';
        } else {
            // Ore Selection
            const oreGroup = document.createElement('div');
            oreGroup.innerHTML = `<div class="selection-group-title">Mineral</div>`;
            body.appendChild(oreGroup);

            ores.forEach(oreName => {
                const item = document.createElement('div');
                item.className = 'selection-item';
                const stats = museumData.ores[oreName].stats;
                const statsStr = Object.entries(stats).map(([k, v]) => `${k} +${v}x`).join(', ');

                item.innerHTML = `
                    <span>${oreName}</span>
                    <span style="font-size:0.75rem; color:var(--accent)">${statsStr}</span>
                `;
                item.addEventListener('click', () => {
                    // Select Ore -> Show Modifiers
                    showModifierSelection(modal, body, slotId, oreName);
                });
                body.appendChild(item);
            });
        }

        content.appendChild(header);
        content.appendChild(body);
        modal.appendChild(content);
        document.body.appendChild(modal);
        currentModal = modal;

        header.querySelector('.close-modal').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    function getRarityForOre(oreName) {
        // Helper to find rarity from scrapedDatabase
        for (const zone in scrapedDatabase) {
            const found = scrapedDatabase[zone].find(m => m.name === oreName);
            if (found) return found.type;
        }
        return 'Common'; // Fallback
    }

    function showModifierSelection(modal, body, slotId, selectedOre) {
        body.innerHTML = '';

        const title = modal.querySelector('.modal-title');
        title.textContent = `Select Modifier for ${selectedOre}`;

        const modifiers = Object.keys(museumData.modifiers);

        modifiers.forEach(modName => {
            const item = document.createElement('div');
            item.className = 'selection-item';
            const stats = museumData.modifiers[modName].stats;
            const statsStr = Object.keys(stats).length > 0
                ? Object.entries(stats).map(([k, v]) => `${k}`).join(', ') // Just showing stat names as values are placeholders
                : 'No Bonus';

            item.innerHTML = `
                <span>${modName}</span>
                <span style="font-size:0.75rem; color:var(--text-muted)">${statsStr}</span>
            `;
            item.addEventListener('click', () => {
                // Save Selection
                museumState[slotId] = {
                    ...museumState[slotId],
                    ore: selectedOre,
                    modifier: modName
                };
                saveMuseumState();

                // Update UI
                const slot = document.querySelector(`.museum-slot[data-id="${slotId}"]`);
                slot.classList.add('filled');
                updateSlotContent(slot, museumState[slotId], true, false); // Assuming unlocked if we are selecting

                modal.remove();
            });
            body.appendChild(item);
        });
    }

    function calculateMuseumStats() {
        const totalStats = {};

        Object.values(museumState).forEach(slot => {
            if (slot.ore) {
                // Ore Stats
                const oreStats = museumData.ores[slot.ore]?.stats || {};
                for (const [stat, val] of Object.entries(oreStats)) {
                    totalStats[stat] = (totalStats[stat] || 0) + val;
                }

                // Modifier Stats
                if (slot.modifier && slot.modifier !== 'None') {
                    const modStats = museumData.modifiers[slot.modifier]?.stats || {};
                    for (const [stat, val] of Object.entries(modStats)) {
                        totalStats[stat] = (totalStats[stat] || 0) + val;
                    }
                }
            }
        });

        // Render Stats
        museumUI.statsGrid.innerHTML = '';
        const statKeys = Object.keys(totalStats).sort();

        if (statKeys.length === 0) {
            museumUI.statsGrid.innerHTML = '<div class="stat-item empty">No bonuses active</div>';
            return;
        }

        statKeys.forEach(stat => {
            const val = totalStats[stat];
            const item = document.createElement('div');
            item.className = 'stat-item';
            item.innerHTML = `
                <span class="stat-label">${stat}</span>
                <span class="stat-value">+${val.toFixed(2)}x</span>
            `;
            museumUI.statsGrid.appendChild(item);
        });
    }

});
