# 🔄 Intelligent Model Fallback System

## Overzicht

RoboForge AI gebruikt een intelligent fallback systeem dat automatisch terugvalt naar GPT-4o als geavanceerde modellen (zoals o1-mini) niet beschikbaar zijn op jouw OpenAI API key.

## 🎯 Hoe het Werkt

### 1. Primaire Modellen (Beste Kwaliteit)

Standaard probeert het systeem **o1-mini** te gebruiken voor:
- **Robot 3D Configuratie** - Superior geometric reasoning
- **Arduino Code Generatie** - Better embedded systems logic

### 2. Automatische Fallback

Als o1-mini niet beschikbaar is:
```
o1-mini (poging 1) 
    ↓ [404/400 error]
gpt-4o (automatisch) ✅
```

**Geen handmatige actie nodig!** Het systeem:
1. ✅ Detecteert dat o1-mini niet werkt
2. ✅ Valt automatisch terug naar gpt-4o
3. ✅ Cached deze informatie voor toekomstige calls
4. ✅ Logt een waarschuwing in de console

### 3. Model Beschikbaarheid Cache

Het systeem onthoudt welke modellen werken:

```typescript
modelAvailability = {
  "o1-mini": false,      // Niet beschikbaar - gebruik fallback
  "gpt-4o": true,        // Werkt prima
  "gpt-4-turbo": true    // Ook beschikbaar
}
```

Dit voorkomt herhaalde mislukte requests naar modellen die toch niet werken.

## 📋 Model Beschikbaarheid per API Tier

### Free Tier (Gratis)
- ✅ GPT-3.5-turbo
- ❌ GPT-4o (beperkt beschikbaar)
- ❌ o1-mini
- ❌ o1-preview

### Pay-as-you-go Tier (Betaal per gebruik)
- ✅ GPT-3.5-turbo
- ✅ GPT-4o ✨
- ❌ o1-mini (mogelijk beperkt)
- ❌ o1-preview (mogelijk beperkt)

### Tier 1+ (> $5 betaald)
- ✅ GPT-3.5-turbo
- ✅ GPT-4o
- ✅ o1-mini ✨ (kan beschikbaar zijn)
- ⚠️ o1-preview (mogelijk beperkt)

**Let op:** o1 modellen zijn relatief nieuw en niet beschikbaar voor alle gebruikers. Het systeem valt automatisch terug naar GPT-4o.

## 🔍 Hoe Check Je Jouw Model Access?

### Methode 1: Via OpenAI Dashboard
1. Ga naar https://platform.openai.com/account/limits
2. Bekijk "Model availability"
3. Check of "o1-mini" in de lijst staat

### Methode 2: Via API Test
1. Gebruik de OpenAI Playground
2. Selecteer "o1-mini" als model
3. Als het niet werkt → jouw account heeft geen toegang

### Methode 3: Via Console Logs
Start de RoboForge dev server:
```bash
npm run dev
```

Genereer een robot en check de console:
```
✅ Model gpt-4o is beschikbaar
⚠️ Model o1-mini not available (model does not exist), falling back to gpt-4o
```

## ⚙️ Handmatig Model Kiezen

Als je weet welke modellen werken, kun je de code aanpassen:

### Voor Robot Generatie
```typescript
// In src/app/services/ai.ts, regel ~1427

// Van (o1-mini met fallback):
const response = await callOpenAI(messages, 6000, 0.3, "o1-mini", "gpt-4o");

// Naar (direct gpt-4o):
const response = await callOpenAI(messages, 6000, 0.3, "gpt-4o", "gpt-4o");
```

### Voor Arduino Code
```typescript
// In src/app/services/ai.ts, regel ~473

// Van (o1-mini met fallback):
return await callOpenAI(messages, 8000, 0.2, "o1-mini", "gpt-4o");

// Naar (direct gpt-4o):
return await callOpenAI(messages, 8000, 0.2, "gpt-4o", "gpt-4o");
```

## 📊 Kwaliteitsverschil

