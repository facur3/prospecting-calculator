// Equipment Database for Prospecting Calculator
// Parsed from Roblox Prospecting Wiki

const equipmentData = {
    // Equipment configuration by slot
    slots: ['Ring', 'Necklace', 'Charm'],

    // All equipment organized by ID
    equipment: {
        // ========== COMMON ==========
        'gold_ring': {
            name: 'Gold Ring',
            description: 'A shiny gold ring.',
            slot: 'Ring',
            rarity: 'common',
            recipe: [
                { material: 'Gold', amount: 5 }
            ],
            stats: {
                'Luck': { min: 0.3, max: 0.8, s6max: 0.9 }
            },
            cost: 1000,
            costType: 'money'
        },
        'amethyst_pendant': {
            name: 'Amethyst Pendant',
            description: 'An amethyst necklace made from platinum.',
            slot: 'Necklace',
            rarity: 'common',
            recipe: [
                { material: 'Platinum', amount: 8 },
                { material: 'Amethyst', amount: 2 }
            ],
            stats: {
                'Luck': { min: 1, max: 2.5, s6max: 2.2 },
                'Sell Boost': { min: 0, max: 15, s6max: 18, percent: true }
            },
            cost: 10000,
            costType: 'money'
        },
        'garden_glove': {
            name: 'Garden Glove',
            description: 'A tough glove that protects the hands.',
            slot: 'Charm',
            rarity: 'common',
            recipe: [
                { material: 'Titanium', amount: 1 },
                { material: 'Gold', amount: 5 },
                { material: 'Pyrite', amount: 5 }
            ],
            stats: {
                'Dig Strength': { min: 0.2, max: 1, s6max: 1.1 },
                'Capacity': { min: 0, max: 5, s6max: 5.5 },
                'Inventory Size': { min: 10, max: 50, s6max: 55 }
            },
            cost: 10000,
            costType: 'money'
        },
        'titanium_ring': {
            name: 'Titanium Ring',
            description: 'A tough titanium Ring.',
            slot: 'Ring',
            rarity: 'common',
            recipe: [
                { material: 'Titanium', amount: 5 }
            ],
            stats: {
                'Capacity': { min: 1, max: 13, s6max: 15 }
            },
            cost: 20000,
            costType: 'money'
        },

        // ========== UNCOMMON ==========
        'smoke_ring': {
            name: 'Smoke Ring',
            description: 'A ring made from smoky quartz. Its obscuring nature brings out the hidden properties of gems.',
            slot: 'Ring',
            rarity: 'uncommon',
            recipe: [
                { material: 'Smoky Quartz', amount: 4 }
            ],
            stats: {
                'Inventory Size': { min: 10, max: 40, s6max: 45 },
                'Modifier Boost': { min: 5, max: 15, s6max: 16, percent: true }
            },
            cost: 20000,
            costType: 'money'
        },
        'pearl_necklace': {
            name: 'Pearl Necklace',
            description: 'A pearl necklace.',
            slot: 'Necklace',
            rarity: 'uncommon',
            recipe: [
                { material: 'Pearl', amount: 8, minWeight: 0.1 }
            ],
            stats: {
                'Luck': { min: 2, max: 5, s6max: 5.5 },
                'Dig Strength': { min: 0, max: 4, s6max: 4.5 }
            },
            cost: 22000,
            costType: 'money'
        },
        'jade_armband': {
            name: 'Jade Armband',
            description: 'A simple jade armband.',
            slot: 'Charm',
            rarity: 'uncommon',
            recipe: [
                { material: 'Jade', amount: 4 }
            ],
            stats: {
                'Luck': { min: 2, max: 9, s6max: 10 },
                'Capacity': { min: 1, max: 10, s6max: 11 },
                'Inventory Size': { min: 10, max: 70, s6max: 80 }
            },
            cost: 50000,
            costType: 'money'
        },
        'topaz_necklace': {
            name: 'Topaz Necklace',
            description: 'A simple necklace with a large topaz gem.',
            slot: 'Necklace',
            rarity: 'uncommon',
            recipe: [
                { material: 'Titanium', amount: 3 },
                { material: 'Topaz', amount: 1 }
            ],
            stats: {
                'Luck': { min: 1, max: 5, s6max: 5.5 },
                'Dig Strength': { min: 1, max: 4, s6max: 4.5 },
                'Shake Strength': { min: 0.2, max: 1, s6max: 1.1 }
            },
            cost: 60000,
            costType: 'money'
        },

        // ========== RARE ==========
        'ruby_ring': {
            name: 'Ruby Ring',
            description: 'A platinum ring embedded with a ruby gemstone.',
            slot: 'Ring',
            rarity: 'rare',
            recipe: [
                { material: 'Platinum', amount: 5, minWeight: 0.25 },
                { material: 'Ruby', amount: 1 }
            ],
            stats: {
                'Luck': { min: 2, max: 6, s6max: 6.4 },
                'Size Boost': { min: 0, max: 18, s6max: 20, percent: true }
            },
            cost: 45000,
            costType: 'money'
        },
        'lapis_armband': {
            name: 'Lapis Armband',
            description: 'An enchanted armband carved from Lapis Lazuli.',
            slot: 'Charm',
            rarity: 'rare',
            recipe: [
                { material: 'Lapis Lazuli', amount: 2 },
                { material: 'Gold', amount: 4, minWeight: 0.5 }
            ],
            stats: {
                'Luck': { min: 3, max: 10, s6max: 11 },
                'Dig Speed': { min: 0, max: 40, s6max: 45, percent: true },
                'Shake Speed': { min: 0, max: 40, s6max: 45, percent: true },
                'Inventory Size': { min: 10, max: 70, s6max: 80 }
            },
            cost: 111000,
            costType: 'money'
        },
        'speed_coil': {
            name: 'Speed Coil',
            description: 'A coil that improves the speed and efficiency of the wearer.',
            slot: 'Charm',
            rarity: 'rare',
            recipe: [
                { material: 'Meteoric Iron', amount: 1 },
                { material: 'Neodymium', amount: 3 },
                { material: 'Titanium', amount: 5 }
            ],
            stats: {
                'Dig Speed': { min: 0, max: 70, s6max: 80, percent: true },
                'Shake Speed': { min: 0, max: 70, s6max: 80, percent: true }
            },
            cost: 120000,
            costType: 'money'
        },
        'meteor_ring': {
            name: 'Meteor Ring',
            description: 'A ring made from meteoric iron.',
            slot: 'Ring',
            rarity: 'rare',
            recipe: [
                { material: 'Meteoric Iron', amount: 3 }
            ],
            stats: {
                'Dig Strength': { min: 0.5, max: 3, s6max: 3.2 },
                'Shake Strength': { min: 0, max: 1, s6max: 1.1 },
                'Inventory Size': { min: 10, max: 50, s6max: 55 }
            },
            cost: 150000,
            costType: 'money'
        },

        // ========== EPIC ==========
        'opal_amulet': {
            name: 'Opal Amulet',
            description: 'An opal amulet.',
            slot: 'Necklace',
            rarity: 'epic',
            recipe: [
                { material: 'Opal', amount: 1 },
                { material: 'Jade', amount: 1, minWeight: 0.3 }
            ],
            stats: {
                'Luck': { min: 5, max: 16, s6max: 18 },
                'Inventory Size': { min: 10, max: 80, s6max: 90 },
                'Modifier Boost': { min: 0, max: 90, s6max: 100, percent: true }
            },
            cost: 400000,
            costType: 'money'
        },
        'moon_ring': {
            name: 'Moon Ring',
            description: 'A ring from the stars. Wearing it makes you feel light on your feet.',
            slot: 'Ring',
            rarity: 'epic',
            recipe: [
                { material: 'Moonstone', amount: 1, minWeight: 0.4 },
                { material: 'Iridium', amount: 1, minWeight: 0.4 }
            ],
            stats: {
                'Luck': { min: 1, max: 7, s6max: 8 },
                'Dig Speed': { min: 10, max: 40, s6max: 45, percent: true },
                'Shake Speed': { min: 10, max: 40, s6max: 45, percent: true }
            },
            cost: 500000,
            costType: 'money'
        },
        'gravity_coil': {
            name: 'Gravity Coil',
            description: 'A coil that reduces the weight of the wearer, increasing the amount they can hold.',
            slot: 'Charm',
            rarity: 'epic',
            recipe: [
                { material: 'Aurorite', amount: 1 },
                { material: 'Moonstone', amount: 1 },
                { material: 'Osmium', amount: 1 }
            ],
            stats: {
                'Capacity': { min: 10, max: 140, s6max: 160 },
                'Inventory Size': { min: 10, max: 250, s6max: 275 }
            },
            cost: 1000000,
            costType: 'money'
        },
        'heart_of_ocean': {
            name: 'Heart of the Ocean',
            description: 'A ring that brings out the power of the sea in the wearer.',
            slot: 'Ring',
            rarity: 'epic',
            recipe: [
                { material: 'Coral', amount: 10 },
                { material: 'Silver Clamshell', amount: 5 },
                { material: 'Golden Pearl', amount: 3 }
            ],
            stats: {
                'Luck': { min: 3, max: 10, s6max: 11 },
                'Shake Speed': { min: 0, max: 20, s6max: 22, percent: true },
                'Sell Boost': { min: 10, max: 20, s6max: 22, percent: true }
            },
            cost: 1000000,
            costType: 'money'
        },

        // ========== LEGENDARY ==========
        'guiding_light': {
            name: 'Guiding Light',
            description: 'A wisp of light.',
            slot: 'Charm',
            rarity: 'legendary',
            recipe: [
                { material: 'Catseye', amount: 1 },
                { material: 'Golden Pearl', amount: 2 }
            ],
            stats: {
                'Luck': { min: 5, max: 20, s6max: 22 },
                'Capacity': { min: 10, max: 40, s6max: 45 },
                'Inventory Size': { min: 50, max: 200, s6max: 225 },
                'Modifier Boost': { min: 0, max: 45, s6max: 50, percent: true }
            },
            cost: 1500000,
            costType: 'money'
        },
        'lightkeeper_ring': {
            name: "Lightkeeper's Ring",
            description: 'A brightly glowing ring made from luminum. Lights the way, even during the darkest nights.',
            slot: 'Ring',
            rarity: 'legendary',
            recipe: [
                { material: 'Opal', amount: 2 },
                { material: 'Luminum', amount: 1 }
            ],
            stats: {
                'Dig Speed': { min: 5, max: 25, s6max: 27, percent: true },
                'Inventory Size': { min: 30, max: 100, s6max: 110 },
                'Sell Boost': { min: 5, max: 25, s6max: 27, percent: true },
                'Modifier Boost': { min: 5, max: 25, s6max: 27, percent: true }
            },
            cost: 2000000,
            costType: 'money'
        },
        'mass_accumulator': {
            name: 'Mass Accumulator',
            description: 'A powerful device that emits intense radiation, increasing the size of items.',
            slot: 'Necklace',
            rarity: 'legendary',
            recipe: [
                { material: 'Aurorite', amount: 1 },
                { material: 'Uranium', amount: 1 },
                { material: 'Osmium', amount: 2 }
            ],
            stats: {
                'Capacity': { min: 20, max: 60, s6max: 65 },
                'Inventory Size': { min: 150, max: 400, s6max: 450 },
                'Size Boost': { min: 10, max: 80, s6max: 90, percent: true }
            },
            cost: 3000000,
            costType: 'money'
        },
        'crown': {
            name: 'Crown',
            description: 'A crown with embedded gems. Fit for a king.',
            slot: 'Charm',
            rarity: 'legendary',
            recipe: [
                { material: 'Ruby', amount: 3, minWeight: 0.25 },
                { material: 'Gold', amount: 8, minWeight: 1 },
                { material: 'Emerald', amount: 2, minWeight: 0.2 },
                { material: 'Diamond', amount: 1 },
                { material: 'Sapphire', amount: 3, minWeight: 0.25 }
            ],
            stats: {
                'Luck': { min: 5, max: 30, s6max: 35 },
                'Size Boost': { min: 0, max: 45, s6max: 50, percent: true },
                'Sell Boost': { min: 0, max: 90, s6max: 100, percent: true }
            },
            cost: 5000000,
            costType: 'money'
        },
        'dragon_claw': {
            name: 'Dragon Claw',
            description: 'Grants the wearer the strength of a dragon.',
            slot: 'Charm',
            rarity: 'legendary',
            recipe: [
                { material: 'Ammonite Fossil', amount: 5 },
                { material: 'Dragon Bone', amount: 2 }
            ],
            stats: {
                'Dig Strength': { min: 10, max: 30, s6max: 32 },
                'Shake Strength': { min: 1, max: 8, s6max: 9 },
                'Inventory Size': { min: 100, max: 400, s6max: 450 }
            },
            cost: 10000000,
            costType: 'money'
        },

        // ========== MYTHIC ==========
        'royal_federation_crown': {
            name: 'Royal Federation Crown',
            description: 'A crown with embedded gems. Fit for a king.',
            slot: 'Charm',
            rarity: 'mythic',
            recipe: [
                { material: 'Rose Gold', amount: 3, minWeight: 0.4 },
                { material: 'Golden Pearl', amount: 5, minWeight: 0.2 },
                { material: 'Pink Diamond', amount: 1 }
            ],
            stats: {
                'Luck': { min: 10, max: 90, s6max: 100 },
                'Size Boost': { min: 0, max: 90, s6max: 100, percent: true },
                'Sell Boost': { min: 0, max: 180, s6max: 200, percent: true }
            },
            cost: 30000000,
            costType: 'money'
        },
        'phoenix_heart': {
            name: 'Phoenix Heart',
            description: 'An infernal artifact that burns through gemstones, leaving only the most valuable behind.',
            slot: 'Necklace',
            rarity: 'mythic',
            recipe: [
                { material: 'Uranium', amount: 3 },
                { material: 'Inferlume', amount: 1 },
                { material: 'Starshine', amount: 2 }
            ],
            stats: {
                'Luck': { min: 100, max: 300, s6max: 325 },
                'Inventory Size': { min: 100, max: 400, s6max: 450 },
                'Size Boost': { min: -70, max: -40, s6max: -35, percent: true }
            },
            cost: 40000000,
            costType: 'money'
        },
        'celestial_rings': {
            name: 'Celestial Rings',
            description: 'The power of the stars.',
            slot: 'Necklace',
            rarity: 'mythic',
            recipe: [
                { material: 'Vortessence', amount: 1 },
                { material: 'Meteoric Iron', amount: 8, minWeight: 0.3 },
                { material: 'Moonstone', amount: 5, minWeight: 0.3 },
                { material: 'Catseye', amount: 2 }
            ],
            stats: {
                'Luck': { min: 30, max: 90, s6max: 100 },
                'Capacity': { min: 50, max: 250, s6max: 275 },
                'Size Boost': { min: 0, max: 45, s6max: 50, percent: true },
                'Modifier Boost': { min: 20, max: 140, s6max: 150, percent: true }
            },
            cost: 50000000,
            costType: 'money'
        },
        'apocalypse_bringer': {
            name: 'Apocalypse Bringer',
            description: 'An ancient ring that signals the end of days.',
            slot: 'Ring',
            rarity: 'mythic',
            recipe: [
                { material: 'Ashvein', amount: 4 },
                { material: 'Ruby', amount: 10 },
                { material: 'Palladium', amount: 2 },
                { material: 'Painite', amount: 1 }
            ],
            stats: {
                'Dig Strength': { min: 5, max: 20, s6max: 22 },
                'Luck': { min: 10, max: 40, s6max: 45 },
                'Shake Strength': { min: 2, max: 5, s6max: 5.5 },
                'Sell Boost': { min: 10, max: 40, s6max: 45, percent: true }
            },
            cost: 50000000,
            costType: 'money'
        },
        'mythril_ring': {
            name: 'Mythril Ring',
            description: 'A legendary mythril ring.',
            slot: 'Ring',
            rarity: 'mythic',
            recipe: [
                { material: 'Tourmaline', amount: 2 },
                { material: 'Cinnabar', amount: 2 },
                { material: 'Starshine', amount: 1 },
                { material: 'Mythril', amount: 1 }
            ],
            stats: {
                'Luck': { min: 20, max: 80, s6max: 90 },
                'Dig Speed': { min: 20, max: 40, s6max: 42, percent: true },
                'Shake Speed': { min: 20, max: 40, s6max: 42, percent: true },
                'Sell Boost': { min: 5, max: 24, s6max: 26, percent: true }
            },
            cost: 60000000,
            costType: 'money',
            requiresBlueprint: true
        },
        'phoenix_wings': {
            name: 'Phoenix Wings',
            description: 'Death and rebirth.',
            slot: 'Charm',
            rarity: 'mythic',
            recipe: [
                { material: 'Flarebloom', amount: 1 },
                { material: 'Cinnabar', amount: 2 },
                { material: 'Fire Opal', amount: 2 }
            ],
            stats: {
                'Luck': { min: 100, max: 300, s6max: 325 },
                'Capacity': { min: -80, max: -40, s6max: -35 },
                'Inventory Size': { min: 100, max: 400, s6max: 450 }
            },
            cost: 65000000,
            costType: 'money'
        },
        'prismatic_star': {
            name: 'Prismatic Star',
            description: 'A luminescent ring infused with the light of the world.',
            slot: 'Ring',
            rarity: 'mythic',
            recipe: [
                { material: 'Diamond', amount: 1 },
                { material: 'Prismara', amount: 1 },
                { material: 'Pink Diamond', amount: 1 },
                { material: 'Borealite', amount: 5 },
                { material: 'Luminum', amount: 1 },
                { material: 'Starshine', amount: 1 }
            ],
            stats: {
                'Luck': { min: 5, max: 20, s6max: 22 },
                'Dig Strength': { min: 2, max: 10, s6max: 11 },
                'Capacity': { min: 10, max: 40, s6max: 45 },
                'Dig Speed': { min: 5, max: 20, s6max: 22, percent: true },
                'Shake Strength': { min: 1, max: 3, s6max: 3.2 },
                'Inventory Size': { min: 15, max: 50, s6max: 55 },
                'Shake Speed': { min: 5, max: 20, s6max: 22, percent: true },
                'Sell Boost': { min: 10, max: 20, s6max: 22, percent: true },
                'Size Boost': { min: 5, max: 20, s6max: 22, percent: true },
                'Modifier Boost': { min: 5, max: 20, s6max: 22, percent: true }
            },
            cost: 75000000,
            costType: 'money'
        },
        'cryogenic_preserver': {
            name: 'Cryogenic Preserver',
            description: "A device that freezes the body of the user, improving their strength... and maybe their lifespan.",
            slot: 'Charm',
            rarity: 'mythic',
            recipe: [
                { material: 'Borealite', amount: 5 },
                { material: 'Frostshard', amount: 1 },
                { material: 'Aetherite', amount: 3 },
                { material: 'Mythril', amount: 1 }
            ],
            stats: {
                'Luck': { min: 100, max: 250, s6max: 275 },
                'Shake Strength': { min: 10, max: 40, s6max: 45 },
                'Shake Speed': { min: -40, max: -20, s6max: -18, percent: true },
                'Sell Boost': { min: 0, max: 50, s6max: 55, percent: true }
            },
            cost: 75000000,
            costType: 'money',
            requiresBlueprint: true
        },
        'ring_of_thorns': {
            name: 'Ring of Thorns',
            description: 'A thorny ring made from vines.',
            slot: 'Ring',
            rarity: 'mythic',
            recipe: [
                { material: 'Chrysoberyl', amount: 1 },
                { material: 'Painite', amount: 2 },
                { material: 'Lightshard', amount: 5 },
                { material: 'Glowmoss', amount: 5 },
                { material: 'Firefly Stone', amount: 5 }
            ],
            stats: {
                'Luck': { min: 20, max: 100, s6max: 110 },
                'Dig Strength': { min: 5, max: 40, s6max: 45 },
                'Inventory Size': { min: 40, max: 150, s6max: 170 },
                'Size Boost': { min: 10, max: 30, s6max: 32, percent: true },
                'Modifier Boost': { min: 20, max: 60, s6max: 65, percent: true }
            },
            cost: 75000000,
            costType: 'money',
            requiresBlueprint: true
        },
        'purifying_ring': {
            name: 'Purifying Ring',
            description: 'A ring that protects the wearer from toxins.',
            slot: 'Ring',
            rarity: 'mythic',
            recipe: [
                { material: 'Diamond', amount: 5 },
                { material: 'Chrysoberyl', amount: 1 },
                { material: 'Diopside', amount: 10 },
                { material: 'Bismuth', amount: 1 },
                { material: 'Mercury', amount: 5 }
            ],
            stats: {
                'Luck': { min: 20, max: 80, s6max: 90 },
                'Dig Strength': { min: 10, max: 80, s6max: 90 },
                'Capacity': { min: 20, max: 100, s6max: 110 },
                'Shake Strength': { min: 5, max: 27, s6max: 30 },
                'Inventory Size': { min: 20, max: 80, s6max: 90 }
            },
            cost: 80000000,
            costType: 'money',
            requiresBlueprint: true
        },
        'solar_ring': {
            name: 'Solar Ring',
            description: 'A blessed solar ring.',
            slot: 'Ring',
            rarity: 'mythic',
            recipe: [
                { material: 'Vortessence', amount: 1 },
                { material: 'Fire Opal', amount: 2 },
                { material: 'Volcanic Core', amount: 1 },
                { material: 'Pyronium', amount: 10 }
            ],
            stats: {
                'Luck': { min: 20, max: 100, s6max: 110 },
                'Dig Strength': { min: 2, max: 8, s6max: 9 },
                'Dig Speed': { min: -30, max: -10, s6max: -8, percent: true },
                'Shake Strength': { min: 0, max: 2, s6max: 2.2 },
                'Shake Speed': { min: -30, max: -10, s6max: -8, percent: true },
                'Modifier Boost': { min: 5, max: 20, s6max: 22, percent: true }
            },
            cost: 90000000,
            costType: 'money'
        },
        'amulet_of_life': {
            name: 'Amulet of Life',
            description: 'An ancient amulet infused with the power of life.',
            slot: 'Necklace',
            rarity: 'mythic',
            recipe: [
                { material: 'Specterite', amount: 5 },
                { material: 'Chrysoberyl', amount: 1 },
                { material: 'Prismara', amount: 1 }
            ],
            stats: {
                'Luck': { min: 200, max: 400, s6max: 425 },
                'Modifier Boost': { min: 50, max: 150, s6max: 160, percent: true }
            },
            cost: 150000000,
            costType: 'money',
            requiresBlueprint: true
        },

        // ========== EXOTIC ==========
        'fossilized_crown': {
            name: 'Fossilized Crown',
            description: '...',
            slot: 'Charm',
            rarity: 'exotic',
            recipe: [
                { material: 'Dinosaur Skull', amount: 1 },
                { material: 'Cinnabar', amount: 5 },
                { material: 'Volcanic Core', amount: 1 },
                { material: 'Dragon Bone', amount: 5 }
            ],
            stats: {
                'Luck': { min: 100, max: 250, s6max: 260 },
                'Capacity': { min: 50, max: 200, s6max: 225 },
                'Shake Speed': { min: 10, max: 30, s6max: 32, percent: true },
                'Size Boost': { min: 0, max: 50, s6max: 55, percent: true },
                'Sell Boost': { min: 0, max: 100, s6max: 110, percent: true }
            },
            cost: 100000000,
            costType: 'money'
        },
        'frostthorn_pendant': {
            name: 'Frostthorn Pendant',
            description: 'An icy pendant.',
            slot: 'Necklace',
            rarity: 'exotic',
            recipe: [
                { material: 'Tourmaline', amount: 5 },
                { material: 'Cobalt', amount: 10 },
                { material: 'Frostshard', amount: 2 },
                { material: 'Aquamarine', amount: 5 },
                { material: 'Cryonic Artifact', amount: 1 }
            ],
            stats: {
                'Luck': { min: 100, max: 400, s6max: 450 },
                'Dig Strength': { min: 100, max: 200, s6max: 215 },
                'Capacity': { min: 50, max: 200, s6max: 225 },
                'Dig Speed': { min: -50, max: -30, s6max: -28, percent: true },
                'Size Boost': { min: 30, max: 100, s6max: 110, percent: true }
            },
            cost: 200000000,
            costType: 'money',
            requiresBlueprint: true
        },
        'antlers_of_life': {
            name: 'Antlers of Life',
            description: 'A massive pair of antlers resembling those of a mythical beast.',
            slot: 'Charm',
            rarity: 'exotic',
            recipe: [
                { material: 'Chrysoberyl', amount: 3 },
                { material: 'Vineheart', amount: 1 },
                { material: 'Radiant Gold', amount: 2 },
                { material: 'Firefly Stone', amount: 10 }
            ],
            stats: {
                'Dig Speed': { min: 10, max: 40, s6max: 44, percent: true },
                'Luck': { min: 100, max: 580, s6max: 640 },
                'Size Boost': { min: 20, max: 60, s6max: 65, percent: true },
                'Modifier Boost': { min: 50, max: 200, s6max: 220, percent: true }
            },
            cost: 300000000,
            costType: 'money',
            requiresBlueprint: true
        },
        'vortex_ring': {
            name: 'Vortex Ring',
            description: 'A ring with intense gravitational force, increasing capacity and power.',
            slot: 'Ring',
            rarity: 'exotic',
            recipe: [
                { material: 'Voidstone', amount: 1 },
                { material: 'Prismara', amount: 2 },
                { material: 'Vortessence', amount: 3 }
            ],
            stats: {
                'Dig Strength': { min: 20, max: 80, s6max: 90 },
                'Luck': { min: 50, max: 140, s6max: 155 },
                'Capacity': { min: 100, max: 300, s6max: 325 },
                'Shake Strength': { min: 3, max: 10, s6max: 11 }
            },
            cost: 333000000,
            costType: 'money',
            requiresBlueprint: true
        },
        'umbrite_ring': {
            name: 'Umbrite Ring',
            description: 'A cursed umbrite ring.',
            slot: 'Ring',
            rarity: 'exotic',
            recipe: [
                { material: 'Chrysoberyl', amount: 3 },
                { material: 'Painite', amount: 3 },
                { material: 'Dinosaur Skull', amount: 1 },
                { material: 'Specterite', amount: 5 },
                { material: 'Umbrite', amount: 1 }
            ],
            stats: {
                'Luck': { min: 50, max: 220, s6max: 245 },
                'Dig Strength': { min: 5, max: 40, s6max: 45 },
                'Capacity': { min: 10, max: 100, s6max: 110 },
                'Shake Strength': { min: 2, max: 10, s6max: 11 },
                'Size Boost': { min: 5, max: 15, s6max: 16, percent: true }
            },
            cost: 400000000,
            costType: 'money',
            requiresBlueprint: true
        },
        'otherworldly_ring': {
            name: 'Otherworldly Ring',
            description: '',
            slot: 'Ring',
            rarity: 'exotic',
            recipe: [
                { material: 'Astral Spore', amount: 1 },
                { material: 'Vineheart', amount: 1 },
                { material: 'Red Beryl', amount: 3 },
                { material: 'Gloomcap', amount: 10 }
            ],
            stats: {
                'Luck': { min: 150, max: 350, s6max: 375 },
                'Dig Speed': { min: 0, max: 20, s6max: 22, percent: true },
                'Shake Speed': { min: 0, max: 20, s6max: 22, percent: true },
                'Size Boost': { min: 5, max: 20, s6max: 21, percent: true },
                'Sell Boost': { min: 10, max: 30, s6max: 32, percent: true }
            },
            cost: 400000000,
            costType: 'money',
            requiresBlueprint: true
        },
        'venomshank': {
            name: 'Venomshank',
            description: "A lethal curse that drains the wearer's strength in exchange for immense luck.",
            slot: 'Necklace',
            rarity: 'exotic',
            recipe: [
                { material: 'Star Garnet', amount: 3 },
                { material: 'Bismuth', amount: 10 },
                { material: 'Mythril', amount: 3 },
                { material: 'Bloodstone', amount: 1 }
            ],
            stats: {
                'Luck': { min: 600, max: 1200, s6max: 1300 },
                'Dig Strength': { min: -100, max: -50, s6max: -45 },
                'Dig Speed': { min: -60, max: -40, s6max: -38, percent: true },
                'Inventory Size': { min: 100, max: 300, s6max: 325 },
                'Size Boost': { min: 20, max: 50, s6max: 55, percent: true },
                'Sell Boost': { min: 20, max: 50, s6max: 55, percent: true }
            },
            cost: 500000000,
            costType: 'money',
            requiresBlueprint: true
        },

        // ========== LIMITED-TIME: LEGENDARY ==========
        'ring_of_harvest': {
            name: 'Ring of Harvest',
            description: 'A ring often worn during the Harvest Moon as a good luck charm.',
            slot: 'Ring',
            rarity: 'legendary',
            limitedTime: true,
            recipe: [
                { material: 'Lapis Lazuli', amount: 5 },
                { material: 'Bone', amount: 3 },
                { material: 'Rock Candy', amount: 10 },
                { material: 'Lost Soul', amount: 1 }
            ],
            stats: {
                'Luck': { min: 5, max: 18, s6max: 20 },
                'Capacity': { min: 10, max: 30, s6max: 32 },
                'Inventory Size': { min: 10, max: 40, s6max: 45 },
                'Walk Speed': { min: 0.5, max: 1, s6max: 1 }
            },
            cost: 5000000,
            costType: 'money',
            requiresBlueprint: true
        },
        'spider_bowtie': {
            name: 'Spider Bowtie',
            description: 'A realistic spider bowtie.',
            slot: 'Necklace',
            rarity: 'legendary',
            limitedTime: true,
            recipe: [
                { material: 'Emerald', amount: 3 },
                { material: 'Diamond', amount: 2 },
                { material: 'Bone', amount: 5 },
                { material: 'Catseye', amount: 1 }
            ],
            stats: {
                'Luck': { min: 10, max: 80, s6max: 85 },
                'Capacity': { min: 40, max: 100, s6max: 110 },
                'Sell Boost': { min: 20, max: 50, s6max: 55, percent: true },
                'Modifier Boost': { min: 20, max: 50, s6max: 55, percent: true }
            },
            cost: 300,
            costType: 'candy'
        },

        // ========== LIMITED-TIME: MYTHIC ==========
        'amulet_of_spirits': {
            name: 'Amulet of Spirits',
            description: 'A spooky amulet worn by those celebrating Halloween.',
            slot: 'Necklace',
            rarity: 'mythic',
            limitedTime: true,
            recipe: [
                { material: 'Vortessence', amount: 1 },
                { material: 'Painite', amount: 1 },
                { material: 'Bone', amount: 10 },
                { material: 'Lost Soul', amount: 5 }
            ],
            stats: {
                'Luck': { min: 50, max: 140, s6max: 150 },
                'Dig Speed': { min: 20, max: 40, s6max: 42, percent: true },
                'Shake Speed': { min: 20, max: 40, s6max: 42, percent: true },
                'Size Boost': { min: 10, max: 30, s6max: 32, percent: true }
            },
            cost: 50000000,
            costType: 'money',
            requiresBlueprint: true
        },
        'candy_sack': {
            name: 'Candy Sack',
            description: 'A sack full of candy.',
            slot: 'Charm',
            rarity: 'mythic',
            limitedTime: true,
            recipe: [
                { material: 'Vortessence', amount: 2 },
                { material: 'Cinnabar', amount: 5 },
                { material: 'Lost Soul', amount: 10 }
            ],
            stats: {
                'Luck': { min: 30, max: 100, s6max: 110 },
                'Capacity': { min: 100, max: 300, s6max: 325 },
                'Inventory Size': { min: 300, max: 1000, s6max: 1100 },
                'Size Boost': { min: 30, max: 70, s6max: 75, percent: true }
            },
            cost: 600,
            costType: 'candy'
        },

        // ========== LIMITED-TIME: EXOTIC ==========
        'pumpkin_lord': {
            name: 'Pumpkin Lord',
            description: "Who doesn't want to wear a pumpkin on their head?",
            slot: 'Charm',
            rarity: 'exotic',
            limitedTime: true,
            recipe: [
                { material: 'Pumpkin Soul', amount: 1 },
                { material: 'Radiant Gold', amount: 1 },
                { material: 'Lost Soul', amount: 10 }
            ],
            stats: {
                'Dig Strength': { min: 80, max: 200, s6max: 220 },
                'Shake Strength': { min: 20, max: 50, s6max: 54 },
                'Inventory Size': { min: 200, max: 500, s6max: 550 },
                'Size Boost': { min: 30, max: 180, s6max: 220, percent: true },
                'Walk Speed': { min: 1, max: 4, s6max: 4.5 }
            },
            cost: 220000000,
            costType: 'money',
            requiresBlueprint: true
        },
        'witch_hat': {
            name: 'Witch Hat',
            description: 'A witch\'s hat, imbued with magic and halloween spirit.',
            slot: 'Charm',
            rarity: 'exotic',
            limitedTime: true,
            recipe: [
                { material: 'Pumpkin Soul', amount: 1 },
                { material: 'Volcanic Core', amount: 1 },
                { material: 'Inferlume', amount: 1 },
                { material: 'Prismara', amount: 1 },
                { material: 'Cryonic Artifact', amount: 1 }
            ],
            stats: {
                'Luck': { min: 400, max: 1000, s6max: 1100 },
                'Inventory Size': { min: 100, max: 400, s6max: 450 },
                'Modifier Boost': { min: 40, max: 100, s6max: 110, percent: true },
                'Walk Speed': { min: 1, max: 5, s6max: 5.5 }
            },
            cost: 1000,
            costType: 'candy'
        }
    },

    // Helper function to get equipment by slot
    getBySlot: function (slot) {
        return Object.keys(this.equipment)
            .filter(id => this.equipment[id].slot === slot)
            .map(id => ({ id, ...this.equipment[id] }));
    },

    // Helper function to get equipment by rarity
    getByRarity: function (rarity) {
        return Object.keys(this.equipment)
            .filter(id => this.equipment[id].rarity === rarity)
            .map(id => ({ id, ...this.equipment[id] }));
    },

    // Helper function to get equipment by slot and rarity
    getBySlotAndRarity: function (slot, rarity) {
        return Object.keys(this.equipment)
            .filter(id => this.equipment[id].slot === slot && this.equipment[id].rarity === rarity)
            .map(id => ({ id, ...this.equipment[id] }));
    }
};
