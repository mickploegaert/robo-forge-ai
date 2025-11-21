// RobotConfigurator component
"use client";
import { useState } from 'react';
import { generateArduinoCode, generateCircuitDesign, generate3DModel, generate3DPreviewSVG, generateRobotImage } from '../services/ai';
import { Bot, Code, CircuitBoard, Box, Loader2, Download, ExternalLink, ImageIcon } from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';

// Dynamically import 3D viewer to avoid SSR issues
const Robot3DViewer = dynamic(() => import('./AIRobot3DViewer'), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] bg-gray-900 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-300">AI Robot Generator wordt geladen...</p>
      </div>
    </div>
  )
});

// Dynamically import circuit viewer
const CircuitViewer = dynamic(() => import('./CircuitViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] bg-gray-100 rounded-lg flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  )
});

// Voeg lokale helper toe voor downloads
function downloadTextFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function RobotConfigurator() {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [result, setResult] = useState<{
    arduinoCode: string;
    circuitDesign: string;
    stlModel: string;
    previewSvg: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const [arduinoCode, circuitDesign, stlModel, previewSvg] = await Promise.all([
        generateArduinoCode(description),
        generateCircuitDesign(description, []),
        generate3DModel(description, []),
        generate3DPreviewSVG(description, []),
      ]);
      setResult({ arduinoCode, circuitDesign, stlModel, previewSvg });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!description) return;
    setLoadingImage(true);
    try {
      const imageUrl = await generateRobotImage(description);
      setGeneratedImage(imageUrl);
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Fout bij genereren van afbeelding. Check de console voor details.');
    } finally {
      setLoadingImage(false);
    }
  };

  return (
    <section className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Input Section */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-black">Design Your Robot</h2>
            <p className="text-black">
              Describe your robot&apos;s requirements and our AI will generate a complete design including Arduino code, circuit design, and 3D model.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-40 p-4 border border-black rounded-lg focus:ring-2 focus:ring-black focus:border-black bg-white text-black"
                placeholder="Describe your robot (e.g., &apos;A line-following robot with obstacle detection&apos;)"
              />
              <button
                type="submit"
                disabled={loading || !description}
                className="w-full bg-black text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-white hover:text-black border border-black disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Bot className="h-5 w-5" />
                    Generate Design
                  </>
                )}
              </button>
              
              {/* FREE Image Generator Button */}
              <button
                type="button"
                onClick={handleGenerateImage}
                disabled={loadingImage || !description}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl"
              >
                {loadingImage ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Generating Image...
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-5 w-5" />
                    🎨 Generate Robot Image (FREE)
                  </>
                )}
              </button>
            </form>
            
            {/* Generated Image Display */}
            {generatedImage && (
              <div className="mt-6 bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border-2 border-green-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-black">AI Generated Robot Image (FREE)</h3>
                  </div>
                  <a
                    href={generatedImage}
                    download="robot-image.svg"
                    className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </a>
                </div>
                <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-2xl bg-gray-800">
                  <Image
                    src={generatedImage}
                    alt="AI Generated Robot"
                    fill
                    className="object-contain"
                    priority
                    unoptimized
                  />
                </div>
                <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg">
                  <p className="text-sm text-green-900">
                    <strong>✨ FREE Robot Generator:</strong> Unique robot avatar based on your description - instant and completely free!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* 3D Robot Model Preview - Always visible when description exists */}
            {description && (
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-lg border-2 border-gray-700 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Box className="h-5 w-5 text-blue-400" />
                    <h3 className="font-semibold text-white">3D Robot Preview</h3>
                  </div>
                  {result && (
                    <button
                      onClick={() => downloadTextFile('robot.stl', result.stlModel, 'model/stl')}
                      className="px-3 py-2 border border-blue-500 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-2"
                      title="Download STL"
                    >
                      <Download className="h-4 w-4" />
                      Download STL
                    </button>
                  )}
                </div>
                
                {/* Interactive 3D Robot Viewer */}
                <Robot3DViewer description={description} />
                
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-700 rounded-lg backdrop-blur-sm">
                  <h4 className="font-semibold text-blue-200 mb-2">✨ 3D Model Features:</h4>
                  <ul className="text-sm text-blue-100 space-y-1">
                    <li>• Realistische robot met dynamische componenten</li>
                    <li>• Automatische generatie gebaseerd op beschrijving</li>
                    <li>• Volledig interactief - roteer, zoom en verplaats</li>
                    <li>• Professionele belichting en schaduwen</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Circuit Design Preview - Always visible when description exists */}
            {description && (
              <div className="bg-white p-6 rounded-lg border border-black">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <CircuitBoard className="h-5 w-5 text-black" />
                    <h3 className="font-semibold text-black">Circuit Design Preview</h3>
                  </div>
                  <div className="flex gap-2">
                    {result && (
                      <button
                        onClick={() => downloadTextFile('circuit.svg', result.circuitDesign, 'image/svg+xml')}
                        className="px-3 py-2 border border-black rounded-md bg-white text-black hover:bg-black hover:text-white transition flex items-center gap-2"
                        title="Download Circuit SVG"
                      >
                        <Download className="h-4 w-4" />
                        Download SVG
                      </button>
                    )}
                    <button
                      onClick={() => window.open('https://www.tinkercad.com/circuits', '_blank')}
                      className="px-3 py-2 border border-black rounded-md bg-white text-black hover:bg-black hover:text-white transition flex items-center gap-2"
                      title="Open in Tinkercad"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open in Tinkercad
                    </button>
                  </div>
                </div>
                <CircuitViewer description={description} />
              </div>
            )}

            {/* Arduino Code - Only when generated */}
            {result && (
              <div className="bg-white p-6 rounded-lg border border-black">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Code className="h-5 w-5 text-black" />
                    <h3 className="font-semibold text-black">Arduino Code</h3>
                  </div>
                  <button
                    onClick={() => downloadTextFile('robot.ino', result.arduinoCode, 'text/x-arduino')}
                    className="px-3 py-2 border border-black rounded-md bg-white text-black hover:bg-black hover:text-white transition flex items-center gap-2"
                    title="Download .ino"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                </div>
                <pre className="bg-gray-50 text-black p-4 rounded overflow-x-auto border border-gray-300 max-h-96">
                  <code>{result.arduinoCode}</code>
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}