"use client";

const API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY || "";

class AIServiceError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = "AIServiceError";
  }
}

let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000;

async function rateLimitedFetch(url: string, options: RequestInit) {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
  }
  lastRequestTime = Date.now();
  return fetch(url, options);
}

type MessageContent = string | Array<{type: string; text?: string; image_url?: {url: string}}>;

async function callOpenAI(messages: Array<{role: string; content: MessageContent}>, maxTokens = 3000, temperature = 0.2, model = "gpt-4o") {
  if (!API_KEY || API_KEY === "your-api-key-here") {
    throw new AIServiceError("OpenAI API key niet geconfigureerd.");
  }
  const maxRetries = 3;
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await rateLimitedFetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: maxTokens,
          temperature,
          presence_penalty: 0.1,
          frequency_penalty: 0.1
        })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401) throw new AIServiceError("Ongeldige API key", 401);
        if (response.status === 429) throw new AIServiceError("Te veel verzoeken", 429);
        throw new AIServiceError(errorData.error?.message || `HTTP ${response.status}`, response.status);
      }
      const data = await response.json();
      if (data.error) throw new AIServiceError(data.error.message);
      if (!data.choices?.[0]?.message) throw new AIServiceError("Onverwacht antwoord");
      return data.choices[0].message.content;
    } catch (error) {
      lastError = error as Error;
      if (error instanceof AIServiceError && error.statusCode && error.statusCode < 500) throw error;
      if (attempt === maxRetries) break;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  throw new AIServiceError(`Geen verbinding: ${lastError?.message || "Onbekend"}`);
}

export async function generateArduinoCode(description: string, imageUrl?: string) {
  const userContent: Array<{type: string; text?: string; image_url?: {url: string}}> = [{
    type: "text", 
    text: `Genereer COMPLETE Arduino code voor robot: ${description}

INTERPRETEER de beschrijving slim:
- Als user "robot" zegt → obstacle avoiding robot met ultrasone sensor
- Als "arm" of "grijper" → servo-controlled robotic arm
- Als "rijden" of "auto" → 2-motor differentieel aandrijving
- Als "volgen" → lijn volg robot met IR sensoren
- Als vage input → maak intelligente aannames gebaseerd op context

Voeg altijd toe:
- Non-blocking timing (millis)
- State machine voor complexe logica
- Serial debug output (115200 baud)
- Error handling en safety limits
- Sensor smoothing/filtering waar nodig
- Nederlandse commentaar

Volledig functioneel, productie-klaar!`
  }];
  if (imageUrl) userContent.push({type: "image_url", image_url: {url: imageUrl}});
  
  const messages = [{
    role: "system", 
    content: `Je bent senior Arduino engineer met 10+ jaar ervaring. Je begrijpt vage beschrijvingen en maakt slimme technische keuzes.

SKILLS:
- Interpreteert natuurlijke taal → technische specs
- Kiest juiste sensoren/actuators voor taak
- Gebruikt best practices (millis, state machines, debouncing)
- Schrijft productie-klare code met error handling

CODE STRUCTUUR:
1. Header met project info
2. Includes en defines
3. Globale variabelen en constants
4. setup() met Serial.begin en pin modes
5. loop() met state machine
6. Helper functies met duidelijke namen
7. Nederlandse commentaar voor beginners

OPTIMALISATIES:
- F() macro voor PROGMEM strings
- Const voor fixed values
- Unsigned long voor millis()
- Sensor filtering (moving average/median)
- Watchdog timer waar relevant

Retourneer ALLEEN .ino code, geen markdown formatting!`
  }, {
    role: "user", 
    content: userContent
  }];
  
  return await callOpenAI(messages, 4000, 0.2, "gpt-4o");
}