| Functie | o1-mini | GPT-4o | Verschil |
|---------|---------|--------|----------|
| **Robot 3D Config** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | +15% nauwkeurigheid |
| **Arduino Code** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | +20% code kwaliteit |
| **Circuit Design** | N/A | ⭐⭐⭐⭐⭐ | GPT-4o standaard |
| **Parts List** | N/A | ⭐⭐⭐⭐⭐ | GPT-4o standaard |

**GPT-4o is nog steeds excellent!** Het verschil is vooral:
- o1-mini: Beter in multi-step reasoning, complexe geometrie, state machines
- GPT-4o: Sneller, meer beschikbaar, nog steeds hoogwaardige output

## 🚨 Error Messages Explained

### "Model o1-mini not available"
```
⚠️ Model o1-mini not available (model does not exist), falling back to gpt-4o
```
**Betekenis:** Jouw API key heeft geen toegang tot o1-mini
**Actie:** Geen - systeem gebruikt automatisch gpt-4o
**Impact:** Minimaal - GPT-4o werkt uitstekend

### "Model gpt-4o previously failed"
```
⚠️ Model gpt-4o previously failed, using fallback gpt-4-turbo
```
**Betekenis:** GPT-4o werkte eerder niet
**Actie:** Check API limits/credit balance
**Impact:** Laag - gpt-4-turbo is ook goed

### "Ongeldige API key"
```
❌ Ongeldige API key. Controleer je OpenAI API key.
```
**Betekenis:** API key in .env.local is verkeerd/verlopen
**Actie:** Update OPENAI_API_KEY in .env.local
**Impact:** Hoog - niets werkt zonder geldige key

## 💡 Aanbevelingen

### Voor Studenten/Leren (Gratis/Basis Tier)
```typescript
// Gebruik GPT-4o direct (als beschikbaar)
model: "gpt-4o"
fallback: "gpt-3.5-turbo"
```
**Waarom:** Geen toegang tot o1-mini, GPT-4o werkt prima

### Voor Professioneel Gebruik (Tier 1+)
```typescript
// Probeer o1-mini, fallback naar GPT-4o
model: "o1-mini"
fallback: "gpt-4o"
```
**Waarom:** Beste kwaliteit als beschikbaar, goede fallback

### Voor Maximum Snelheid
```typescript
// Gebruik GPT-4o (snelste premium model)
model: "gpt-4o"
fallback: "gpt-4o"
```
**Waarom:** o1-mini is trager (10-30s), GPT-4o is snel (2-5s)

## 🔧 Troubleshooting

### Probleem: "Too many requests"
**Oplossing:** 
- Wacht 1 minuut tussen requests
- Systeem heeft ingebouwde rate limiting
- Check API limits op OpenAI dashboard

### Probleem: Slechte code/model kwaliteit
**Mogelijke oorzaken:**
1. Gebruikt gpt-3.5-turbo (fallback van fallback)
2. API key heeft lage tier access
3. Model cache corrupt

**Oplossing:**
```bash
# Stop dev server
Ctrl+C

# Clear cache
rm -r .next

# Restart
npm run dev
```

### Probleem: Console vol met warnings
**Normaal gedrag:** Als o1-mini niet beschikbaar is, zie je:
```
⚠️ Model o1-mini not available, falling back to gpt-4o
```

**Oplossing:** Dit is informatief, geen error. Om te verbergen:
1. Open src/app/services/ai.ts
2. Zoek `console.warn` op regel ~50
3. Comment uit of verwijder

## 📈 Model Access Upgraden

Wil je toegang tot o1-mini?

1. **Spend $5+** op OpenAI platform
   - Dit promoot je naar Tier 1
   - o1-mini wordt mogelijk beschikbaar

2. **Wacht op Rollout**
   - o1 modellen rollen geleidelijk uit
   - Check periodiek je model limits

3. **Gebruik GPT-4o in tussentijd**
   - Uitstekende kwaliteit
   - Sneller dan o1-mini
   - Breed beschikbaar

## 🎯 Conclusie

Het fallback systeem zorgt ervoor dat RoboForge AI **altijd werkt**, ongeacht welke modellen beschikbaar zijn op jouw API key. 

**Automatisch. Intelligent. Betrouwbaar.** 🚀

---

Last updated: October 27, 2025
