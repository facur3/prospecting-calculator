import requests
from bs4 import BeautifulSoup
import json
import time
import re
import sys

# --- CONFIGURACIÓN ---
BASE_URL = "https://prospecting.miraheze.org"
API_URL = "https://prospecting.miraheze.org/w/api.php"
OUTPUT_FILE = "database.js"

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
}

database = {}

def clean_number(text):
    """Convierte '1,536,173,443' a int"""
    if not text: return 0
    return int(text.replace(',', '').replace('.', ''))

def clean_zone_name(name):
    """Limpia y estandariza los nombres de las zonas"""
    name = name.strip()
    # Quitar caracteres invisibles y saltos de linea
    name = re.sub(r'\s+', ' ', name)
    # Quitar 'if in loot pool' (caso The Void)
    name = name.replace(" if in loot pool", "")
    # Quitar iconos o caracteres raros al inicio
    name = re.sub(r'^[^\w]+', '', name)
    return name.strip()

print(f"🚀 Iniciando Scraper V5 (Full Coverage)...")

try:
    # --- PASO 1: OBTENER LISTA DE MINERALES ---
    print("📡 Obteniendo lista desde la API...")
    params = { "action": "parse", "page": "Minerals", "prop": "links", "format": "json" }
    response = requests.get(API_URL, params=params, headers=HEADERS)
    data = response.json()
    links = data.get('parse', {}).get('links', [])
    
    mineral_urls = []
    ignore_list = ["Modifier", "Prospecting", "Merchant", "Ore", "Gem", "Bar", "Geode", "Treasure", "Main Page", "Magnetite", "Bedrock", "Stone"]
    
    for link in links:
        title = link['*']
        # Solo procesar si es namespace 0 y no está en la lista negra
        if link.get('ns', 0) == 0 and title not in ignore_list and "Category:" not in title:
            mineral_urls.append({
                "name": title,
                "url": f"{BASE_URL}/wiki/{title.replace(' ', '_')}"
            })

    # Eliminar duplicados
    mineral_urls = [dict(t) for t in {tuple(d.items()) for d in mineral_urls}]
    print(f"📋 Lista cargada: {len(mineral_urls)} minerales.")

    # --- PASO 2: VISITAR CADA PÁGINA ---
    count_saved = 0
    
    for i, mineral in enumerate(mineral_urls):
        sys.stdout.write(f"\r[{i+1}/{len(mineral_urls)}] Escaneando: {mineral['name']}...     ")
        sys.stdout.flush()
        
        try:
            time.sleep(0.05) # Rapido pero seguro
            page_resp = requests.get(mineral['url'], headers=HEADERS)
            soup = BeautifulSoup(page_resp.content, 'html.parser')
            full_text = soup.get_text(separator="\n")

            # 1. EXTRAER VALOR ($)
            value = 0
            val_match = re.search(r'Value:\s*\$\s*([\d,]+)', full_text)
            if val_match: value = clean_number(val_match.group(1))
            if value == 0: continue # Si no tiene valor, skip

            # 2. EXTRAER RAREZA
            rarity = "common"
            rar_match = re.search(r'Rarity:\s*([A-Za-z]+)', full_text)
            if rar_match: rarity = rar_match.group(1).lower()

            # 3. EXTRAER ZONAS (REGEX MEJORADO)
            # Busca: "Nombre Zona" seguido de un guion, porcentaje y "(1 in X)"
            # Captura cualquier cosa antes del guion que no sea un salto de linea largo
            # Regex: (.+?) -> Nombre Zona
            # \s*[-–—]\s* -> Guion (cualquier tipo)
            # .*?\(~?1\s*in\s*([\d,]+)\) -> Busca el (1 in X)
            
            matches = re.finditer(r"([^\n\r]+?)\s*[-–—]\s*.*?\(~?1\s*in\s*([\d,]+)\)", full_text)
            
            found_any = False
            for match in matches:
                raw_zone = match.group(1)
                one_in_str = match.group(2)
                
                zone_name = clean_zone_name(raw_zone)
                one_in = clean_number(one_in_str)

                # Validaciones de calidad
                if one_in > 0 and len(zone_name) > 2 and len(zone_name) < 50:
                    # Filtro extra: A veces captura frases como "Found in"
                    if "found in" in zone_name.lower(): continue

                    if zone_name not in database: database[zone_name] = []
                    
                    # Evitar duplicados
                    exists = False
                    for item in database[zone_name]:
                        if item['name'] == mineral['name']: exists = True; break
                    
                    if not exists:
                        database[zone_name].append({
                            "name": mineral['name'],
                            "value": value,
                            "type": rarity,
                            "oneIn": one_in,
                            "wikiUrl": mineral['url']
                        })
                        found_any = True
                        count_saved += 1
            
            # FALLBACK PARA TABLAS ANTIGUAS (Si el regex de texto falla)
            if not found_any:
                tables = soup.find_all('table', class_='wikitable')
                for table in tables:
                    for tr in table.find_all('tr'):
                        cols = tr.find_all('td')
                        if len(cols) >= 2:
                            for col in cols:
                                if "1 in" in col.text:
                                    m_one = re.search(r'1 in ([\d,]+)', col.text)
                                    if m_one:
                                        z_name = clean_zone_name(cols[0].text)
                                        o_in = clean_number(m_one.group(1))
                                        if o_in > 0 and len(z_name) > 2:
                                            if z_name not in database: database[z_name] = []
                                            # Check dupe logic repetida...
                                            exists = False
                                            for item in database[z_name]:
                                                if item['name'] == mineral['name']: exists = True; break
                                            if not exists:
                                                database[z_name].append({
                                                    "name": mineral['name'],
                                                    "value": value,
                                                    "type": rarity,
                                                    "oneIn": o_in,
                                                    "wikiUrl": mineral['url']
                                                })
                                                count_saved += 1

        except Exception as e:
            pass

    # LIMPIEZA FINAL DE BASURA
    # Eliminar llaves vacías o zonas con nombres rotos que hayan sobrevivido
    clean_db = {}
    for zone, items in database.items():
        if zone and len(items) > 0 and len(zone) < 40:
            clean_db[zone] = items
            
    print(f"\n\n✅ FINALIZADO.")
    print(f"📊 Total guardado: {count_saved} minerales en {len(clean_db)} zonas.")
    
    # GUARDAR
    js_content = f"const scrapedDatabase = {json.dumps(clean_db, indent=4)};"
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write(js_content)
        
    print(f"💾 Archivo '{OUTPUT_FILE}' generado con éxito.")

except Exception as e:
    print(f"\n❌ Error Crítico: {e}")