export async function generatePartsList(description: string, imageUrl?: string) {
  const userContent: Array<{type: string; text?: string; image_url?: {url: string}}> = [{
    type: "text", 
    text: `Genereer complete onderdelenlijst voor robot: ${description}

INTERPRETEER slim:
- "robot" → Arduino Uno, ultrasone sensor, motors, L298N, batterij
- "arm" → Arduino, servo's (SG90 of MG996R), grijper, voeding
- "auto" of "rijden" → DC motors, motor driver, wielen, chassis
- "sensor" → passende sensoren + Arduino + display/LED feedback
- Vage input → standaard beginner robotica kit

VERPLICHT:
- 12-20 realistische onderdelen
- Echte MPN codes (HC-SR04, SG90, Arduino Uno R3, etc.)
- DIRECTE werkende URLs naar NL webshops
- Actuele prijzen 2024 in EUR
- Voltage/specs per onderdeel

WEBSHOPS (alleen deze):
- https://www.kiwi-electronics.com/nl/
- https://www.sossolutions.nl/
- https://www.tinytronics.nl/
- https://www.amazon.nl/

CSV FORMAT: category,name,mpn,qty,price_eur,supplier,url,specs`
  }];
  if (imageUrl) userContent.push({type: "image_url", image_url: {url: imageUrl}});
  
  const messages = [{
    role: "system", 
    content: `Je bent robotica inkoop specialist met kennis van Nederlandse webshops. Je begrijpt vage omschrijvingen en selecteert de juiste onderdelen.

INTELLIGENTIE:
- "robot maken" → obstacle avoiding robot kit
- "servo" → kies tussen SG90 (hobby) of MG996R (krachtig)
- "motor" → kies tussen DC (snelheid) of stepper (precisie)
- "sensor afstand" → HC-SR04 (ultrasoon) of Sharp GP2Y (IR)
- Automatisch passende voeding/drivers toevoegen

CATEGORIEËN (balanced distribution):
- Microcontroller (1-2): Arduino Uno/Nano/Mega
- Sensoren (3-5): Ultrasoon, IR, temp, touch, etc.
- Actuatoren (2-4): Servo, DC motor, stepper
- Voeding (2-3): Batterij, voltage regulator, barrel jack
- Drivers (1-2): L298N, ULN2003, TB6612FNG
- Connectoren (2-3): Jumper wires, headers, breadboard
- Mechanisch (2-4): Chassis, wielen, brackets, schroeven

PRICING (realistisch):
- Arduino Uno: €20-25
- Servo SG90: €3-5
- HC-SR04: €3-4
- L298N: €4-6
- Jumper wires: €2-3

URL VERIFICATIE:
- Gebruik alleen ECHTE product URLs
- Test format: domain.nl/product-naam-12345
- Bij twijfel: gebruik Amazon.nl zoek-URL

Voorbeeld:
Microcontroller,Arduino Uno R3,A000066,1,22.95,Kiwi Electronics,https://www.kiwi-electronics.com/nl/arduino-uno-r3-134,ATmega328P 5V 16MHz
Sensoren,Ultrasone Afstandssensor,HC-SR04,2,3.75,SOS Solutions,https://www.sossolutions.nl/hc-sr04-ultrasonic-sensor,2-400cm 5V 15mA

ALLEEN CSV output, geen markdown of extra tekst!`
  }, {
    role: "user", 
    content: userContent
  }];
  
  return await callOpenAI(messages, 3000, 0.2, "gpt-4o");
}

