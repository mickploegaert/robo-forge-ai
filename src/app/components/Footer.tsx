import Image from 'next/image';
import { Github, Linkedin, Mail } from 'lucide-react';

export default function Footer({ appName }: { appName: string }) {
  return (
    <footer className="border-t border-black/10 bg-white text-black">
      <div className="max-w-7xl mx-auto px-4 py-10 grid sm:grid-cols-3 gap-6 text-sm">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 rounded-full overflow-hidden border border-black/10 bg-white/60">
              <Image src="/robo forge.png" alt="ROBO Forge AI" fill className="object-contain p-2" />
            </div>
            <div>
              <div className="font-semibold">{appName}</div>
              <div className="text-xs text-black/60">AI‑planner voor robot prototypes</div>
            </div>
          </div>
          <p className="text-black/80">Ontwerp onderdelen, bedradingen, Arduino code en 3D-behuizingen met één workflow.</p>
          <div className="text-xs text-black/60">© 2025 ROBO Forge AI</div>
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
          <div className="font-medium mb-2">Contact & Socials</div>
          <div className="flex gap-3 items-center">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="p-2 rounded border border-black/10 hover:bg-black/5">
              <Github className="h-5 w-5" />
            </a>
            <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" className="p-2 rounded border border-black/10 hover:bg-black/5">
              <Linkedin className="h-5 w-5" />
            </a>
            <a href="mailto:" className="p-2 rounded border border-black/10 hover:bg-black/5">
              <Mail className="h-5 w-5" />
            </a>
          </div>
          <div className="mt-4 text-xs text-black/70">Made with care · Print-ready robot designs</div>
        </div>
      </div>
    </footer>
  );
}