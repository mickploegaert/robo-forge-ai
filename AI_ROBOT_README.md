# 🤖 AI Robot 3D Generator

## Overzicht
De Robot 3D Viewer is nu volledig **AI-gestuurd** en genereert **unieke, 3D-printbare robots** op basis van je beschrijving!

## ✨ Wat is er nieuw?

### 1. **Geen Hardcoded Geometrie Meer**
- Elke robot wordt **dynamisch gegenereerd** door GPT-4
- AI bepaalt **alle onderdelen**: hoofd, romp, armen, benen, wielen, etc.
- **Exacte specificaties** voor elk onderdeel (vorm, grootte, positie)

### 2. **3D-Printbaar Design**
Elke robot is ontworpen met 3D-print criteria:
- ✅ **Stabiel zwaartepunt** (laag en gecentreerd)
- ✅ **Geen drijvende delen** (alles is verbonden)
- ✅ **Minimale wanddikte** van 2mm
- ✅ **Manifold geometrie** (waterdicht, geen gaten)
- ✅ **Logische proportie** (functioneel en printbaar)

### 3. **Intelligente Robot Analyse**
De AI analyseert je beschrijving en bepaalt:
- 🎯 **Functie**: Wat moet de robot doen?
- 🚀 **Beweging**: Benen, wielen, rupsbanden?
- ⚖️ **Stabiliteit**: Is het evenwicht correct?
- 📐 **Proporties**: Zijn alle onderdelen in balans?
- 🖨️ **Printbaarheid**: Kunnen we dit printen?

## 🎨 Voorbeelden

### Voorbeeld 1: Verkenningsrobot
```
Beschrijving: "Een compacte verkenningsrobot met rupsbanden, camera en antenne voor terreinverkenning"

AI Genereert:
- Laag, stabiel chassis
- Rupsbanden voor terreinnavigatie
- Camerakop met 2 sensoren
- Antenne voor communicatie
- Batterijcompartiment in romp
- Totale hoogte: ~15cm (printbaar)
```

### Voorbeeld 2: Humanoïde Robot
```
Beschrijving: "Een grote humanoïde robot met vier armen voor het tillen van objecten"

AI Genereert:
- Rechtopstaand humanoïd design
- 2 benen voor stabiliteit
- 4 armen met grijpers
- Stevig zwaartepunt door brede voeten
- Totale hoogte: ~30cm
```

### Voorbeeld 3: Spinrobot
```
Beschrijving: "Een spinachtige robot met zes poten en sensoren voor obstakels"

AI Genereert:
- Hexapod design (6 poten)
- Elk been heeft 2 segmenten + voet
- Sensoren vooraan
- Laag zwaartepunt voor stabiliteit
- Breed looppatroon mogelijk
```

## 🔧 Technische Details

### AI Configuratie Structuur
De AI genereert een JSON met:

```json
{
  "bodyType": "humanoid|wheeled|tracked|quadruped|spider|drone",
  "head": {
    "shape": "sphere|box|cylinder|dome|cone",
    "size": [width, height, depth],
    "position": [x, y, z],
    "features": ["camera", "antenna", "led"]
  },
  "torso": {
    "shape": "box|cylinder|capsule",
    "size": [width, height, depth],
    "compartments": ["battery", "electronics"]
  },
  "arms": [...],
  "legs": [...],
  "wheels": [...],
  "dimensions": {
    "totalHeight": 20,
    "centerOfGravity": [0, 8, 0]
  },
  "material": {
    "primary": "#2a2a2a",
    "finish": "metallic"
  }
}
```

### Rendering Proces
1. **AI Generatie** (10-20 sec)
   - GPT-4 analyseert beschrijving
   - Genereert complete robot spec
   - Valideert stabiliteit en printbaarheid

2. **3D Rendering** (instant)
   - `RenderShape` component vertaalt specs naar Three.js geometrie
   - Elk onderdeel wordt apart gerenderd
   - Joints en verbindingen worden toegevoegd

3. **Validatie**
   - Hoogte check (5-100cm)
   - Zwaartepunt validatie
   - Error handling met fallback

## 🚀 Gebruik

### In Code
```tsx
import AIRobot3DViewer from './components/AIRobot3DViewer';

<AIRobot3DViewer description="Een blauwe robot met vier armen en wielen" />
```

### API Key Configuratie
Zorg dat `.env.local` de OpenAI key bevat:
```env
NEXT_PUBLIC_OPENAI_API_KEY=sk-proj-...
```

## 🎯 Voordelen vs Hardcoded

| Aspect | Hardcoded | AI-Gestuurd |
|--------|-----------|-------------|
| Variatie | Beperkt (vooraf gedefinieerd) | Oneindig (AI bepaalt alles) |
| Creativiteit | Lage (vaste patterns) | Hoge (unieke designs) |
| Functionaliteit | Generiek | Specifiek voor taak |
| 3D-Printbaarheid | Misschien | Altijd gevalideerd |
| Aanpasbaarheid | Moeilijk (code wijzigen) | Makkelijk (beschrijving wijzigen) |

## 🛠️ Troubleshooting

### Robot laadt niet
1. Check console voor errors
2. Verifieer API key in `.env.local`
3. Controleer internet verbinding
4. Wacht 20 seconden (AI generatie duurt even)

### Robot ziet er vreemd uit
- De AI kan soms creatief zijn!
- Probeer een specifiekere beschrijving
- Vermeld: grootte, bewegingstype, functie

### Error tijdens generatie
- Fallback naar basic parser wordt gebruikt
- Check API quota (OpenAI limits)
- Herlaad de pagina

## 📊 Performance

- **AI Generatie**: 10-20 seconden
- **3D Rendering**: Instant (<100ms)
- **File Size**: Geen impact (server-side API)
- **Browser**: WebGL 2.0 required

## 🔮 Toekomstige Features

- [ ] Export naar STL bestand
- [ ] Multi-material support
- [ ] Animatie van beweging
- [ ] Physical simulation (balans test)
- [ ] Directe 3D print slicer integratie
- [ ] Robot delen met community
- [ ] AI suggesties voor verbetering

## 📝 Tips voor Beste Resultaten

1. **Wees specifiek**: "Klein" vs "15cm hoog"
2. **Vermeld functie**: "voor verkenning", "voor tillen"
3. **Geef bewegingstype**: "met wielen", "op rupsbanden"
4. **Kleur vermelden**: "blauw", "metallic grijs"
5. **Features noemen**: "met camera", "met grijpers"

## 🎨 Voorbeeld Prompts

**Goed:**
- "Een compacte 12cm hoge verkenningsrobot met rupsbanden, ultrasone sensoren en een blauwe metallic afwerking"

**Matig:**
- "Een robot met sensoren"

**Uitstekend:**
- "Een stabiele humanoïde robot van 25cm hoog met twee sterke armen met grijpers voor het oppakken van objecten, twee stevige benen met grote voeten voor balans, een rechthoekig chassis voor elektronica, en een dome-vormige kop met twee camera's"

---

**Gemaakt met ❤️ door ROBO Forge AI**