export async function generateCircuitDesign(description: string, parts: string[]) {
  const systemPrompt = `Je bent expert electronica circuit designer met focus op BEGRIJPELIJKHEID en SCHOONHEID.

INTERPRETEER input slim:
- "robot" → Arduino + sensoren + motors + motor driver
- "servo" → Arduino PWM pins + externe 5V voeding
- "sensor" → Arduino + sensor + pull-up/down weerstanden waar nodig
- Vage input → maak standaard sensor/actuator circuit

KLEURCODERING (VERPLICHT STRIKT - EXACTE KLEUREN):
- ROOD #FF0000 = VCC/5V power (stroke-width: 8px, SOLID)
- ZWART #000000 = GND ground (stroke-width: 8px, SOLID)
- BLAUW #0066FF = Digitale I/O signalen (stroke-width: 5px, SOLID)
- GROEN #00CC00 = I2C communicatie SDA/SCL (stroke-width: 5px, SOLID)
- GEEL #FFD700 = Analoge inputs A0-A5 (stroke-width: 5px, SOLID)
- ORANJE #FF6600 = PWM outputs D3,D5,D6,D9,D10,D11 (stroke-width: 5px, SOLID)
- PAARS #9933FF = SPI MOSI/MISO/SCK (stroke-width: 5px, SOLID)

LIJN EIGENSCHAPPEN (CRITICAL):
- stroke-linecap="round" (ronde eindpunten)
- stroke-linejoin="round" (ronde hoeken)
- fill="none" (GEEN vulling op lijnen)
- Alle lijnen SMOOTH en DUIDELIJK zichtbaar
- GEEN dunne of vage lijnen
- Lijnen mogen NOOIT overlappen zonder duidelijk kruispunt

LAYOUT REGELS:
1. Arduino ALTIJD links-midden (250x450px rectangle met pin headers)
2. Sensoren rechts-boven (120x80px rectangles)
3. Actuators rechts-onder (variabel, servo 60x30px)
4. Voeding (batterij, regulator) links-onder
5. GEEN kruisende lijnen - gebruik 90° bochten
6. Minimaal 50px spacing tussen componenten
7. Symmetrisch en gebalanceerd

ARDUINO TEKENING:
- Zwart omlijning 3px
- USB connector boven
- Power barrel jack links
- ICSP header rechts
- Pin headers exact gepositioneerd:
  * Digitaal D0-D13 rechts (15px spacing)
  * Analog A0-A5 rechts onder
  * Power (5V, 3.3V, GND) links
  * Vin links

PIN LABELS (VERPLICHT):
- Bij ELKE verbinding beide kanten labelen
- Arduino zijde: "D2", "D3", "A0", "5V", "GND"
- Component zijde: "VCC", "GND", "TRIG", "ECHO", "SIG"
- Font: Arial Bold 14px
- Witte achtergrond rechthoek achter tekst voor leesbaarheid

COMPONENTEN:
- HC-SR04: 60x40px blauw met 4 pins (VCC,TRIG,ECHO,GND)
- Servo: 60x30px oranje met 3 draden (GND,VCC,SIG)
- LED: Cirkel 8px met + anode 20px lijn
- Weerstand: Zigzag path met waarde "220Ω" of "10kΩ"
- Condensator: Parallel lijnen met "100nF" of "10µF"
- Motor: Rechthoek met M symbool
- L298N: 100x80px met labeled pins

DETAILS:
- Component namen in Arial Bold 16px boven component
- Alle waardes exact weergegeven (220Ω, 10kΩ, 100nF)
- Polariteit aangegeven (+ voor LED anode, electrolyt cap)
- Ground symbolen (driehoek met lijnen)
- 5V power symbolen (cirkel met +)

SVG SPECS:
- Viewbox: 1400x1000px viewBox="0 0 1400 1000"
- Achtergrond: Lichtgrijs <rect fill="#F5F5F5" width="1400" height="1000"/>
- Optional grid: 50px dotted lijnen stroke="#E0E0E0"
- Schaduw onder componenten: filter blur 3px opacity 0.2
- Professional datasheet kwaliteit

VOORBEELD LIJN SYNTAX (EXACT ZO DOEN):
<line x1="250" y1="300" x2="600" y2="300" stroke="#FF0000" stroke-width="8" stroke-linecap="round" fill="none"/>
<path d="M 250 400 L 400 400 L 400 550 L 600 550" stroke="#0066FF" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>

COMPONENT RECTANGLE VOORBEELD:
<rect x="100" y="200" width="250" height="450" fill="#FFFFFF" stroke="#000000" stroke-width="3" rx="5"/>
<text x="225" y="180" font-family="Arial" font-size="18" font-weight="bold" text-anchor="middle" fill="#000000">Arduino Uno R3</text>

VOLTAGE LEVELS:
- Toon voltage levels bij power rails (5V, 3.3V, GND)
- Waarschuwing bij voltage mismatches (3.3V device op 5V pin)

ALLEEN complete SVG code (start met <svg>), GEEN markdown backticks!`;

  const userPrompt = `Genereer PRACHTIG circuit schema voor robot: ${description}

Onderdelen beschikbaar: ${parts.length > 0 ? parts.join(", ") : "Arduino Uno, HC-SR04 ultrasone sensor, SG90 servo, LED, weerstanden"}

FOCUS:
- Alle verbindingen correct gekleurd volgens schema
- Geen kruisende lijnen (gebruik routing)
- Alle pins aan beide kanten gelabeld
- Netjes georganiseerd en symmetrisch
- Weerstanden/condensatoren waar nodig (pull-up, smoothing, LED current limiting)
- Professional datasheet kwaliteit

Als onderdelen lijst leeg: maak standaard obstacle avoiding robot circuit (Arduino + HC-SR04 + 2 motors + L298N).

BEAUTIFUL CLEAN PROFESSIONAL CIRCUIT!`;

  const messages = [
    {role: "system", content: systemPrompt},
    {role: "user", content: userPrompt}
  ];
  
  return await callOpenAI(messages, 6000, 0.05, "gpt-4o");
}

