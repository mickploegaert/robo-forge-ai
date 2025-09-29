"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Cpu, Code2, Download, GitCompare, Save, Trash2, Menu, X, Github, Linkedin, Mail, ShoppingCart, Wrench, Layers, FileDown, Loader2 } from "lucide-react";

type Part = {
  mpn: string;
  manufacturer?: string;
  image?: string;
  specs?: { name: string; value: string }[];
  sellers?: { name: string; url?: string; price?: string }[];
};

type BuildConfig = {
  id: string;
  name: string;
  parts: Part[];
};

export default function Home() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "ROBO Forge AI";
  const bannerVideo = process.env.NEXT_PUBLIC_BANNER_VIDEO_URL || "/banner.mp4";
  const [canPlay, setCanPlay] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const tryPlay = async () => {
      try {
        await v.play();
      } catch {
        // ignore; user gesture might be required on some browsers
      }
    };
    const onLoaded = () => tryPlay();
    v.addEventListener("loadedmetadata", onLoaded);
    // attempt once on mount too
    tryPlay();
    return () => {
      v.removeEventListener("loadedmetadata", onLoaded);
    };
  }, [bannerVideo]);
  const [navOpen, setNavOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Part[]>([]);

  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [codeLoading, setCodeLoading] = useState(false);
  const [conceptImageUrl, setConceptImageUrl] = useState<string>("");

  const [configs, setConfigs] = useState<BuildConfig[]>([]);
  const [activeConfigId, setActiveConfigId] = useState<string>("");

  // Load/save to localStorage
  useEffect(() => {
    const data = localStorage.getItem("rfai.configs");
    if (data) {
      const parsed: BuildConfig[] = JSON.parse(data);
      setConfigs(parsed);
      if (parsed[0]) setActiveConfigId(parsed[0].id);
    } else {
      const initial: BuildConfig = { id: crypto.randomUUID(), name: "Mijn Robot", parts: [] };
      setConfigs([initial]);
      setActiveConfigId(initial.id);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("rfai.configs", JSON.stringify(configs));
  }, [configs]);

  const activeConfig = useMemo(() => configs.find(c => c.id === activeConfigId) ?? null, [configs, activeConfigId]);

  async function onSearch() {
    setLoading(true);
    try {
      const resp = await fetch("/api/parts", { method: "POST", body: JSON.stringify({ query }), headers: { "Content-Type": "application/json" } });
      const json = await resp.json();
      const items = (json?.data?.supSearch?.results ?? []).map((r: any): Part => ({
        mpn: r.part?.mpn,
        manufacturer: r.part?.manufacturer?.name,
        image: r.part?.bestImage?.url,
        specs: (r.part?.specs ?? []).slice(0, 6).map((s: any) => ({ name: s.attribute?.name, value: s.displayValue })),
        sellers: (r.part?.sellers ?? []).map((s: any) => ({
          name: s.company?.name,
          url: s.offers?.[0]?.clickUrl,
          price: s.offers?.[0]?.prices?.[0] ? `${s.offers[0].prices[0].price} ${s.offers[0].prices[0].currency}` : undefined,
        })),
      }));
      setResults(items);
    } finally {
      setLoading(false);
    }
  }

  function onImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setConceptImageUrl(url);
  }

  function addPartToConfig(part: Part) {
    if (!activeConfig) return;
    setConfigs(cfgs => cfgs.map(c => c.id === activeConfig.id ? { ...c, parts: [...c.parts, part] } : c));
  }

  function removePartFromConfig(index: number) {
    if (!activeConfig) return;
    setConfigs(cfgs => cfgs.map(c => c.id === activeConfig.id ? { ...c, parts: c.parts.filter((_, i) => i !== index) } : c));
  }

  function newConfig() {
    const nc: BuildConfig = { id: crypto.randomUUID(), name: `Configuratie ${configs.length + 1}`, parts: [] };
    setConfigs(cfgs => [nc, ...cfgs]);
    setActiveConfigId(nc.id);
  }

  function deleteConfig(id: string) {
    setConfigs(cfgs => cfgs.filter(c => c.id !== id));
    if (activeConfigId === id && configs[1]) setActiveConfigId(configs[1].id);
  }

  async function generateCode() {
    setCodeLoading(true);
    try {
      const desc = description || `Robot met ${activeConfig?.parts.length ?? 0} onderdelen`;
      const resp = await fetch("/api/codegen", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ description: desc }) });
      const json = await resp.json();
      setCode(json.code || "");
    } finally {
      setCodeLoading(false);
    }
  }

  function downloadCode() {
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "robot.ino";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-20 border-b border-black bg-white/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/robo forge.png" alt="ROBO Forge AI" className="h-10 w-10 rounded" />
              <span className="font-semibold tracking-tight">{appName}</span>
              <span className="pill hidden sm:inline">Robot Builder AI</span>
            </div>
            <nav className="hidden sm:flex items-center gap-6 text-sm">
              <a href="#hero" className="link-underline">Home</a>
              <a href="#requirements" className="link-underline">Eisen</a>
              <a href="#input" className="link-underline">Input</a>
              <a href="#results" className="link-underline">Resultaten</a>
            </nav>
            <button aria-label="Toggle menu" onClick={() => setNavOpen(v => !v)} className="sm:hidden h-9 w-9 grid place-items-center border border-black rounded">
              {navOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {navOpen && (
          <div className="sm:hidden border-t border-black bg-white">
            <nav className="max-w-7xl mx-auto px-4 py-3 grid gap-3 text-sm">
              <a onClick={() => setNavOpen(false)} href="#hero" className="link-underline">Home</a>
              <a onClick={() => setNavOpen(false)} href="#requirements" className="link-underline">Eisen</a>
              <a onClick={() => setNavOpen(false)} href="#input" className="link-underline">Input</a>
              <a onClick={() => setNavOpen(false)} href="#results" className="link-underline">Resultaten</a>
            </nav>
          </div>
        )}
      </header>

      <section id="hero" className="relative section overflow-hidden">
        {/* Background video or image */}
        <div className="absolute inset-0">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          {canPlay ? (
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster="/banner.jpg"
              onError={() => setCanPlay(false)}
            >
              <source src={bannerVideo} type="video/mp4" />
            </video>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/banner.jpg" alt="Banner" className="h-full w-full object-cover" />
          )}
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 text-white">
          <div className="pill mb-4 inline-block bg-white/10 text-white border-white">ROBO Forge AI</div>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight max-w-4xl">Plan, ontwerp en bouw sneller robots met een AI‑assistent.</h1>
          <p className="mt-4 text-white/85 max-w-2xl text-base">Geef een tekst of conceptafbeelding. Krijg directe onderdelenlijsten, bedrading, Arduino‑code en 3D‑behuizing‑placeholders. Open‑source onderdelen eerst (Pi, Arduino, micro:bit).</p>
          <div className="mt-8 flex gap-3">
            <a href="#input" className="btn btn-black px-5 py-2.5 rounded flex items-center gap-2"><Wrench className="h-4 w-4"/>Start nu</a>
            <a href="#requirements" className="btn btn-outline px-5 py-2.5 rounded flex items-center gap-2 border-white text-white"><Layers className="h-4 w-4"/>Bekijk eisen</a>
          </div>
        </div>
      </section>

      <section id="requirements" className="section">
        <div className="max-w-7xl mx-auto px-4 py-14 grid gap-6">
          <h2 className="text-xl font-semibold tracking-wide uppercase">Samenvatting eisen klant</h2>
          <ul className="grid sm:grid-cols-2 gap-3 text-sm">
            <li className="p-3 rounded card">Concept → lijst benodigde onderdelen (open-source opties: Pi, Arduino, micro:bit).</li>
            <li className="p-3 rounded card">Namen, specificaties, actuele kooplinks met afbeeldingen.</li>
            <li className="p-3 rounded card">Automatisch Arduino voorbeeldcode, direct te downloaden.</li>
            <li className="p-3 rounded card">Optimalisatiesuggesties (energie, snelheid) — toekomstige uitbreiding.</li>
            <li className="p-3 rounded card">Vergelijking tussen configuraties (prijs/prestaties) — toekomstige uitbreiding.</li>
            <li className="p-3 rounded card">Stap‑voor‑stap montage & bedradingsinstructies met afbeeldingen.</li>
            <li className="p-3 rounded card">Community‑sectie voor delen van configuraties — toekomstige uitbreiding.</li>
            <li className="p-3 rounded card">Opslaan van projectprofielen met onderdelen & code.</li>
          </ul>
        </div>
      </section>

      <main id="input" className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 space-y-4">
          <div className="rounded-xl card bg-white p-5">
            <div className="text-sm font-medium mb-2">Concept input (afbeelding of tekst)</div>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="flex flex-col gap-2 text-sm">
                <span className="text-slate-600">Upload front/side view</span>
                <input type="file" accept="image/*" onChange={onImageChange} className="text-xs" />
                {conceptImageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={conceptImageUrl} alt="Concept" className="mt-2 rounded border max-h-56 object-contain" />
                )}
              </label>
              <label className="flex flex-col gap-2 text-sm">
                <span className="text-slate-600">Of beschrijf in tekst</span>
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Bijv: Robot met wielen die objecten kan dragen, max A4-formaat..." className="w-full h-32 rounded border p-2 text-sm" />
              </label>
            </div>
          </div>
          <div className="rounded-xl card bg-white p-5">
            <div className="flex gap-2 items-center">
              <Search className="h-5 w-5 text-slate-500" />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Zoek onderdelen (bv. DC motor 12V)" className="flex-1 outline-none bg-transparent" />
              <button onClick={onSearch} disabled={loading} className="btn btn-black px-3 py-1.5 rounded-md disabled:opacity-50 flex items-center gap-2">{loading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Search className="h-4 w-4"/>}{loading ? "Zoeken..." : "Zoeken"}</button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {loading && (
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={`sk-${idx}`} className="rounded-xl card bg-white p-4 flex gap-4 animate-pulse">
                  <div className="h-20 w-20 rounded bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-2/3" />
                    <div className="h-3 bg-slate-200 rounded w-1/3" />
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-3 bg-slate-200 rounded" />
                      <div className="h-3 bg-slate-200 rounded" />
                    </div>
                    <div className="flex gap-2">
                      <div className="h-6 w-20 bg-slate-200 rounded" />
                      <div className="h-6 w-24 bg-slate-200 rounded" />
                    </div>
                    <div className="h-7 w-40 bg-slate-200 rounded" />
                  </div>
                </div>
              ))
            )}
            {!loading && results.map((p, idx) => (
              <div key={idx} className="rounded-xl card bg-white p-4 flex gap-4 transition-transform hover:-translate-y-0.5">
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image} alt={p.mpn} className="h-20 w-20 object-contain rounded" />
                ) : (
                  <div className="h-20 w-20 bg-slate-100 rounded" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{p.mpn}</div>
                  <div className="text-xs text-slate-500 mb-2">{p.manufacturer}</div>
                  <div className="text-xs grid grid-cols-2 gap-1 mb-2">
                    {(p.specs || []).map((s, i) => (
                      <div key={i} className="truncate"><span className="text-slate-500">{s.name}:</span> {s.value}</div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(p.sellers || []).map((s, i) => (
                      <a key={i} href={s.url} target="_blank" rel="noreferrer" className="text-xs px-2 py-1 rounded btn-outline flex items-center gap-1">
                        <ShoppingCart className="h-3.5 w-3.5"/> {s.name}{s.price ? ` · ${s.price}` : ""}
                      </a>
                    ))}
                  </div>
                   <button onClick={() => addPartToConfig(p)} className="text-xs px-2 py-1 rounded btn-black flex items-center gap-1"><Layers className="h-3.5 w-3.5"/>Toevoegen</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-xl card bg-white p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">Configuraties</div>
              <button onClick={newConfig} className="text-xs px-2 py-1 rounded btn-outline flex items-center gap-1"><Layers className="h-3.5 w-3.5"/>Nieuw</button>
            </div>
            <div className="space-y-2">
              {configs.map(c => (
                <div key={c.id} className={`flex items-center justify-between text-sm px-2 py-1 rounded ${c.id === activeConfigId ? "bg-slate-100" : ""}`}>
                  <button onClick={() => setActiveConfigId(c.id)} className="text-left truncate flex-1">{c.name}</button>
                  <button onClick={() => deleteConfig(c.id)} className="ml-2 text-slate-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-black bg-white p-4">
            <div className="font-medium mb-2">Onderdelen in configuratie</div>
            <div className="space-y-2">
              {activeConfig?.parts.map((p, i) => (
                <div key={i} className="text-sm flex items-center justify-between">
                  <span className="truncate">{p.mpn}</span>
                  <button onClick={() => removePartFromConfig(i)} className="text-slate-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl card bg-white p-5 space-y-2" id="results">
            <div className="flex items-center gap-2">
              <Code2 className="h-5 w-5 text-slate-500" />
              <div className="font-medium">Arduino code generator</div>
            </div>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Beschrijf je robot (sensoren, motoren, pins, gedrag)" className="w-full h-24 rounded border border-black p-2 text-sm" />
            <div className="flex gap-2">
              <button onClick={generateCode} disabled={codeLoading} className="btn btn-black px-3 py-1.5 rounded disabled:opacity-50 flex items-center gap-2">{codeLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Code2 className="h-4 w-4"/>}{codeLoading ? "Genereert..." : "Genereer"}</button>
              <button onClick={downloadCode} disabled={!code} className="btn btn-outline px-3 py-1.5 rounded flex items-center gap-2"><FileDown className="h-4 w-4"/>Download</button>
            </div>
            {code && (
              <pre className="max-h-64 overflow-auto bg-slate-950 text-slate-100 text-xs p-3 rounded"><code>{code}</code></pre>
            )}
          </div>

          

          <div className="rounded-xl card bg-white p-5 space-y-2">
            <div className="font-medium mb-1">Wiring / Circuit ontwerp (placeholder)</div>
            <p className="text-sm text-slate-600">Hier komt automatisch gegenereerde bedrading met pinmapping, schema-afbeeldingen en stappenplan. Integratie met EDA-tools is een vervolgstap.</p>
            <div className="h-40 rounded border border-black border-dashed grid place-items-center text-xs text-slate-500">Schema preview</div>
          </div>

          <div className="rounded-xl card bg-white p-5 space-y-2">
            <div className="font-medium mb-1">3D modellen voor behuizing (placeholder)</div>
            <p className="text-sm text-slate-600">Automatisch gegenereerde behuizing (STL/STEP) op basis van onderdelen en formaatrestricties (bijv. max A4). Export en slicing volgen als uitbreiding.</p>
            <div className="h-40 rounded border border-black border-dashed grid place-items-center text-xs text-slate-500">3D preview</div>
          </div>

          <div className="rounded-xl border bg-white p-4">
            <div className="flex items-center gap-2 mb-2">
              <GitCompare className="h-5 w-5 text-slate-500" />
              <div className="font-medium">Vergelijk configuraties</div>
            </div>
            <div className="text-xs text-slate-600">Selecteer 2 configuraties om te vergelijken op aantal onderdelen en prijsindicaties (indien beschikbaar bij sellers).</div>
          </div>
        </aside>
      </main>

      <footer className="border-t border-black bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8 grid sm:grid-cols-3 gap-6 text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/robo forge.png" alt="ROBO Forge AI" className="h-10 w-10 rounded" />
              <span className="font-semibold">{appName}</span>
            </div>
            <p className="text-slate-600">AI‑planner voor robot prototypes: onderdelen, wiring, code en 3D behuizing.</p>
            <div className="text-xs text-slate-500">© 2025 ROBO Forge AI</div>
          </div>
          <div>
            <div className="font-medium mb-2">Snel naar</div>
            <div className="grid gap-2 text-sm">
              <a href="#hero" className="link-underline">Home</a>
              <a href="#requirements" className="link-underline">Eisen</a>
              <a href="#input" className="link-underline">Input</a>
              <a href="#results" className="link-underline">Resultaten</a>
            </div>
          </div>
          <div>
            <div className="font-medium mb-2">Contact</div>
            <div className="grid gap-2 text-sm">
              <a href="mailto:info@roboforge.ai" className="flex items-center gap-2 link-underline"><Mail className="h-4 w-4"/>info@roboforge.ai</a>
              <a href="https://github.com/" target="_blank" rel="noreferrer" className="flex items-center gap-2 link-underline"><Github className="h-4 w-4"/>GitHub</a>
              <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer" className="flex items-center gap-2 link-underline"><Linkedin className="h-4 w-4"/>LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
