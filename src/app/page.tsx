"use client";
import { useEffect, useMemo, useState } from "react";
import { Search, Code2, Download, Trash2, ShoppingCart, Layers, Loader2, CircuitBoard, Box } from "lucide-react";
import Image from "next/image";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Vision from "./components/Vision";
import Footer from "./components/Footer";
import { LoadingScreen } from "./components/LoadingScreen";
import { generateArduinoCode, generateCircuitDesign, generate3DModel, searchWeb, generatePartsList, generateRobotImage } from "./services/ai";
import { useLanguage } from "./context/LanguageContext";
import dynamic from 'next/dynamic';

// Dynamically import 3D viewer to avoid SSR issues
const Robot3DViewer = dynamic(() => import('./components/AIRobot3DViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-gray-900 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
        <p className="text-gray-300">AI Robot Generator wordt geladen...</p>
      </div>
    </div>
  )
});

type Part = {
  name?: string;
  mpn: string;
  manufacturer?: string;
  image?: string;
  link?: string;
  specs?: { name: string; value: string }[];
  sellers?: { name: string; url?: string; price?: string }[];
};

type BuildConfig = {
  id: string;
  name: string;
  parts: Part[];
};

export default function Home() {
  const { t } = useLanguage();
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "ROBO Forge AI";
  const [isClient, setIsClient] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);

  // States
  const [query, setQuery] = useState("");
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [results, setResults] = useState<Part[]>([]);
  const [webResults, setWebResults] = useState<string>("");
  const [partsList, setPartsList] = useState<string>("");
  const [partsLoading, setPartsLoading] = useState(false);

  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [codeLoading, setCodeLoading] = useState(false);
  const [conceptImageUrl, setConceptImageUrl] = useState<string>("");

  // Circuit and 3D model states
  const [circuitDesign, setCircuitDesign] = useState("");
  const [circuitLoading, setCircuitLoading] = useState(false);
  const [modelSpecs, setModelSpecs] = useState("");
  const [modelLoading, setModelLoading] = useState(false);
  
  // Image generator states
  const [loadingImage, setLoadingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const [configs, setConfigs] = useState<BuildConfig[]>([]);
  const [activeConfigId, setActiveConfigId] = useState<string>("");

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLoadingComplete = () => {
    setShowLoadingScreen(false);
  };

  // Load/save to localStorage
  useEffect(() => {
    if (!isClient) return;
    
    const data = localStorage.getItem("rfai.configs");
    if (data) {
      const parsed: BuildConfig[] = JSON.parse(data);
      setConfigs(parsed);
      if (parsed[0]) setActiveConfigId(parsed[0].id);
    } else {
      const initial: BuildConfig = { id: crypto.randomUUID(), name: t('config.new'), parts: [] };
      setConfigs([initial]);
      setActiveConfigId(initial.id);
    }
  }, [isClient, t]);

  useEffect(() => {
    if (isClient && configs.length > 0) {
      localStorage.setItem("rfai.configs", JSON.stringify(configs));
    }
  }, [configs, isClient]);

  const activeConfig = useMemo(() => configs.find(c => c.id === activeConfigId) ?? null, [configs, activeConfigId]);

  // Parse CSV parts list for table view
  function parseCsv(csv: string): { headers: string[]; rows: string[][] } | null {
    try {
      const lines = csv.trim().split(/\r?\n/).filter(Boolean);
      if (lines.length === 0) return null;
      const headers = lines[0].split(',').map(h => h.trim());
      const rows = lines.slice(1).map(line => line.split(',').map(c => c.trim()));
      return { headers, rows };
    } catch {
      return null;
    }
  }
  const partsTable = useMemo(() => partsList ? parseCsv(partsList) : null, [partsList]);
  const [priceSortAsc, setPriceSortAsc] = useState<boolean>(true);

  // Pretty labels and cell formatting for parts table
  function prettyHeaderLabel(raw: string): string {
    const key = raw.toLowerCase();
    const map: Record<string, string> = {
      category: 'Categorie',
      name: 'Onderdeel',
      mpn: 'MPN',
      qty: 'Aantal',
      price_eur: 'Prijs (€)',
      supplier: 'Leverancier',
      url: 'Link',
      voltage: 'Voltage',
      current: 'Stroom',
      notes: 'Notities'
    };
    return map[key] || raw;
  }

  function renderCell(header: string, value: string) {
    const key = header.toLowerCase();
    const safe = value || '';
    if (key === 'url' && safe) {
      return (
        <a 
          href={safe} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 underline hover:no-underline transition-colors"
        >
          🔗 Webshop Link
        </a>
      );
    }
    if (key === 'price_eur' && safe) {
      return <span className="font-semibold text-green-700">€{safe}</span>;
    }
    return <span>{safe || '-'}</span>;
  }

  async function onSearch() {
    if (!query.trim()) return;
    
    setLoadingSearch(true);
    try {
      const webSearchResults = await searchWeb(query);
      setWebResults(webSearchResults);
      
      // Enhanced mock results with better data
      const mockResults: Part[] = [
        {
          mpn: "Arduino Uno R3",
          name: "Arduino Uno R3",
          manufacturer: "Arduino",
          image: "/api/placeholder/100/100",
          specs: [
            { name: "Voltage", value: "5V" },
            { name: "Digital I/O", value: "14 pins" },
            { name: "Analog Inputs", value: "6" },
            { name: "Flash Memory", value: "32KB" }
          ],
          sellers: [
            { name: "Arduino Store", price: "€25.00", url: "https://store.arduino.cc/products/arduino-uno-rev3" },
            { name: "Amazon", price: "€22.99", url: "https://amazon.com" }
          ]
        },
        {
          mpn: "HC-SR04",
          name: "HC-SR04 Ultrasonic Sensor",
          manufacturer: "Generic",
          image: "/api/placeholder/100/100",
          specs: [
            { name: "Range", value: "2-400cm" },
            { name: "Voltage", value: "5V" },
            { name: "Current", value: "15mA" },
            { name: "Frequency", value: "40Hz" }
          ],
          sellers: [
            { name: "Electronics Shop", price: "€3.50", url: "https://example.com/hc-sr04" },
            { name: "AliExpress", price: "€2.99", url: "https://aliexpress.com" }
          ]
        },
        {
          mpn: "SG90 Servo",
          name: "TowerPro SG90 Micro Servo",
          manufacturer: "TowerPro",
          image: "/api/placeholder/100/100",
          specs: [
            { name: "Torque", value: "1.8kg/cm" },
            { name: "Speed", value: "0.1s/60°" },
            { name: "Voltage", value: "4.8-6V" },
            { name: "Weight", value: "9g" }
          ],
          sellers: [
            { name: "Servo City", price: "€8.99", url: "https://servocity.com" },
            { name: "RobotShop", price: "€7.50", url: "https://robotshop.com" }
          ]
        }
      ];
      setResults(mockResults);
    } catch (error) {
      console.error('Search error:', error);
      setWebResults(t('search.error') || "Er is een fout opgetreden bij het zoeken. Probeer het opnieuw.");
    } finally {
      setLoadingSearch(false);
    }
  }

  async function generateParts() {
    if (!description.trim()) return;
    
    setPartsLoading(true);
    try {
      const parts = await generatePartsList(description, conceptImageUrl);
      setPartsList(parts);
    } catch (error) {
      console.error('Parts generation error:', error);
      setPartsList("Er is een fout opgetreden bij het genereren van de onderdelenlijst. Controleer je API key en internetverbinding.");
    } finally {
      setPartsLoading(false);
    }
  }

  async function generateCode() {
    if (!description.trim()) return;
    
    setCodeLoading(true);
    try {
      const generatedCode = await generateArduinoCode(description, conceptImageUrl);
      setCode(generatedCode);
    } catch (error) {
      console.error('Code generation error:', error);
      setCode("// Er is een fout opgetreden bij het genereren van de code\n// Controleer je API key en internetverbinding en probeer opnieuw");
    } finally {
      setCodeLoading(false);
    }
  }

  async function generateCircuit() {
    if (!description.trim()) return;
    
    setCircuitLoading(true);
    try {
      const parts = activeConfig?.parts.map(p => p.mpn) || [];
      const svg = await generateCircuitDesign(description, parts);
      setCircuitDesign(svg);
    } catch (error) {
      console.error('Circuit generation error:', error);
      setCircuitDesign("Er is een fout opgetreden bij het genereren van het circuit ontwerp. Controleer je API key en probeer opnieuw.");
    } finally {
      setCircuitLoading(false);
    }
  }

  async function generate3D() {
    if (!description.trim()) return;
    
    setModelLoading(true);
    try {
      const parts = activeConfig?.parts.map(p => p.mpn) || [];
      const stl = await generate3DModel(description, parts);
      setModelSpecs(stl);
    } catch (error) {
      console.error('3D model generation error:', error);
      setModelSpecs("Er is een fout opgetreden bij het genereren van de 3D model specificaties. Controleer je API key en probeer opnieuw.");
    } finally {
      setModelLoading(false);
    }
  }

  async function handleGenerateImage() {
    if (!description.trim()) return;
    
    setLoadingImage(true);
    try {
      const imageUrl = await generateRobotImage(description);
      setGeneratedImage(imageUrl);
    } catch (error) {
      console.error('Image generation error:', error);
      alert('Fout bij genereren van afbeelding. Check de console voor details.');
    } finally {
      setLoadingImage(false);
    }
  }

  function downloadTextFile(filename: string, content: string, mime: string = 'text/plain') {
    if (!content) return;
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
    });
  }

  function addPartToConfig(part: Part) {
    if (!activeConfig) return;
    
    // Check if part already exists
    if (activeConfig.parts.some(p => p.mpn === part.mpn)) return;
    
    const updatedConfigs = configs.map(config => 
      config.id === activeConfigId 
        ? { ...config, parts: [...config.parts, part] }
        : config
    );
    setConfigs(updatedConfigs);
  }

  function removePartFromConfig(partMpn: string) {
    if (!activeConfig) return;
    
    const updatedConfigs = configs.map(config => 
      config.id === activeConfigId 
        ? { ...config, parts: config.parts.filter(p => p.mpn !== partMpn) }
        : config
    );
    setConfigs(updatedConfigs);
  }

  function createNewConfig() {
    const newConfig: BuildConfig = {
      id: crypto.randomUUID(),
      name: `${t('config.new')} ${configs.length + 1}`,
      parts: []
    };
    setConfigs([...configs, newConfig]);
    setActiveConfigId(newConfig.id);
  }

  function deleteConfig(configId: string) {
    if (configs.length <= 1) return;
    
    const updatedConfigs = configs.filter(c => c.id !== configId);
    setConfigs(updatedConfigs);
    
    if (activeConfigId === configId) {
      setActiveConfigId(updatedConfigs[0]?.id || "");
    }
  }

  return (
    <>
      {showLoadingScreen && <LoadingScreen onLoadingComplete={handleLoadingComplete} />}
      <div className="min-h-screen bg-white">
        <Navbar appName={appName} />
        <Hero />
        <Vision />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-16 space-y-16">
        
        {/* Concept Input Section */}
        <section id="input" className="animate-fade-in">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-black">{t('input.title')}</h2>
            <p className="text-black max-w-2xl mx-auto">
              {t('input.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Text Input */}
            <div className="space-y-4 animate-slide-right">
              <label className="block text-sm font-medium text-black">{t('input.title')}</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('input.placeholder')}
                className="w-full h-32 p-4 border border-black bg-white text-black rounded-lg focus:ring-2 focus:ring-black focus:border-black resize-none transition-all duration-300"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={generateParts}
                  disabled={partsLoading || !description.trim()}
                  className="btn btn-black btn-hover-effect"
                >
                  {partsLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t('loading.parts')}
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4" />
                      {t('input.generate.parts')}
                    </>
                  )}
                </button>

                <button
                  onClick={generateCode}
                  disabled={codeLoading || !description.trim()}
                  className="btn btn-outline btn-hover-effect"
                >
                  {codeLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t('loading.code')}
                    </>
                  ) : (
                    <>
                      <Code2 className="h-4 w-4" />
                      {t('input.generate.code')}
                    </>
                  )}
                </button>

                <button
                  onClick={generateCircuit}
                  disabled={circuitLoading || !description.trim()}
                  className="btn btn-outline btn-hover-effect"
                >
                  {circuitLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t('loading.circuit')}
                    </>
                  ) : (
                    <>
                      <CircuitBoard className="h-4 w-4" />
                      {t('input.generate.circuit')}
                    </>
                  )}
                </button>

                <button
                  onClick={generate3D}
                  disabled={modelLoading || !description.trim()}
                  className="btn btn-outline btn-hover-effect"
                >
                  {modelLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t('loading.model')}
                    </>
                  ) : (
                    <>
                      <Box className="h-4 w-4" />
                      {t('input.generate.model')}
                    </>
                  )}
                </button>

                <button
                  onClick={handleGenerateImage}
                  disabled={loadingImage || !description.trim()}
                  className="btn btn-outline btn-hover-effect col-span-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-purple-600 text-white"
                >
                  {loadingImage ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Afbeelding genereren...
                    </>
                  ) : (
                    <>
                      🎨 Genereer Robot Afbeelding (AI)
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Image Input */}
            <div className="space-y-4 animate-slide-left">
              <label className="block text-sm font-medium text-black">{t('input.image.label')}</label>
              <input
                type="url"
                value={conceptImageUrl}
                onChange={(e) => setConceptImageUrl(e.target.value)}
                placeholder={t('input.image.placeholder')}
                className="w-full p-4 border border-black bg-white text-black rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-300"
              />
              
              {conceptImageUrl && (
                <div className="border border-black rounded-lg p-4 animate-fade-in bg-white">
                  <Image 
                    src={conceptImageUrl} 
                    alt="Concept" 
                    width={800}
                    height={192}
                    className="w-full h-48 object-cover rounded-lg"
                    unoptimized
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Results Section */}
        <section id="results" className="space-y-8 text-black">
          {/* Generated Robot Image */}
          {generatedImage && (
            <div className="card p-6 animate-slide-up bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold flex items-center gap-2 text-black">
                  🎨 AI Gegenereerde Robot Afbeelding
                </h3>
                <button
                  onClick={() => downloadTextFile('robot-image.png', generatedImage, 'image/png')}
                  className="btn btn-black text-sm"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Image */}
                <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-2xl bg-gray-800">
                  <Image
                    src={generatedImage}
                    alt="AI Generated Robot"
                    width={1024}
                    height={1024}
                    className="w-full h-full object-contain"
                    unoptimized
                  />
                </div>
                
                {/* Description */}
                <div className="space-y-4">
                  <div className="p-4 bg-purple-100 border border-purple-300 rounded-lg">
                    <h4 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                      ✨ Over deze afbeelding
                    </h4>
                    <p className="text-sm text-purple-900">
                      Deze unieke robot visualisatie is gegenereerd door <strong>DALL-E 3</strong>, 
                      OpenAI&apos;s meest geavanceerde AI beeldgenerator.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-white border border-purple-300 rounded-lg">
                    <h4 className="font-bold text-black mb-3">📝 Jouw beschrijving:</h4>
                    <p className="text-sm text-gray-700 italic leading-relaxed">
                      {`"${description || 'Geen beschrijving opgegeven'}"`}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-300 rounded-lg">
                    <h4 className="font-bold text-black mb-3">🎯 AI Specificaties:</h4>
                    <ul className="text-sm text-gray-800 space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">•</span>
                        <span><strong>Model:</strong> DALL-E 3 (OpenAI)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">•</span>
                        <span><strong>Kwaliteit:</strong> HD (High Definition)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">•</span>
                        <span><strong>Resolutie:</strong> 1024x1024 pixels</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">•</span>
                        <span><strong>Stijl:</strong> Fotorealistisch, professionele fotografie met studio verlichting</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">•</span>
                        <span><strong>Kenmerken:</strong> 8K detail, heroïsche pose, gloeiende LED&apos;s, dramatische belichting</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-pink-100 border border-pink-300 rounded-lg">
                    <h4 className="font-bold text-black mb-2">💡 Tips:</h4>
                    <ul className="text-sm text-gray-800 space-y-1">
                      <li className="flex items-start gap-2">
                        <span className="text-pink-600">→</span>
                        <span>Gebruik specifieke details in je beschrijving voor betere resultaten</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-pink-600">→</span>
                        <span>Beschrijf materialen, kleuren en functionaliteit voor realistische beelden</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-pink-600">→</span>
                        <span>Download de afbeelding voor gebruik in presentaties of ontwerpdocumenten</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Parts List */}
          {partsList && (
            <div className="card p-6 animate-slide-up bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold flex items-center gap-2 text-black">
                  <ShoppingCart className="h-5 w-5" />
                  {t('results.parts.title')}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(partsList)}
                    className="btn btn-outline text-sm"
                  >
                    {t('results.copy')}
                  </button>
                  <button
                    onClick={() => downloadTextFile('parts_list.csv', partsList, 'text/csv')}
                    className="btn btn-black text-sm"
                  >
                    <Download className="h-4 w-4" />
                    {t('results.download')}
                  </button>
                </div>
              </div>
              {partsTable ? (
                <div className="overflow-auto border border-black rounded">
                  <table className="min-w-full text-sm">
                    <thead className="bg-white">
                      <tr>
                        {partsTable.headers.map((h, i) => {
                          const isPrice = (h || '').toLowerCase() === 'price_eur';
                          return (
                            <th
                              key={i}
                              className={`p-3 border-b border-black font-semibold ${isPrice ? 'text-right cursor-pointer select-none' : 'text-left'}`}
                              onClick={isPrice ? () => setPriceSortAsc(v => !v) : undefined}
                              title={isPrice ? 'Sorteer op prijs' : undefined}
                            >
                              <span className="inline-flex items-center gap-1">
                                {prettyHeaderLabel(h)}
                                {isPrice && (
                                  <span>{priceSortAsc ? '▲' : '▼'}</span>
                                )}
                              </span>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const priceIdx = partsTable.headers.findIndex(h => (h || '').toLowerCase() === 'price_eur');
                        const rows = [...partsTable.rows];
                        if (priceIdx >= 0) {
                          rows.sort((a, b) => {
                            const av = parseFloat((a[priceIdx] || '').replace(/[^0-9.,-]/g, '').replace(',', '.'));
                            const bv = parseFloat((b[priceIdx] || '').replace(/[^0-9.,-]/g, '').replace(',', '.'));
                            const an = isNaN(av) ? Infinity : av;
                            const bn = isNaN(bv) ? Infinity : bv;
                            return priceSortAsc ? an - bn : bn - an;
                          });
                        }
                        return rows.map((cols, rIdx) => (
                          <tr key={rIdx} className="hover:bg-gray-50">
                            {cols.map((col, cIdx) => {
                              const isPrice = (partsTable.headers[cIdx] || '').toLowerCase() === 'price_eur';
                              return (
                                <td key={cIdx} className={`p-3 border-b border-black align-top ${isPrice ? 'text-right' : ''}`}>
                                  {renderCell(partsTable.headers[cIdx] || '', col)}
                                </td>
                              );
                            })}
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              ) : (
                <pre className="bg-white p-4 rounded-lg overflow-auto text-sm whitespace-pre-wrap border border-black">
                  {partsList}
                </pre>
              )}
            </div>
          )}

          {/* Generated Code */}
          {code && (
            <div className="card p-6 animate-slide-up bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold flex items-center gap-2 text-black">
                  <Code2 className="h-5 w-5" />
                  {t('results.code.title')}
                </h3>
                <div className="flex gap-2">
                  <button onClick={() => copyToClipboard(code)} className="btn btn-outline text-sm">
                    {t('results.copy')}
                  </button>
                  <button onClick={() => downloadTextFile('robot_code.ino', code)} className="btn btn-black text-sm">
                    <Download className="h-4 w-4" />
                    {t('results.download')}
                  </button>
                </div>
              </div>
              <pre className="bg-white text-black p-4 rounded-lg overflow-auto text-sm border border-black">
                <code>{code}</code>
              </pre>
            </div>
          )}

          {/* Circuit Design */}
          {circuitDesign && (
            <div className="card p-6 animate-slide-up bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold flex items-center gap-2 text-black">
                  <CircuitBoard className="h-5 w-5" />
                  {t('results.circuit.title')}
                </h3>
                <div className="flex gap-2">
                  <button onClick={() => copyToClipboard(circuitDesign)} className="btn btn-outline text-sm">
                    {t('results.copy')}
                  </button>
                  <button onClick={() => downloadTextFile('circuit_diagram.svg', circuitDesign, 'image/svg+xml')} className="btn btn-black text-sm">
                    <Download className="h-4 w-4" />
                    {t('results.download')}
                  </button>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg overflow-auto border border-black" dangerouslySetInnerHTML={{ __html: circuitDesign }} />
            </div>
          )}

          {/* 3D Model - Interactive Viewer */}
          {modelSpecs && description && (
            <div className="card p-6 animate-slide-up bg-gradient-to-br from-gray-900 to-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold flex items-center gap-2 text-white">
                  <Box className="h-5 w-5" />
                  {t('results.model.title')} - Interactieve 3D Viewer
                </h3>
                <div className="flex gap-2">
                  <button onClick={() => downloadTextFile('robot_housing.stl', modelSpecs, 'model/stl')} className="btn bg-blue-600 hover:bg-blue-700 text-white text-sm border-blue-500">
                    <Download className="h-4 w-4" />
                    Download STL
                  </button>
                </div>
              </div>
              
              {/* Interactive 3D Robot Viewer */}
              <Robot3DViewer description={description} />
              
              <div className="mt-4 p-4 bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-700 rounded-lg backdrop-blur-sm">
                <h4 className="font-semibold text-blue-200 mb-2">✨ 3D Model Features:</h4>
                <ul className="text-sm text-blue-100 space-y-1">
                  <li>• Realistische robot gegenereerd op basis van jouw beschrijving</li>
                  <li>• Volledig interactief - gebruik je muis om te roteren, zoomen en verplaatsen</li>
                  <li>• Dynamische componenten (wielen, sensoren, armen) gebaseerd op functionaliteit</li>
                  <li>• Professionele belichting en schaduwen voor realistische weergave</li>
                  <li>• Download als STL bestand voor 3D printing</li>
                </ul>
              </div>
              
              {/* STL Code Details (collapsible) */}
              <details className="mt-4">
                <summary className="cursor-pointer font-medium text-white hover:text-blue-300 transition-colors">
                  📄 Bekijk STL Code Details
                </summary>
                <pre className="bg-gray-950 text-green-400 p-4 rounded-lg overflow-auto text-xs whitespace-pre-wrap border border-gray-700 mt-2 max-h-64">
                  {modelSpecs}
                </pre>
              </details>
            </div>
          )}
        </section>

        {/* Search Section */}
        <section id="search" className="space-y-8 text-black">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4 text-black">{t('search.title')}</h2>
            <p className="text-black max-w-2xl mx-auto">{t('search.subtitle')}</p>
          </div>

          <div className="flex gap-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('search.placeholder')}
              onKeyPress={(e) => e.key === 'Enter' && onSearch()}
              className="flex-1 p-4 border border-black bg-white text-black rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-300"
            />
            <button
              onClick={onSearch}
              disabled={loadingSearch}
              className="btn btn-black"
            >
              {loadingSearch ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {t('search.searching')}
                </>
              ) : (
                <>
                  <Search className="h-5 w-5" />
                  {t('search.button')}
                </>
              )}
            </button>
          </div>

          {/* Search Results */}
          {results.length > 0 && (
            <div className="grid md:grid-cols-2 gap-6">
              {results.map((part) => (
                <div key={part.mpn} className="border border-black rounded-lg p-4 bg-white text-black">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-black">{part.name || part.mpn}</h4>
                      <p className="text-sm text-black">MPN: {part.mpn}</p>
                      {part.sellers && part.sellers[0]?.url && (
                        <a
                          href={part.sellers[0].url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline underline-offset-4 text-black"
                        >
                          {part.sellers[0].name}
                        </a>
                      )}
                    </div>
                    <button
                      onClick={() => addPartToConfig(part)}
                      className="btn btn-outline"
                      title={t('search.add')}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      {t('search.add')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Web Search Results */}
          {webResults && (
            <div className="card p-6 bg-white text-black border border-black">
              <h3 className="text-xl font-semibold mb-4 text-black">{t('search.web.title')}</h3>
              <pre className="bg-white p-4 rounded-lg overflow-auto text-sm whitespace-pre-wrap border border-black text-black">
                {webResults}
              </pre>
            </div>
          )}
        </section>

        {/* Configuration Management */}
        <section id="config" className="space-y-8 text-black">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-black">{t('config.title')}</h2>
            <button onClick={createNewConfig} className="btn btn-black">
              <Layers className="h-5 w-5" />
              {t('config.new')}
            </button>
          </div>

          {/* Config Tabs */}
          <div className="flex flex-wrap gap-2">
            {configs.map((config) => {
              const isActive = activeConfigId === config.id;
              return (
                <button
                  key={config.id}
                  onClick={() => setActiveConfigId(config.id)}
                  className={`px-4 py-2 rounded-md border border-black transition-colors ${
                    isActive ? 'bg-black text-white' : 'bg-white text-black hover:bg-black hover:text-white'
                  }`}
                >
                  {config.name} ({config.parts.length} {t('config.parts')})
                </button>
              );
            })}
            {configs.length > 1 && activeConfigId && (
              <button
                onClick={() => deleteConfig(activeConfigId)}
                className="btn btn-outline"
                title={t('config.remove')}
              >
                <Trash2 className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Active Config Parts */}
          {activeConfig && (
            <div className="space-y-4">
              {activeConfig.parts.length === 0 ? (
                <div className="border border-black rounded-lg p-6 bg-white text-black">
                  {t('config.empty')}
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {activeConfig.parts.map((part) => (
                    <div key={part.mpn} className="border border-black rounded-lg p-4 bg-white text-black">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-black">{part.name}</h4>
                          <p className="text-sm text-black">MPN: {part.mpn}</p>
                          {part.link && (
                            <a
                              href={part.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline underline-offset-4 text-black"
                            >
                              {part.link}
                            </a>
                          )}
                        </div>
                        <button
                          onClick={() => removePartFromConfig(part.mpn)}
                          className="btn btn-outline"
                          title={t('config.remove')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <Footer appName={appName} />
    </div>
    </>
  );
}