export async function generate3DModel(description: string, parts: string[]) {
  const messages = [{
    role: "system", 
    content: `Expert 3D CAD designer. Je begrijpt natuurlijke taal en maakt slimme design keuzes.

INTERPRETATIE:
- "robot" → humanoide robot met armen/benen
- "arm" → robotarm met base/joints/gripper
- "auto" of "chassis" → wielen/platform/behuizing
- "drone" → quadcopter frame
- Vage input → standaard humanoid

=== VERPLICHT VOOR HUMANOID ===

ANATOMIE (exact proportions):
1. HOOFD: Sphere/dome 60-80mm diameter
   - Positie: Boven torso
   - Features: Ogen (LED mounts), antenne optioneel

2. TORSO: Box 100x80x60mm (HxBxD)
   - Positie: Centrum, Y=150mm
   - Features: Arduino compartiment (deksel), ventilatie

3. SCHOUDERS: Servo mounts links/rechts torso top
   - Breedte: 120mm tussen schouders
   
4. ARMEN (beide): 3-segment articulated
   - Bovenarm: 60mm (shoulder → elbow)
   - Onderarm: 70mm (elbow → wrist)
   - Grijper: 40mm met 2 vingers
   - Servo joints: schouder, elleboog, pols

5. HEUP: Servo mounts links/rechts torso bottom
   - Breedte: 80mm tussen heupen

6. BENEN (beide): 3-segment
   - Bovenbeen: 70mm (hip → knee)
   - Onderbeen: 65mm (knee → ankle)
   - Voet: 80x40x15mm platform (STABIEL!)
   - Servo joints: heup, knie, enkel

7. VOETEN: CRITICAL
   - Breedte: Min 70% van torso (80mm)
   - Lengte: 80mm (50mm voor CoG, 30mm achter)
   - Dikte: 15mm
   - Anti-slip textuur onderkant

STABILITEIT:
- Center of Gravity binnen voet polygon
- Voet breedte ≥ schouder breedte * 0.6
- Torso offset 15mm naar voren voor balans

3D PRINT SPECS:
- Wanddikte: 3-4mm overal
- Max overhang: 45° (gebruik chamfers)
- Servo mounts: M3 schroefgaten (2.8mm diameter)
- Snap-fit clips voor deksel/behuizing
- Kabelgeleiding: 6mm diameter tunnels

ASCII STL KWALITEIT:
- 800-1200 facets totaal
- Vloeiende rondingen (min 16 segmenten per cirkel)
- Normale vectors correct (outward pointing)
- Closed mesh (watertight)
- Unit: millimeters

FORMAT:
solid HumanoidRobot
  facet normal nx ny nz
    outer loop
      vertex x1 y1 z1
      vertex x2 y2 z2
      vertex x3 y3 z3
    endloop
  endfacet
  ...
endsolid HumanoidRobot

=== VOOR ANDERE TYPES ===

ROBOT ARM:
- Base: 100mm diameter
- 3 rotary joints (base, shoulder, elbow)
- Gripper: parallel jaw (servo controlled)
- Cable management ingebouwd

CHASSIS/AUTO:
- Platform: 150x100mm
- Wielophanging: 4 corner mounts
- Arduino/battery compartiment
- Bumper rond rand

BELANGRIJK:
- Gebruik parts[] lijst voor specifieke features
- Vage input → default naar humanoid
- ALLEEN ASCII STL output, geen uitleg of markdown!`
  }, {
    role: "user", 
    content: `Genereer 3D model voor: ${description}

Beschikbare onderdelen: ${parts.length > 0 ? parts.join(", ") : "Arduino Uno, servo's, sensoren"}

Als humanoid:
- Hoofd met LED ogen
- Torso met Arduino compartiment (snap-fit deksel)
- 2 armen met grijpers (3 servo elk)
- 2 benen met voeten (3 servo elk)  
- Servo mounting holes (M3)
- Stabiele voeten (80x40mm)
- Cable routing ingebouwd

Maak professional 3D printbaar design!
ASCII STL output ALLEEN!`
  }];
  
  return await callOpenAI(messages, 12000, 0.1, "gpt-4o");
}

