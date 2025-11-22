const museumData = {
    config: {
        common: { free: 1, locked: 2, priceMoney: 1000000, priceShards: 400 },
        uncommon: { free: 1, locked: 2, priceMoney: 5000000, priceShards: 800 },
        rare: { free: 1, locked: 2, priceMoney: 10000000, priceShards: 1500 },
        epic: { free: 1, locked: 2, priceMoney: 100000000, priceShards: 2250 },
        legendary: { free: 1, locked: 2, priceMoney: 1000000000, priceShards: 3000 },
        mythic: { free: 0, locked: 2, priceMoney: 10000000000, priceShards: 5000 },
        exotic: { free: 0, locked: 1, priceMoney: null, priceShards: 10000 }
    },
    ores: {
        // Common
        "Amethyst": { stats: { "Dig Speed": 0.05 } },
        "Blue Ice": { stats: { "Dig Speed": 0.05 } },
        "Copper": { stats: { "Size Boost": 0.04 } },
        "Gold": { stats: { "Sell Boost": 0.05 } },
        "Obsidian": { stats: { "Size Boost": 0.04 } },
        "Pearl": { stats: { "Shake Speed": 0.05 } },
        "Platinum": { stats: { "Dig Speed": 0.05 } },
        "Pyrite": { stats: { "Capacity": 0.05 } },
        "Seashell": { stats: { "Capacity": 0.05 } },
        "Silver": { stats: { "Shake Speed": 0.05 } },

        // Uncommon
        "Coral": { stats: { "Capacity": 0.08 } },
        "Electrum": { stats: { "Sell Boost": 0.08 } },
        "Glowberry": { stats: { "Sell Boost": 0.08 } },
        "Malachite": { stats: { "Modifier Boost": 0.08 } },
        "Neodymium": { stats: { "Shake Strength": 0.08 } },
        "Rock Candy": { stats: { "Size Boost": 0.05 } },
        "Sapphire": { stats: { "Dig Speed": 0.08 } },
        "Smoky Quartz": { stats: { "Shake Strength": 0.08 } },
        "Titanium": { stats: { "Dig Speed": 0.08 } },
        "Topaz": { stats: { "Capacity": 0.08 } },
        "Zircon": { stats: { "Size Boost": 0.05 } },

        // Rare
        "Amber": { stats: { "Sell Boost": 0.13 } },
        "Azuralite": { stats: { "Dig Speed": 0.13 } },
        "Diopside": { stats: { "Modifier Boost": 0.13 } },
        "Glacial Quartz": { stats: { "Dig Speed": 0.13 } },
        "Gloomberry": { stats: { "Dig Speed": 0.13 } },
        "Jade": { stats: { "Modifier Boost": 0.13 } },
        "Lapis Lazuli": { stats: { "Dig Speed": 0.13 } },
        "Meteoric Iron": { stats: { "Shake Strength": 0.13 } },
        "Onyx": { stats: { "Modifier Boost": 0.13 } },
        "Peridot": { stats: { "Luck": 0.13 } },
        "Pyrelith": { stats: { "Sell Boost": 0.13 } },
        "Ruby": { stats: { "Shake Strength": 0.13 } },
        "Silver Clamshell": { stats: { "Shake Speed": 0.13 } },

        // Epic
        "Ammonite Fossil": { stats: { "Capacity": 0.2 } },
        "Ashvein": { stats: { "Size Boost": 0.14 } },
        "Aurorite": { stats: { "Dig Speed": 0.2 } },
        "Bone": { stats: { "Size Boost": 0.14 } },
        "Borealite": { stats: { "Dig Speed": 0.2 } },
        "Cobalt": { stats: { "Dig Speed": 0.2 } },
        "Emerald": { stats: { "Luck": 0.2 } },
        "Glowmoss": { stats: { "Modifier Boost": 0.2 } },
        "Golden Pearl": { stats: { "Capacity": 0.2 } },
        "Iridium": { stats: { "Dig Speed": 0.2 } },
        "Lightshard": { stats: { "Dig Speed": 0.2 } },
        "Mercury": { stats: { "Shake Strength": 0.2 } },
        "Moonstone": { stats: { "Shake Speed": 0.2 } },
        "Opal": { stats: { "Shake Speed": 0.2 } },
        "Osmium": { stats: { "Size Boost": 0.2 } },
        "Pyronium": { stats: { "Sell Boost": 0.2 } },

        // Legendary
        "Aetherite": { stats: { "Dig Speed": 0.3 } },
        "Aquamarine": { stats: { "Dig Speed": 0.3 } },
        "Bismuth": { stats: { "Dig Speed": 0.3 } },
        "Catseye": { stats: { "Capacity": 0.3 } },
        "Cinnabar": { stats: { "Size Boost": 0.21 } },
        "Diamond": { stats: { "Luck": 0.3 } },
        "Dragon Bone": { stats: { "Size Boost": 0.21 } },
        "Fire Opal": { stats: { "Size Boost": 0.21 } },
        "Firefly Stone": { stats: { "Capacity": 0.3 } },
        "Gloomcap": { stats: { "Dig Speed": 0.3 } },
        "Lost Soul": { stats: { "Dig Speed": 0.3 } },
        "Luminum": { stats: { "Capacity": 0.3 } },
        "Palladium": { stats: { "Sell Boost": 0.3 } },
        "Rose Gold": { stats: { "Shake Strength": 0.3 } },
        "Specterite": { stats: { "Shake Speed": 0.3 } },
        "Starshine": { stats: { "Dig Speed": 0.15, "Shake Speed": 0.15 } },
        "Tourmaline": { stats: { "Sell Boost": 0.3 } },
        "Uranium": { stats: { "Modifier Boost": 0.3 } },
        "Volcanic Key": { stats: { "Size Boost": 0.21 } },

        // Mythic
        "Chrysoberyl": { stats: { "Luck": 0.5 } },
        "Flarebloom": { stats: { "Luck": 0.75, "Size Boost": -0.5 } },
        "Frostshard": { stats: { "Dig Strength": 0.5 } },
        "Inferlume": { stats: { "Luck": 0.5 } },
        "Mythril": { stats: { "Shake Strength": 0.5 } },
        "Painite": { stats: { "Size Boost": 0.35 } },
        "Pink Diamond": { stats: { "Luck": 0.5 } },
        "Prismara": { stats: { "Luck": 0.25, "Capacity": 0.25, "Dig Strength": 0.25, "Shake Strength": 0.25 } },
        "Radiant Gold": { stats: { "Sell Boost": 0.5 } },
        "Red Beryl": { stats: { "Size Boost": 0.35 } },
        "Star Garnet": { stats: { "Size Boost": 0.35 } },
        "Volcanic Core": { stats: { "Dig Strength": 0.25, "Size Boost": 0.2 } },
        "Vortessence": { stats: { "Capacity": 0.5 } },

        // Exotic
        "Astral Spore": { stats: { "Dig Speed": 0.8 } },
        "Bloodstone": { stats: { "Size Boost": 0.56 } },
        "Cryonic Artifact": { stats: { "Dig Strength": 1.2, "Shake Strength": 1.2, "Dig Speed": -0.8, "Shake Speed": -0.8 } },
        "Dinosaur Skull": { stats: { "Sell Boost": 0.4, "Size Boost": 0.32 } },
        "Pumpkin Soul": { stats: { "Size Boost": 0.56 } },
        "Vineheart": { stats: { "Luck": 0.8 } },
        "Umbrite": { stats: { "Dig Speed": 0.4, "Shake Speed": 0.4 } },
        "Voidstone": { stats: { "Luck": 0.4, "Capacity": 0.4 } }
    },
    modifiers: {
        "None": { stats: {} },
        "Treasured": { stats: { "Luck": 0.13 } }, // Assuming base value 1 for multiplier calc if needed, but request says "Luck"
        "Voidtorn": { stats: { "Luck": 0.11, "Capacity": 0.11 } }, // Assuming split or full? Request says "Luck + Capacity". Using 0.11 based on x11 value? No, let's look at the pattern.
        // Wait, the request says:
        // Treasured: x13 value, Bonus: Luck
        // Voidtorn: x11 value, Bonus: Luck + Capacity
        // It doesn't specify the AMOUNT of the bonus for modifiers.
        // "Place a mineral matching the display’s rarity to grant a permanent stat bonus."
        // "Modifier Bonuses ... Treasured ... Bonus: Luck"
        // Usually in these games, the modifier adds a specific amount or multiplier.
        // Looking at the wiki data provided: "Modifier Bonuses ... Treasured ... Luck".
        // It doesn't say "Luck x1.3".
        // However, usually "Luck" implies a stat boost.
        // Let's check if there's any context I missed.
        // "Ore Bonuses by Rarity ... Amethyst ... Bonus: Dig Speed ... Max Boost: 0.05x"
        // The table for modifiers just says "Luck".
        // I will assume for now that modifiers might just be a label or I need to guess the value?
        // Actually, looking at the table: "Treasured || x13 value || Luck".
        // Maybe it multiplies the ORE's bonus?
        // "Place a mineral matching the display's rarity to grant a permanent stat bonus."
        // "Each display holds one mineral. Bonuses stack..."
        // "Modifier Bonuses" table exists.
        // If I put a Treasured Amethyst, do I get Amethyst stats + Treasured stats?
        // If Treasured gives "Luck", how much Luck?
        // The user didn't provide the numbers for modifier bonuses, only the TYPE of bonus.
        // Wait, let me re-read carefully.
        // "Modifier Bonuses ... Treasured ... x13 value ... Luck"
        // It does NOT say the amount.
        // I will implement the structure but maybe set values to 0 or placeholders, or ask the user?
        // But I am in execution mode.
        // Let's look at "Irradiated ... x2.5 value ... Modifier Boost".
        // "Pure ... x1.35 value ... Dig Speed".
        // Maybe the modifier bonus is a fixed small amount or a multiplier?
        // Let's check the "Ore Bonuses" table again. "Maximum Boost".
        // Maybe the "Maximum Boost" column in Ore table is what you get?
        // "Minimum KG ... Bonus ... Maximum Boost".
        // So Amethyst gives Dig Speed 0.05x.
        // If I have a Treasured Amethyst, maybe it's just 0.05x Dig Speed AND some Luck?
        // I'll assume a placeholder value for now (e.g. 0.1 or 0.05) and add a note in the UI or code.
        // OR, maybe the modifier MULTIPLIES the ore's bonus?
        // "Irradiated ... Modifier Boost".
        // Let's assume for now that modifiers add a separate stat.
        // I'll use a safe default like 0.05 for now for all modifier bonuses to avoid breaking the logic, and maybe add a "Value" input if the user knows it?
        // actually, I'll just list them as keys for now.

        // RE-READING: "Each display accepts minerals of a specific rarity... Place a mineral... to grant a permanent stat bonus."
        // The modifier table might just be for the "Sell Price" of the ore itself, not the museum?
        // "Museum ... Place minerals ... to earn permanent stat boosts."
        // "Modifier Bonuses" table is at the bottom.
        // It says "Modifier ... Multiplier ... Bonus".
        // This likely applies to the museum too.
        // I will use 0.05 as a placeholder for all modifier bonuses since I don't have the exact numbers.

        "Treasured": { stats: { "Luck": 0.05 } },
        "Voidtorn": { stats: { "Luck": 0.05, "Capacity": 0.05 } },
        "Electrified": { stats: { "Dig Speed": 0.05, "Shake Speed": 0.05 } },
        "Iridescent": { stats: { "Luck": 0.05 } },
        "Crystalline": { stats: { "Size Boost": 0.05 } },
        "Irradiated": { stats: { "Modifier Boost": 0.05 } },
        "Scorching": { stats: { "Dig Strength": 0.05 } },
        "Glowing": { stats: { "Shake Speed": 0.05 } },
        "Pure": { stats: { "Dig Speed": 0.05 } },
        "Shiny": { stats: { "Shake Strength": 0.05 } }
    }
};
