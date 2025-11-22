document.addEventListener('DOMContentLoaded', () => {
    // Check Database existence with retry
    const checkDataInterval = setInterval(() => {
        if (typeof scrapedDatabase !== 'undefined' && typeof museumData !== 'undefined' && typeof equipmentData !== 'undefined') {
            clearInterval(checkDataInterval);
            document.getElementById('error-overlay').style.display = 'none';
            init();
        } else {
            // Optional: Show loading state if needed, but error overlay is fine for now
            // console.log("Waiting for data...");
        }
    }, 100);

    // Timeout to show error if data never loads (e.g. 5 seconds)
    setTimeout(() => {
        if (typeof scrapedDatabase === 'undefined' || typeof museumData === 'undefined' || typeof equipmentData === 'undefined') {
            document.getElementById('error-overlay').style.display = 'flex';
            clearInterval(checkDataInterval);
        }
    }, 5000);

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

        // Auto-load museum slots on init
        renderMuseum();
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
            const colorVar = opt === 'all' ? 'var(--text-main)' : `var(--r-${opt})`;

            div.innerHTML = `
                <div class="color-dot" style="background-color: ${colorVar};"></div>
                <div class="item-label" style="color: ${colorVar}; font-weight: 600;">${label}</div>
            `;

            div.addEventListener('click', () => {
                state.rarityFilter = opt;
                ui.rarityTrigger.innerHTML = div.innerHTML;
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

        ui.zoneInput.addEventListener('focus', () => { toggleDropdown(ui.zoneDrop, true); renderList(ui.zoneInput.value); });
        ui.zoneInput.addEventListener('input', (e) => { toggleDropdown(ui.zoneDrop, true); renderList(e.target.value); state.zoneFilter = e.target.value.toLowerCase(); renderTable(); });
    }

    // 3. MINERAL DROPDOWN BUILDER
    function buildMineralDropdown() {
        const allMinerals = new Set();
        Object.values(scrapedDatabase).forEach(list => list.forEach(m => allMinerals.add(m)));
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
        ui.rarityTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = ui.rarityDrop.classList.contains('open');
            toggleDropdown(ui.rarityDrop, !isOpen);
        });

        ui.luck.addEventListener('input', (e) => { state.luck = parseFloat(e.target.value) || 1; renderTable(); });
        ui.capacity.addEventListener('input', (e) => { state.capacity = parseInt(e.target.value) || 1; renderTable(); });

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

    // init(); // Called in data check interval

    // --- MUSEUM PLANNER LOGIC ---

    let currentPlanId = 1;
    // Structure: { 1: { name: "Plan 1", slots: {} }, ... }
    let museumPlans = JSON.parse(localStorage.getItem('museumPlans')) || {
        1: { name: "Plan 1", slots: {} },
        2: { name: "Plan 2", slots: {} },
        3: { name: "Plan 3", slots: {} }
    };

    // Migration Logic (Handle old structure where plans were just slots objects)
    if (!museumPlans[1].slots && !museumPlans[1].name) {
        // It's the old structure { 1: {}, 2: {}, 3: {} }
        const oldPlans = { ...museumPlans };
        museumPlans = {
            1: { name: "Plan 1", slots: oldPlans[1] || {} },
            2: { name: "Plan 2", slots: oldPlans[2] || {} },
            3: { name: "Plan 3", slots: oldPlans[3] || {} }
        };
        localStorage.setItem('museumPlans', JSON.stringify(museumPlans));
    }

    let museumState = museumPlans[currentPlanId].slots;

    const museumUI = {
        tabs: document.querySelectorAll('.nav-tab'),
        planBtns: document.querySelectorAll('.plan-btn'),
        presetsBtn: document.getElementById('presets-btn'),
        renameBtn: document.getElementById('rename-plan-btn'),
        clearBtn: document.getElementById('clear-plan-btn'),
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

    // Rename Logic
    museumUI.renameBtn.addEventListener('click', () => {
        openRenameModal();
    });

    function openRenameModal() {
        if (currentModal) currentModal.remove();

        const modal = document.createElement('div');
        modal.className = 'selection-modal';

        const content = document.createElement('div');
        content.className = 'modal-content';

        const header = document.createElement('div');
        header.className = 'modal-header';
        header.innerHTML = `
            <div class="modal-title">Rename Plan</div>
            <button class="close-modal">×</button>
        `;

        const body = document.createElement('div');
        body.className = 'modal-body';

        const currentName = museumPlans[currentPlanId].name;
        body.innerHTML = `
            <div style="margin-bottom: 1rem;">
                <label style="display: block; margin-bottom: 0.5rem; color: var(--text-main);">Plan Name:</label>
                <input type="text" id="rename-input" value="${currentName}" 
                    style="width: 100%; padding: 0.5rem; background: var(--bg-card); color: var(--text-main); 
                    border: 1px solid var(--border); border-radius: 4px; font-size: 1rem;">
            </div>
            <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                <button class="cancel-btn" style="padding: 0.5rem 1rem; background: var(--bg-card); color: var(--text-main); 
                    border: 1px solid var(--border); border-radius: 4px; cursor: pointer;">Cancel</button>
                <button class="confirm-btn" style="padding: 0.5rem 1rem; background: var(--z-nature); color: white; 
                    border: none; border-radius: 4px; cursor: pointer;">Rename</button>
            </div>
        `;

        content.appendChild(header);
        content.appendChild(body);
        modal.appendChild(content);
        document.body.appendChild(modal);
        currentModal = modal;

        const input = body.querySelector('#rename-input');
        const confirmBtn = body.querySelector('.confirm-btn');
        const cancelBtn = body.querySelector('.cancel-btn');

        input.focus();
        input.select();

        const doRename = () => {
            const newName = input.value.trim();
            if (newName && newName !== "") {
                museumPlans[currentPlanId].name = newName;
                updatePlanButtons();
                saveMuseumState();
                modal.remove();
            }
        };

        confirmBtn.addEventListener('click', doRename);
        cancelBtn.addEventListener('click', () => modal.remove());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') doRename();
        });

        header.querySelector('.close-modal').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    // Clear Logic
    museumUI.clearBtn.addEventListener('click', () => {
        openClearModal();
    });

    function openClearModal() {
        if (currentModal) currentModal.remove();

        const modal = document.createElement('div');
        modal.className = 'selection-modal';

        const content = document.createElement('div');
        content.className = 'modal-content';

        const header = document.createElement('div');
        header.className = 'modal-header';
        header.innerHTML = `
            <div class="modal-title">Clear Plan</div>
            <button class="close-modal">×</button>
        `;

        const body = document.createElement('div');
        body.className = 'modal-body';
        body.innerHTML = `
            <div style="margin-bottom: 1.5rem; color: var(--text-main);">
                Are you sure you want to clear all minerals from "${museumPlans[currentPlanId].name}"?
                <div style="margin-top: 0.5rem; color: var(--text-muted); font-size: 0.9rem;">This action cannot be undone.</div>
            </div>
            <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                <button class="cancel-btn" style="padding: 0.5rem 1rem; background: var(--bg-card); color: var(--text-main); 
                    border: 1px solid var(--border); border-radius: 4px; cursor: pointer;">Cancel</button>
                <button class="confirm-btn" style="padding: 0.5rem 1rem; background: #dc3545; color: white; 
                    border: none; border-radius: 4px; cursor: pointer;">Clear Plan</button>
            </div>
        `;

        content.appendChild(header);
        content.appendChild(body);
        modal.appendChild(content);
        document.body.appendChild(modal);
        currentModal = modal;

        const confirmBtn = body.querySelector('.confirm-btn');
        const cancelBtn = body.querySelector('.cancel-btn');

        confirmBtn.addEventListener('click', () => {
            museumPlans[currentPlanId].slots = {};
            museumState = museumPlans[currentPlanId].slots;
            saveMuseumState();
            renderMuseum();
            modal.remove();
        });

        cancelBtn.addEventListener('click', () => modal.remove());
        header.querySelector('.close-modal').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    // Presets Logic

    // Presets Logic
    museumUI.presetsBtn.addEventListener('click', () => {
        openPresetsModal();
    });

    function openPresetsModal() {
        if (currentModal) currentModal.remove();

        const modal = document.createElement('div');
        modal.className = 'selection-modal';

        const content = document.createElement('div');
        content.className = 'modal-content';

        const header = document.createElement('div');
        header.className = 'modal-header';
        header.innerHTML = `
            <div class="modal-title">Load Preset</div>
            <button class="close-modal">×</button>
        `;

        const body = document.createElement('div');
        body.className = 'modal-body';
        body.innerHTML = `<div style="color:var(--text-muted); margin-bottom:1rem; font-size:0.9rem;">Warning: Loading a preset will overwrite the current plan!</div>`;

        const presets = museumData.presets || {};

        Object.keys(presets).forEach(presetName => {
            const item = document.createElement('div');
            item.className = 'selection-item';
            item.innerHTML = `<span>${presetName}</span>`;
            item.addEventListener('click', () => {
                if (confirm(`Overwrite current plan with "${presetName}"?`)) {
                    applyPreset(presets[presetName]);
                    modal.remove();
                }
            });
            body.appendChild(item);
        });

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

    function applyPreset(presetData) {
        // presetData is { "common_0": { ... }, ... }
        // We need to merge this into museumState, marking slots as unlocked if they are in the preset

        // Clear current slots but keep unlocked status if we want? 
        // Actually, let's just overwrite the slots that are in the preset.
        // And ensure they are unlocked.

        Object.entries(presetData).forEach(([slotId, data]) => {
            museumState[slotId] = {
                ...data,
                unlocked: true
            };
        });

        saveMuseumState();
        museumUI.museumGrid.innerHTML = '';
        renderMuseum();
    }

    // Initialize UI with correct names
    function updatePlanButtons() {
        museumUI.planBtns.forEach(btn => {
            const pid = btn.dataset.plan;
            btn.textContent = museumPlans[pid].name;
            if (parseInt(pid) === currentPlanId) btn.classList.add('active');
            else btn.classList.remove('active');
        });
    }
    updatePlanButtons();

    // Plan Switching & Renaming Logic
    museumUI.planBtns.forEach(btn => {
        // Click to switch
        btn.addEventListener('click', () => {
            const planId = parseInt(btn.dataset.plan);
            if (planId === currentPlanId) return;

            currentPlanId = planId;
            museumState = museumPlans[currentPlanId].slots;

            updatePlanButtons();

            // Clear grid to force re-render
            museumUI.museumGrid.innerHTML = '';
            renderMuseum();
        });

        // Double click to rename
        btn.addEventListener('dblclick', () => {
            const planId = parseInt(btn.dataset.plan);
            const newName = prompt("Enter new name for this plan:", museumPlans[planId].name);
            if (newName && newName.trim() !== "") {
                museumPlans[planId].name = newName.trim();
                saveMuseumState(); // Saves everything including names
                updatePlanButtons();
            }
        });
    });

    museumUI.tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-tab');

            museumUI.tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            if (target === 'calculator') {
                museumUI.views.calculator.controls.style.display = 'block';
                museumUI.views.calculator.content.style.display = 'block';
                museumUI.views.museum.controls.style.display = 'none';
                museumUI.views.museum.content.style.display = 'none';
                equipmentUI.views.equipment.controls.style.display = 'none';
                equipmentUI.views.equipment.content.style.display = 'none';
            } else if (target === 'museum') {
                museumUI.views.calculator.controls.style.display = 'none';
                museumUI.views.calculator.content.style.display = 'none';
                museumUI.views.museum.controls.style.display = 'block';
                museumUI.views.museum.content.style.display = 'grid';
                equipmentUI.views.equipment.controls.style.display = 'none';
                equipmentUI.views.equipment.content.style.display = 'none';
                // Force render to ensure it appears
                renderMuseum();
            } else if (target === 'equipment') {
                museumUI.views.calculator.controls.style.display = 'none';
                museumUI.views.calculator.content.style.display = 'none';
                museumUI.views.museum.controls.style.display = 'none';
                museumUI.views.museum.content.style.display = 'none';
                equipmentUI.views.equipment.controls.style.display = 'block';
                equipmentUI.views.equipment.content.style.display = 'grid';
                // Render equipment planner
                renderEquipment();
            }
        });
    });

    function saveMuseumState() {
        museumPlans[currentPlanId].slots = museumState;
        localStorage.setItem('museumPlans', JSON.stringify(museumPlans));
        calculateMuseumStats();
    }

    function renderMuseum() {
        // Basic check to ensure data is loaded
        if (typeof museumData === 'undefined') {
            console.error("Museum Data not loaded!");
            return;
        }

        // Clear and re-render to ensure fresh state
        museumUI.museumGrid.innerHTML = '';

        const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'exotic'];

        rarities.forEach(rarity => {
            const config = museumData.config[rarity];
            const row = document.createElement('div');
            row.className = 'rarity-row';

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

            const slotsContainer = document.createElement('div');
            slotsContainer.className = 'slots-container';

            for (let i = 0; i < config.free; i++) {
                slotsContainer.appendChild(createSlot(rarity, i, false));
            }

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
            if (e.target.closest('.remove-btn')) return;

            if (!isUnlocked) {
                museumState[slotId] = { ...museumState[slotId], unlocked: true };
                saveMuseumState();
                slot.className = `museum-slot ${slotState.ore ? 'filled' : ''}`;
                updateSlotContent(slot, museumState[slotId], true, isLockedType);
                return;
            }

            openSelectionModal(rarity, slotId);
        });

        return slot;
    }

    function updateSlotContent(slot, state, isUnlocked, isLockedType) {
        slot.innerHTML = '';

        if (!isUnlocked) {
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

            // Calculate Efficiency (using square root)
            const userWeight = parseFloat(state.weight) || 0;
            const targetWeight = oreData.minKG || 999;
            let efficiency = Math.sqrt(userWeight / targetWeight);
            if (efficiency > 1) efficiency = 1;

            const effPercent = Math.floor(efficiency * 100);
            const progressColor = efficiency >= 1 ? 'var(--z-nature)' : 'var(--z-sand)';

            // Format ore stats
            let oreStatsHtml = '';
            for (const [stat, val] of Object.entries(oreData.stats)) {
                const finalVal = val * efficiency;
                oreStatsHtml += `<div>${stat}: +${finalVal.toFixed(3)}x</div>`;
            }

            // Format modifier stats (in different color)
            let modStatsHtml = '';
            if (modData && modData.stats) {
                for (const [stat, val] of Object.entries(modData.stats)) {
                    modStatsHtml += `<div style="color: var(--z-amethyst);">${stat}: +${val.toFixed(3)}x</div>`;
                }
            }

            slot.innerHTML = `
                <div class="remove-btn">×</div>
                <div class="slot-content" style="justify-content:flex-start; padding-top:1rem;">
                    <div class="ore-name">${state.ore}</div>
                    <div class="ore-bonus">${oreStatsHtml}</div>
                    ${modStatsHtml ? `<div class="ore-bonus" style="margin-top:4px;">${modStatsHtml}</div>` : ''}
                    
                    <div style="width:100%; margin-top:8px; font-size:0.7rem; color:var(--text-muted);">
                        <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
                            <span>${userWeight}kg / ${targetWeight}kg</span>
                            <span style="color:${progressColor}">${effPercent}%</span>
                        </div>
                        <div style="background:#333; height:4px; width:100%; border-radius:2px; overflow:hidden;">
                            <div style="background:${progressColor}; width:${effPercent}%; height:100%;"></div>
                        </div>
                    </div>

                    ${state.modifier && state.modifier !== 'None' ? `<div class="modifier-badge">${state.modifier}</div>` : ''}
                </div>
            `;

            slot.querySelector('.remove-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                delete museumState[slot.dataset.id].ore;
                delete museumState[slot.dataset.id].modifier;
                delete museumState[slot.dataset.id].weight;
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

        const ores = Object.keys(museumData.ores).filter(ore => {
            return getRarityForOre(ore).toLowerCase() === rarity;
        }).sort();

        if (ores.length === 0) {
            body.innerHTML = '<div style="color:var(--text-muted)">No ores found for this rarity.</div>';
        } else {
            const oreGroup = document.createElement('div');
            oreGroup.innerHTML = `<div class="selection-group-title">Mineral</div>`;
            body.appendChild(oreGroup);

            ores.forEach(oreName => {
                const item = document.createElement('div');
                item.className = 'selection-item';
                const stats = museumData.ores[oreName].stats;
                const minKG = museumData.ores[oreName].minKG || '?';
                const statsStr = Object.entries(stats).map(([k, v]) => `${k} +${v}x`).join(', ');

                item.innerHTML = `
                    <span>${oreName} <span style="font-size:0.7rem; color:var(--text-dim)">(${minKG}kg)</span></span>
                    <span style="font-size:0.75rem; color:var(--accent)">${statsStr}</span>
                `;
                item.addEventListener('click', () => {
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
        for (const zone in scrapedDatabase) {
            const found = scrapedDatabase[zone].find(m => m.name === oreName);
            if (found) return found.type;
        }
        return 'Common';
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
                ? Object.entries(stats).map(([k, v]) => `${k}`).join(', ')
                : 'No Bonus';

            item.innerHTML = `
                <span>${modName}</span>
                <span style="font-size:0.75rem; color:var(--text-muted)">${statsStr}</span>
            `;
            item.addEventListener('click', () => {
                showWeightInput(modal, body, slotId, selectedOre, modName);
            });
            body.appendChild(item);
        });
    }

    function showWeightInput(modal, body, slotId, selectedOre, selectedMod) {
        body.innerHTML = '';
        const title = modal.querySelector('.modal-title');
        title.textContent = `Enter Weight (KG)`;

        const oreInfo = museumData.ores[selectedOre];
        const targetWeight = oreInfo.minKG || 999;

        const wrapper = document.createElement('div');
        wrapper.style.padding = "1rem";

        wrapper.innerHTML = `
            <div style="color:var(--text-muted); margin-bottom:1rem;">
                Target Weight for Max Bonus: <strong style="color:var(--text-main)">${targetWeight} kg</strong>
            </div>
            <input type="number" id="weightInput" class="custom-input" placeholder="Enter weight..." step="0.1" style="margin-bottom:1rem;">
            <button class="bmc-button-small" style="width:100%; justify-content:center; height:40px;">Save to Museum</button>
        `;

        const btn = wrapper.querySelector('button');
        const input = wrapper.querySelector('input');

        btn.addEventListener('click', () => {
            const w = parseFloat(input.value) || 0;

            museumState[slotId] = {
                ...museumState[slotId],
                ore: selectedOre,
                modifier: selectedMod,
                weight: w
            };
            saveMuseumState();

            const slot = document.querySelector(`.museum-slot[data-id="${slotId}"]`);
            slot.classList.add('filled');
            updateSlotContent(slot, museumState[slotId], true, false);

            modal.remove();
        });

        body.appendChild(wrapper);
        input.focus();
    }

    function calculateMuseumStats() {
        const totalStats = {};

        Object.values(museumState).forEach(slot => {
            if (slot.ore) {
                // Ore Stats with Weight Calculation
                const oreInfo = museumData.ores[slot.ore];
                const stats = oreInfo?.stats || {};
                const minKG = oreInfo?.minKG || 999;
                const userWeight = slot.weight || 0;

                // Square root efficiency curve (gives better bonuses for smaller ores)
                let efficiency = Math.sqrt(userWeight / minKG);
                if (efficiency > 1) efficiency = 1;
                if (efficiency < 0) efficiency = 0;

                for (const [stat, val] of Object.entries(stats)) {
                    const effectiveVal = val * efficiency;
                    totalStats[stat] = (totalStats[stat] || 0) + effectiveVal;
                }

                // Modifier Stats (Flat addition for now, as per original request)
                if (slot.modifier && slot.modifier !== 'None') {
                    const modStats = museumData.modifiers[slot.modifier]?.stats || {};
                    for (const [stat, val] of Object.entries(modStats)) {
                        totalStats[stat] = (totalStats[stat] || 0) + val;
                    }
                }
            }
        });

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
                <span class="stat-value">+${val.toFixed(4)}x</span>
            `;
            museumUI.statsGrid.appendChild(item);
        });
    }

    // --- EQUIPMENT PLANNER LOGIC ---

    let currentEquipLoadout = 1;
    // Structure: { 1: { name: "Loadout 1", equipment: { rings: [null...], necklace: null, charm: null } }, ... }
    let equipmentLoadouts = JSON.parse(localStorage.getItem('equipmentLoadouts')) || {
        1: { name: "Loadout 1", equipment: { rings: Array(8).fill(null), necklace: null, charm: null } },
        2: { name: "Loadout 2", equipment: { rings: Array(8).fill(null), necklace: null, charm: null } },
        3: { name: "Loadout 3", equipment: { rings: Array(8).fill(null), necklace: null, charm: null } }
    };

    // Migration for old structure if exists
    if (equipmentLoadouts[1].equipment.ring !== undefined) {
        Object.values(equipmentLoadouts).forEach(loadout => {
            if (loadout.equipment.ring !== undefined) {
                const oldRing = loadout.equipment.ring;
                loadout.equipment = {
                    rings: Array(8).fill(null),
                    necklace: loadout.equipment.necklace,
                    charm: loadout.equipment.charm
                };
                if (oldRing) loadout.equipment.rings[0] = oldRing;
            }
        });
        localStorage.setItem('equipmentLoadouts', JSON.stringify(equipmentLoadouts));
    }

    let currentEquipmentState = equipmentLoadouts[currentEquipLoadout].equipment;

    const equipmentUI = {
        tabs: document.querySelectorAll('.nav-tab'),
        loadoutBtns: document.querySelectorAll('.equip-plan-btn'),
        renameBtn: document.getElementById('rename-equip-btn'),
        clearBtn: document.getElementById('clear-equip-btn'),
        views: {
            equipment: {
                controls: document.getElementById('view-equipment-controls'),
                content: document.getElementById('view-equipment-content')
            }
        },
        equipmentGrid: document.getElementById('equipment-grid'),
        statsGrid: document.getElementById('equipment-stats-grid')
    };

    // Rename Loadout Logic
    equipmentUI.renameBtn.addEventListener('click', () => {
        openRenameEquipModal();
    });

    function openRenameEquipModal() {
        if (currentModal) currentModal.remove();

        const modal = document.createElement('div');
        modal.className = 'selection-modal';

        const content = document.createElement('div');
        content.className = 'modal-content';

        const header = document.createElement('div');
        header.className = 'modal-header';
        header.innerHTML = `
            <div class="modal-title">Rename Loadout</div>
            <button class="close-modal">×</button>
        `;

        const body = document.createElement('div');
        body.className = 'modal-body';

        const currentName = equipmentLoadouts[currentEquipLoadout].name;
        body.innerHTML = `
            <div style="margin-bottom: 1rem;">
                <label style="display: block; margin-bottom: 0.5rem; color: var(--text-main);">Loadout Name:</label>
                <input type="text" id="rename-equip-input" value="${currentName}" 
                    style="width: 100%; padding: 0.5rem; background: var(--bg-card); color: var(--text-main); 
                    border: 1px solid var(--border); border-radius: 4px; font-size: 1rem;">
            </div>
            <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                <button class="cancel-btn" style="padding: 0.5rem 1rem; background: var(--bg-card); color: var(--text-main); 
                    border: 1px solid var(--border); border-radius: 4px; cursor: pointer;">Cancel</button>
                <button class="confirm-btn" style="padding: 0.5rem 1rem; background: var(--z-nature); color: white; 
                    border: none; border-radius: 4px; cursor: pointer;">Rename</button>
            </div>
        `;

        content.appendChild(header);
        content.appendChild(body);
        modal.appendChild(content);
        document.body.appendChild(modal);
        currentModal = modal;

        const input = body.querySelector('#rename-equip-input');
        const confirmBtn = body.querySelector('.confirm-btn');
        const cancelBtn = body.querySelector('.cancel-btn');

        input.focus();
        input.select();

        const doRename = () => {
            const newName = input.value.trim();
            if (newName && newName !== "") {
                equipmentLoadouts[currentEquipLoadout].name = newName;
                updateLoadoutButtons();
                saveEquipmentState();
                modal.remove();
            }
        };

        confirmBtn.addEventListener('click', doRename);
        cancelBtn.addEventListener('click', () => modal.remove());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') doRename();
        });

        header.querySelector('.close-modal').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    // Clear Loadout Logic
    equipmentUI.clearBtn.addEventListener('click', () => {
        openClearEquipModal();
    });

    function openClearEquipModal() {
        if (currentModal) currentModal.remove();

        const modal = document.createElement('div');
        modal.className = 'selection-modal';

        const content = document.createElement('div');
        content.className = 'modal-content';

        const header = document.createElement('div');
        header.className = 'modal-header';
        header.innerHTML = `
            <div class="modal-title">Clear Loadout</div>
            <button class="close-modal">×</button>
        `;

        const body = document.createElement('div');
        body.className = 'modal-body';
        body.innerHTML = `
            <div style="margin-bottom: 1.5rem; color: var(--text-main);">
                Are you sure you want to clear all equipment from "${equipmentLoadouts[currentEquipLoadout].name}"?
                <div style="margin-top: 0.5rem; color: var(--text-muted); font-size: 0.9rem;">This action cannot be undone.</div>
            </div>
            <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                <button class="cancel-btn" style="padding: 0.5rem 1rem; background: var(--bg-card); color: var(--text-main); 
                    border: 1px solid var(--border); border-radius: 4px; cursor: pointer;">Cancel</button>
                <button class="confirm-btn" style="padding: 0.5rem 1rem; background: #dc3545; color: white; 
                    border: none; border-radius: 4px; cursor: pointer;">Clear Loadout</button>
            </div>
        `;

        content.appendChild(header);
        content.appendChild(body);
        modal.appendChild(content);
        document.body.appendChild(modal);
        currentModal = modal;

        const confirmBtn = body.querySelector('.confirm-btn');
        const cancelBtn = body.querySelector('.cancel-btn');

        confirmBtn.addEventListener('click', () => {
            equipmentLoadouts[currentEquipLoadout].equipment = { rings: Array(8).fill(null), necklace: null, charm: null };
            currentEquipmentState = equipmentLoadouts[currentEquipLoadout].equipment;
            saveEquipmentState();
            renderEquipment();
            modal.remove();
        });

        cancelBtn.addEventListener('click', () => modal.remove());
        header.querySelector('.close-modal').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    // Initialize UI with correct names
    function updateLoadoutButtons() {
        equipmentUI.loadoutBtns.forEach(btn => {
            const lid = btn.dataset.plan;
            btn.textContent = equipmentLoadouts[lid].name;
            if (parseInt(lid) === currentEquipLoadout) btn.classList.add('active');
            else btn.classList.remove('active');
        });
    }
    updateLoadoutButtons();

    // Loadout Switching
    equipmentUI.loadoutBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const loadoutId = parseInt(btn.dataset.plan);
            if (loadoutId === currentEquipLoadout) return;

            currentEquipLoadout = loadoutId;
            currentEquipmentState = equipmentLoadouts[currentEquipLoadout].equipment;

            updateLoadoutButtons();
            equipmentUI.equipmentGrid.innerHTML = '';
            renderEquipment();
        });
    });

    function saveEquipmentState() {
        equipmentLoadouts[currentEquipLoadout].equipment = currentEquipmentState;
        localStorage.setItem('equipmentLoadouts', JSON.stringify(equipmentLoadouts));
        calculateEquipmentStats();
    }

    function renderEquipment() {
        equipmentUI.equipmentGrid.innerHTML = '';

        // --- RINGS SECTION ---
        const ringGroup = document.createElement('div');
        ringGroup.className = 'slot-group';
        ringGroup.innerHTML = `<div class="slot-group-header"><div class="slot-group-title">Rings (Max 8)</div></div>`;

        const ringsContainer = document.createElement('div');
        ringsContainer.className = 'equipment-slots-container rings-container';

        currentEquipmentState.rings.forEach((ringId, index) => {
            const isPremium = index >= 6; // 7th and 8th are premium
            const slot = createEquipmentSlot('Ring', 'rings', index, isPremium);
            ringsContainer.appendChild(slot);
        });
        ringGroup.appendChild(ringsContainer);
        equipmentUI.equipmentGrid.appendChild(ringGroup);

        // --- NECKLACE SECTION ---
        const necklaceGroup = document.createElement('div');
        necklaceGroup.className = 'slot-group';
        necklaceGroup.innerHTML = `<div class="slot-group-header"><div class="slot-group-title">Necklace</div></div>`;
        const necklaceContainer = document.createElement('div');
        necklaceContainer.className = 'equipment-slots-container';
        necklaceContainer.appendChild(createEquipmentSlot('Necklace', 'necklace', null, false));
        necklaceGroup.appendChild(necklaceContainer);
        equipmentUI.equipmentGrid.appendChild(necklaceGroup);

        // --- CHARM SECTION ---
        const charmGroup = document.createElement('div');
        charmGroup.className = 'slot-group';
        charmGroup.innerHTML = `<div class="slot-group-header"><div class="slot-group-title">Charm</div></div>`;
        const charmContainer = document.createElement('div');
        charmContainer.className = 'equipment-slots-container';
        charmContainer.appendChild(createEquipmentSlot('Charm', 'charm', null, false));
        charmGroup.appendChild(charmContainer);
        equipmentUI.equipmentGrid.appendChild(charmGroup);

        calculateEquipmentStats();
    }

    function createEquipmentSlot(slotName, typeKey, index, isPremium) {
        const selectedEquip = index !== null ? currentEquipmentState[typeKey][index] : currentEquipmentState[typeKey];

        const slot = document.createElement('div');
        slot.className = `equipment-slot ${selectedEquip ? 'filled' : ''} ${isPremium ? 'premium-slot' : ''}`;

        if (isPremium) {
            // Optional: Add visual indicator for premium
            slot.style.borderColor = 'var(--r-legendary)';
        }

        if (selectedEquip) {
            const equip = equipmentData.equipment[selectedEquip];
            if (!equip) {
                // Handle case where item ID might not exist in DB anymore
                return slot;
            }

            // Build stats HTML
            let statsHtml = '';
            for (const [stat, values] of Object.entries(equip.stats)) {
                const isNegative = values.max < 0 || values.min < 0;
                const percent = values.percent ? '%' : '';
                const badgeClass = isNegative ? 'stat-badge negative' : 'stat-badge';
                statsHtml += `<span class="${badgeClass}">${stat}: ${values.min}–${values.s6max}${percent}</span>`;
            }

            // Cost badge
            const costIcon = equip.costType === 'candy' ? '🍬' : '$';
            const costClass = equip.costType === 'candy' ? 'cost-badge candy' : 'cost-badge';
            const costHtml = `<span class="${costClass}">${costIcon} ${equip.cost.toLocaleString()}</span>`;

            slot.innerHTML = `
                <div class="remove-btn">×</div>
                <div class="slot-label">${slotName} ${index !== null ? index + 1 : ''}</div>
                <div class="equipment-name" style="color: var(--r-${equip.rarity})">${equip.name}</div>
                <div class="equipment-stats">${statsHtml}</div>
                ${costHtml}
            `;

            slot.querySelector('.remove-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                if (index !== null) {
                    currentEquipmentState[typeKey][index] = null;
                } else {
                    currentEquipmentState[typeKey] = null;
                }
                saveEquipmentState();
                renderEquipment();
            });
        } else {
            slot.innerHTML = `
                <div class="equipment-empty">
                    <div class="equipment-empty-icon">+</div>
                    <div>${slotName} ${index !== null ? index + 1 : ''}</div>
                    ${isPremium ? '<div style="font-size:0.7rem; color:var(--r-legendary)">(Premium)</div>' : ''}
                </div>
            `;
        }

        slot.addEventListener('click', (e) => {
            if (e.target.closest('.remove-btn')) return;
            openEquipmentSelectionModal(slotName, typeKey, index);
        });

        return slot;
    }

    function openEquipmentSelectionModal(slotName, typeKey, index) {
        if (currentModal) currentModal.remove();

        const modal = document.createElement('div');
        modal.className = 'selection-modal';

        const content = document.createElement('div');
        content.className = 'modal-content';

        const header = document.createElement('div');
        header.className = 'modal-header';
        header.innerHTML = `
            <div class="modal-title">Select ${slotName}</div>
            <button class="close-modal">×</button>
        `;

        const body = document.createElement('div');
        body.className = 'modal-body';

        const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'exotic'];

        rarities.forEach(rarity => {
            const items = equipmentData.getBySlotAndRarity(slotName, rarity);

            if (items.length > 0) {
                const rarityHeader = document.createElement('div');
                rarityHeader.className = 'selection-group-title';
                rarityHeader.textContent = rarity.charAt(0).toUpperCase() + rarity.slice(1);
                rarityHeader.style.color = `var(--r-${rarity})`;
                body.appendChild(rarityHeader);

                items.forEach(equip => {
                    const item = document.createElement('div');
                    item.className = 'selection-item';

                    const statsStr = Object.keys(equip.stats).join(', ');
                    item.innerHTML = `
                        <span style="color:var(--r-${equip.rarity})">${equip.name}</span>
                        <span style="font-size:0.75rem; color:var(--text-muted)">${statsStr}</span>
                    `;

                    item.addEventListener('click', () => {
                        if (index !== null) {
                            currentEquipmentState[typeKey][index] = equip.id;
                        } else {
                            currentEquipmentState[typeKey] = equip.id;
                        }
                        saveEquipmentState();
                        renderEquipment();
                        modal.remove();
                    });

                    body.appendChild(item);
                });
            }
        });

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

    function calculateEquipmentStats() {
        const totalStats = {};

        const addStats = (equipId) => {
            if (!equipId) return;
            const equip = equipmentData.equipment[equipId];
            if (!equip) return;

            for (const [stat, values] of Object.entries(equip.stats)) {
                const percent = values.percent ? '%' : '';
                const key = `${stat}${percent}`;

                if (!totalStats[key]) {
                    totalStats[key] = { min: 0, max: 0, s6max: 0, percent: values.percent || false };
                }

                totalStats[key].min += values.min;
                totalStats[key].max += values.max;
                totalStats[key].s6max += values.s6max;
            }
        };

        currentEquipmentState.rings.forEach(addStats);
        addStats(currentEquipmentState.necklace);
        addStats(currentEquipmentState.charm);

        equipmentUI.statsGrid.innerHTML = '';
        const statKeys = Object.keys(totalStats).sort();

        if (statKeys.length === 0) {
            equipmentUI.statsGrid.innerHTML = '<div class="stat-item empty">No equipment equipped</div>';
            return;
        }

        statKeys.forEach(statKey => {
            const stat = totalStats[statKey];
            const item = document.createElement('div');
            item.className = 'stat-item';
            const percent = stat.percent ? '%' : '';
            item.innerHTML = `
                <span class="stat-label">${statKey.replace('%', '')}</span>
                <span class="stat-value">${stat.min.toFixed(1)}–${stat.s6max.toFixed(1)}${percent}</span>
            `;
            equipmentUI.statsGrid.appendChild(item);
        });
    }
});