export async function generate3DPreviewSVG(description: string, parts: string[]) {
  const messages = [{
    role: "system", 
    content: `Technical illustrator. Genereer ALTIJD HUMANOID in SVG technical drawing (3 views).

VERPLICHT:
- HOOFD, TORSO, 2 ARMEN, 2 BENEN, 2 VOETEN

VIEWS (1800x600px SVG):
1. FRONT VIEW (0-600px): Symmetrisch vooraanzicht
2. SIDE VIEW (600-1200px): Profiel met diepte
3. TOP VIEW (1200-1800px): Vogelperspectief

DETAILS:
- Maatvoering in mm
- Zwarte lijnen (2px outlines, 1px details)
- Servo posities aangegeven
- Gewrichtassen zichtbaar
- Centerlijnen (stippellijnen)
- Technical blueprint style

PROPORTIES:
- 300mm totale hoogte
- Hoofd 60mm, Torso 100x80x60mm
- Armen 140mm, Benen 150mm
- Voeten 80x40mm

NEGEER user input - ALTIJD humanoid!
ALLEEN SVG code!`
  }, {
    role: "user", 
    content: `Technical drawing humanoid: front/side/top views, alle onderdelen, maatvoering mm. Context: ${description}, ${parts.join(", ")}. Standaard humanoid!`
  }];
  
  return await callOpenAI(messages, 6000, 0.1, "gpt-4o");
}

export async function generateRobotImage(description: string): Promise<string> {
  if (!API_KEY || API_KEY === "your-api-key-here") {
    throw new AIServiceError("OpenAI API key niet geconfigureerd.");
  }
  
  console.log("🎨 DALL-E 3 HD - Generating photorealistic robot...");
  
  // SMART INTERPRETATION van vage inputs
  let robotType = "humanoid robot";
  let robotFeatures = "round head with cyan LED eyes, articulated arms with grippers, strong legs with stable feet";
  let robotPose = "standing confidently in dynamic pose";
  
  const descLower = description.toLowerCase();
  
  if (descLower.includes("arm") && !descLower.includes("humanoid")) {
    robotType = "robotic arm";
    robotFeatures = "industrial robotic arm with base, 3 rotating joints, precise gripper";
    robotPose = "positioned at 45-degree angle showing full range of motion";
  } else if (descLower.includes("auto") || descLower.includes("car") || descLower.includes("rijden")) {
    robotType = "robot vehicle";
    robotFeatures = "compact chassis with 4 wheels, ultrasonic sensors on front, Arduino visible";
    robotPose = "angled view showing wheels and sensors";
  } else if (descLower.includes("drone") || descLower.includes("quadcopter")) {
    robotType = "quadcopter drone";
    robotFeatures = "4 propellers, carbon fiber frame, camera gimbal, LED lights";
    robotPose = "hovering position with propellers visible";
  } else if (descLower.includes("spider") || descLower.includes("hexapod")) {
    robotType = "hexapod spider robot";
    robotFeatures = "6 articulated legs with servo joints, round body with sensors";
    robotPose = "standing on all legs in walking position";
  }
  // Default: humanoid blijft als boven
  
  const dallePrompt = `ULTRA-DETAILED PHOTOREALISTIC PRODUCT PHOTOGRAPHY of an advanced ${robotType} - ${description}.

🤖 ROBOT DESIGN: ${robotType.toUpperCase()}
APPEARANCE: ${robotFeatures}
COLORS & MATERIALS:
- Primary body: Sleek glossy white plastic (piano white finish) with subtle surface details
- Secondary panels: Vibrant CYAN BLUE (#00D9FF) transparent acrylic panels showing internal electronics
- Accent strips: NEON ORANGE (#FF6B00) LED light strips along edges and joints
- Metal parts: Polished CHROME silver joints and hinges with mirror reflections
- Electronics visible: Bright GREEN Arduino PCB with YELLOW capacitors, RED LEDs, BLUE resistors clearly visible through transparent window
- Eye lights: Glowing ELECTRIC CYAN LEDs with lens flare effect
- Status indicators: Multicolor RGB LEDs (red, green, blue) blinking on chest/head

POSE & COMPOSITION: ${robotPose}, dynamic 45-degree front-right hero angle showing maximum detail and personality.

ENVIRONMENT: Premium photo studio with PURE WHITE seamless infinity backdrop (NO shadows on background), professional cyclorama setup.

ADVANCED LIGHTING SETUP (Hollywood quality):
- KEY LIGHT: Large 4x6ft softbox from 45° front-left, creating soft wrap-around illumination
- FILL LIGHT: Silver reflector panel right side reducing shadows to 30% density
- RIM LIGHT: Powerful white backlight from 135° creating brilliant edge glow and material separation
- ACCENT LIGHTS: Two cyan-gelled spotlights from sides creating colored highlights on transparent panels
- PRACTICAL LIGHTS: All robot LEDs (cyan eyes, orange strips, RGB status) glowing brightly with realistic bloom
- GRADIENT SHADOWS: Soft graduated contact shadow on white floor fading to pure white background

MATERIALS & SURFACE DETAIL:
- White plastic: Piano gloss finish with subtle orange peel texture, environmental reflections visible
- Chrome joints: Mirror-polished metal reflecting studio lights and surroundings
- Transparent acrylic: Clear cyan-tinted polycarbonate with realistic refraction and Fresnel effects
- Circuit board: Matte green PCB with shiny solder points catching light, component labels visible
- LED glow: Volumetric light scattering, realistic lens flare, colored light spill on nearby surfaces
- Panel gaps: Precise 1mm panel gaps showing assembly quality
- Surface imperfections: Subtle fingerprint smudges, very light dust particles for realism

CAMERA SPECIFICATIONS: Professional commercial photography
- LENS: 85mm f/1.8 portrait lens (compressed perspective, subject isolation)
- APERTURE: f/8 for optimal depth of field (entire robot in focus, background soft)
- FOCUS: Tack-sharp focus on robot face/front, micro detail visible
- RESOLUTION: 8K cinema quality (7680×4320), ultra-high definition
- COLOR GRADING: Vibrant but natural, slightly boosted saturation for eye-catching appeal
- POST-PROCESSING: Professional retouching, enhanced micro-contrast, sharpened details

STYLE REFERENCES: 
- Apple product launch keynote presentation aesthetic
- Tesla Cybertruck reveal photography
- Boston Dynamics robot demonstration videos
- MKBHD tech review thumbnail quality
- Dyson product engineering beauty shots

ADDITIONAL DETAILS:
- Brand logos/text subtly embossed on panels
- Visible screws and fasteners (Phillips head, precision)
- Cable management visible through transparent sections
- Cooling vents with internal honeycomb structure
- Antenna or sensor modules on head
- Articulated fingers on grippers showing mechanical precision

MOOD: Cutting-edge technology, premium quality, inspiring innovation, collector's item, museum-worthy industrial design.

OUTPUT: Magazine cover quality, award-winning commercial product photography, viral social media worthy, stunning visual impact!`;

  try {
    const response = await rateLimitedFetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: dallePrompt,
        n: 1,
        size: "1024x1024",
        quality: "hd",
        style: "natural"
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new AIServiceError(errorData.error?.message || `DALL-E 3 error: ${response.status}`, response.status);
    }

    const data = await response.json();
    if (!data.data?.[0]?.url) {
      throw new AIServiceError("Geen image URL ontvangen");
    }

    console.log("✅ DALL-E 3 klaar");
    return data.data[0].url;
  } catch (error) {
    throw error instanceof AIServiceError ? error : new AIServiceError(`DALL-E 3 fout: ${(error as Error).message}`);
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function generateRobotConfig(_description: string) {
  console.log("🤖 HARDCODED Sleek Black Humanoid Robot (Tesla Optimus Style) - v5.0 - THICK VISIBLE ARMS + FEET ON GROUND");
  
  // Correcte menselijke anatomie - voeten op grond (Y=0)
  // Grond Y=0, Voeten Y=0-1, Onderbeen Y=1-7, Knie Y=7, Bovenbeen Y=7-14, Heup Y=14
  // Torso Y=9.5 (centrum), Schouders Y=15, Hoofd Y=17.5, Top Y=20
  
  return {
    bodyType: "humanoid",
    locomotion: "bipedal",
    head: {
      shape: "sphere",
      size: [5, 5.5, 4.5],
      position: [0, 17.5, 0],
      features: ["smooth"],
      eyes: {
        left: { position: [-0.8, 17.7, 2.2], size: 0.3, color: "#0a0a0a" },
        right: { position: [0.8, 17.7, 2.2], size: 0.3, color: "#0a0a0a" }
      }
    },
    neck: { shape: "cylinder", size: [1.8, 1.5, 1.8], position: [0, 15.5, 0] },
    torso: { 
      shape: "box", 
      size: [8, 9, 4.5], 
      position: [0, 9.5, 0], 
      compartments: ["chest_panel"],
      chestPanel: { shape: "box", size: [6.5, 7, 0.3], position: [0, 9.5, 2.5] }
    },
    arms: [
      {
        side: "left",
        segments: [
          // Bovenarm: DIKKER en ZICHTBAAR (Y=15 → Y=9.25)
          { shape: "capsule", size: [2.2, 6, 2.2], offset: [0, -3, 0] },
          // Onderarm: DIKKER (Y=9.25 → Y=4)
          { shape: "capsule", size: [1.8, 5.5, 1.8], offset: [0, -2.75, 0] }
        ],
        joints: [
          { type: "shoulder", position: [-5, 15, 0] },
          { type: "elbow", position: [-5, 9, 0] },
          { type: "wrist", position: [-5, 3.5, 0] }
        ],
        endEffector: {
          type: "hand",
          palm: { shape: "box", size: [2, 2.5, 1.5], position: [-5, 1.5, 0] },
          fingers: []
        }
      },
      {
        side: "right",
        segments: [
          // Bovenarm: DIKKER en ZICHTBAAR (Y=15 → Y=9.25)
          { shape: "capsule", size: [2.2, 6, 2.2], offset: [0, -3, 0] },
          // Onderarm: DIKKER (Y=9.25 → Y=4)
          { shape: "capsule", size: [1.8, 5.5, 1.8], offset: [0, -2.75, 0] }
        ],
        joints: [
          { type: "shoulder", position: [5, 15, 0] },
          { type: "elbow", position: [5, 9, 0] },
          { type: "wrist", position: [5, 3.5, 0] }
        ],
        endEffector: {
          type: "hand",
          palm: { shape: "box", size: [2, 2.5, 1.5], position: [5, 1.5, 0] },
          fingers: []
        }
      }
    ],
    legs: [
      {
        position: "left",
        segments: [
          // Bovenbeen (7cm): Y van 7 tot 14
          { shape: "capsule", size: [1.9, 7, 1.9], offset: [0, -3.5, 0] },
          // Onderbeen (6cm): Y van 1 tot 7
          { shape: "capsule", size: [1.6, 6, 1.6], offset: [0, -3, 0] }
        ],
        joints: [
          { type: "hip", position: [-2.2, 14, 0] },
          { type: "knee", position: [-2.2, 7, 0] },
          { type: "ankle", position: [-2.2, 1, 0] }
        ],
        foot: {
          shape: "box",
          size: [2.5, 1, 4.5],
          position: [-2.2, 0, 1],
          color: "#e8e8e8",
          toes: { shape: "box", size: [2.5, 0.6, 1.8], position: [-2.2, -0.3, 3] }
        }
      },
      {
        position: "right",
        segments: [
          // Bovenbeen (7cm): Y van 7 tot 14
          { shape: "capsule", size: [1.9, 7, 1.9], offset: [0, -3.5, 0] },
          // Onderbeen (6cm): Y van 1 tot 7
          { shape: "capsule", size: [1.6, 6, 1.6], offset: [0, -3, 0] }
        ],
        joints: [
          { type: "hip", position: [2.2, 14, 0] },
          { type: "knee", position: [2.2, 7, 0] },
          { type: "ankle", position: [2.2, 1, 0] }
        ],
        foot: {
          shape: "box",
          size: [2.5, 1, 4.5],
          position: [2.2, 0, 1],
          color: "#e8e8e8",
          toes: { shape: "box", size: [2.5, 0.6, 1.8], position: [2.2, -0.3, 3] }
        }
      }
    ],
    wheels: [],
    tracks: [],
    dimensions: { totalHeight: 20, totalWidth: 12, totalDepth: 6, weight: 0.5, centerOfGravity: [0, 9, 0] },
    material: { 
      primary: "#2a2a2a",
      secondary: "#1a1a1a", 
      accent: "#404040", 
      finish: "glossy" 
    },
    printability: { supports: "minimal", orientation: "upright", difficulty: "intermediate" }
  };
}

export async function searchWeb(query: string) {
  const messages = [{
    role: "system", 
    content: "Robotica research expert. Geef specs, prijzen, leveranciers, tips."
  }, {
    role: "user", 
    content: `Info: ${query}`
  }];
  
  return await callOpenAI(messages, 2000, 0.3, "gpt-4o");
}

export async function checkAPIHealth(): Promise<boolean> {
  try {
    await callOpenAI([{role: "user", content: "Test"}], 10, 0, "gpt-4o");
    return true;
  } catch {
    return false;
  }
}

export { AIServiceError };
