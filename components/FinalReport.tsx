import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Room } from '../types';
import { ICONS } from '../constants';

interface Props {
  plan: string;
  rooms: Room[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
}

const FinalReport: React.FC<Props> = ({ plan, rooms, setRooms }) => {
  const [activeTab, setActiveTab] = React.useState<'docs' | 'visuals'>('docs');

  const handleDownloadImage = (dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    // 1. Obtener el contenido HTML limpio que ya tenemos renderizado en el bloque oculto
    const printContent = document.getElementById('printable-content');
    
    if (!printContent) {
        alert("Error: No se encontró el contenido del reporte.");
        return;
    }

    // 2. Abrir una nueva ventana limpia
    const win = window.open('', '_blank', 'height=800,width=1000');
    
    if (!win) {
        alert("El navegador bloqueó la ventana emergente. Por favor permite pop-ups para descargar el PDF.");
        return;
    }

    // 3. Escribir el documento completo
    win.document.write('<!DOCTYPE html><html><head><title>Informe Técnico de Obra</title>');
    
    // Inyectar Tailwind CSS para mantener los estilos
    win.document.write('<script src="https://cdn.tailwindcss.com"></script>');
    
    // Estilos extra para asegurar formato de impresión A4
    win.document.write(`
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');
        body { 
            font-family: 'Inter', sans-serif; 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact; 
            background: white;
            padding: 20px;
        }
        @page { size: A4; margin: 15mm; }
        
        /* Ajustes específicos para Markdown en la ventana de impresión */
        h1 { color: #8C2C39 !important; border-bottom: 2px solid #8C2C39; padding-bottom: 10px; margin-bottom: 20px; font-size: 24px; font-weight: bold; }
        h2 { color: #8C2C39 !important; margin-top: 30px; margin-bottom: 15px; font-size: 20px; font-weight: bold; }
        h3 { color: #8C2C39 !important; margin-top: 20px; margin-bottom: 10px; font-size: 16px; font-weight: 600; }
        ul { list-style-type: disc; padding-left: 20px; margin-bottom: 10px; }
        li { margin-bottom: 4px; font-size: 12px; }
        p { margin-bottom: 10px; text-align: justify; font-size: 12px; }
        strong { font-weight: bold; color: #1e293b; }
        
        .break-before-page { page-break-before: always; }
        img { max-width: 100%; height: auto; display: block; }
      </style>
    `);
    
    win.document.write('</head><body>');
    // Copiar el contenido HTML del div oculto
    win.document.write(printContent.innerHTML);
    win.document.write('</body></html>');
    
    win.document.close();
    win.focus();

    // 4. Esperar un momento a que carguen las imágenes y estilos antes de imprimir
    setTimeout(() => {
        win.print();
        // Opcional: Cerrar ventana después de imprimir (algunos navegadores lo bloquean si el usuario cancela)
        // win.close(); 
    }, 1000);
  };

  // Generación de estilos específicos para Markdown (usados en el render oculto)
  const markdownComponents = {
    h1: ({node, ...props}: any) => <h1 className="text-2xl font-bold text-[#8C2C39] border-b-2 border-[#8C2C39] pb-2 mb-4 mt-6" {...props} />,
    h2: ({node, ...props}: any) => <h2 className="text-xl font-bold text-[#8C2C39] mt-6 mb-3" {...props} />,
    h3: ({node, ...props}: any) => <h3 className="text-lg font-semibold text-[#8C2C39] mt-4 mb-2" {...props} />,
    ul: ({node, ...props}: any) => <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />,
    li: ({node, ...props}: any) => <li className="text-sm leading-relaxed" {...props} />,
    p: ({node, ...props}: any) => <p className="mb-3 text-sm leading-relaxed text-justify" {...props} />,
    strong: ({node, ...props}: any) => <strong className="font-bold text-slate-800" {...props} />,
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      
      {/* =================================================================================
          VISTA DE PANTALLA (INTERACTIVA)
      ================================================================================== */}
      <div>
        
        {/* Header Tabs */}
        <div className="flex justify-center mb-8 border-b border-slate-200">
            <button
            onClick={() => setActiveTab('docs')}
            className={`px-6 py-3 font-medium flex items-center gap-2 border-b-2 transition ${
                activeTab === 'docs' ? 'border-[#8C2C39] text-[#8C2C39]' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
            >
            <ICONS.ClipboardList className="w-5 h-5" /> Informe Técnico de Obra
            </button>
            <button
            onClick={() => setActiveTab('visuals')}
            className={`px-6 py-3 font-medium flex items-center gap-2 border-b-2 transition ${
                activeTab === 'visuals' ? 'border-[#8C2C39] text-[#8C2C39]' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
            >
            <ICONS.Image className="w-5 h-5" /> Galería Visual
            </button>
        </div>

        {/* Content Tabs */}
        <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 min-h-[500px]">
            {activeTab === 'docs' && (
                <div className="markdown-content prose prose-slate max-w-none prose-headings:text-[#8C2C39]">
                    <ReactMarkdown>{plan}</ReactMarkdown>
                </div>
            )}

            {activeTab === 'visuals' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {rooms.map(room => (
                        <div key={room.id} className="bg-slate-50 rounded-xl overflow-hidden shadow border border-slate-200">
                            <div className="p-3 bg-[#8C2C39] text-white font-bold">
                                {room.name}
                            </div>
                            <div className="p-4 space-y-4">
                                {room.generatedImages && room.generatedImages.length > 0 ? (
                                    room.generatedImages.map((genImg, idx) => {
                                        if (!genImg) return null;
                                        return (
                                            <div key={idx} className="relative group">
                                                <p className="text-xs font-bold text-slate-500 mb-1 uppercase">Perspectiva {idx + 1}</p>
                                                <div className="grid grid-cols-2 gap-2 h-32">
                                                    <img src={room.images[idx].data} className="w-full h-full object-cover rounded" alt="Ant" />
                                                    <img src={genImg} className="w-full h-full object-cover rounded shadow-inner" alt="Desp" />
                                                </div>
                                                <button 
                                                    onClick={() => handleDownloadImage(genImg, `${room.name}-${idx+1}.jpg`)}
                                                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow opacity-0 group-hover:opacity-100 transition hover:scale-110"
                                                    title="Descargar Imagen"
                                                >
                                                    <ICONS.Download className="w-5 h-5 text-[#8C2C39]" />
                                                </button>
                                            </div>
                                        )
                                    })
                                ) : (
                                    <p className="text-center text-slate-400 py-8 italic">Sin imágenes generadas</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Floating Print Button */}
        <div className="fixed bottom-8 right-8 z-50">
            <button 
            className="flex items-center gap-2 bg-slate-800 text-white px-8 py-4 rounded-full hover:bg-slate-900 transition font-bold shadow-2xl hover:scale-105 active:scale-95"
            onClick={handlePrint}
            >
                <ICONS.Download className="w-5 h-5" /> Descargar PDF / Imprimir
            </button>
        </div>
      </div>

      {/* =================================================================================
          CONTENIDO OCULTO PARA IMPRESIÓN (FUENTE DE DATOS)
          Este div contiene el HTML limpio que se copiará a la ventana emergente.
          Usamos 'hidden' para que no se vea en la app, pero existe en el DOM.
      ================================================================================== */}
      <div id="printable-content" className="hidden">
          <div className="max-w-3xl mx-auto pt-4">
              
              {/* Encabezado Impreso */}
              <div className="border-b-4 border-[#8C2C39] pb-4 mb-8 flex justify-between items-center">
                  <div>
                      <h1 className="text-3xl font-bold text-slate-900 mb-1" style={{border: 'none', marginBottom: '5px'}}>INFORME TÉCNICO DE OBRA</h1>
                      <p className="text-sm text-slate-500 mt-0">Generado por Flipping Master IA</p>
                  </div>
                  <div className="text-right text-xs text-slate-400">
                      Fecha: {new Date().toLocaleDateString()}
                  </div>
              </div>

              {/* A. TEXT REPORT */}
              <div className="prose max-w-none text-slate-900">
                <ReactMarkdown components={markdownComponents}>{plan}</ReactMarkdown>
              </div>

              {/* B. PAGE BREAK */}
              <div className="break-before-page mt-12 block h-1"></div>

              {/* C. VISUAL GALLERY HEADER */}
              <div className="mt-8 mb-6 border-b-2 border-[#8C2C39] pb-2">
                  <h2 className="text-2xl font-bold text-[#8C2C39] mb-2">Galería Visual de Proyecto</h2>
                  <p className="text-sm text-slate-500">Visualización fotorrealista de las intervenciones propuestas.</p>
              </div>

              {/* D. GALLERY GRID */}
              <div className="grid grid-cols-2 gap-8">
                  {rooms.map(room => {
                      const hasRenders = room.generatedImages && room.generatedImages.some(img => img !== null);
                      if (!hasRenders) return null;

                      return (
                          <div key={room.id} className="border border-slate-300 rounded-lg overflow-hidden break-inside-avoid shadow-none mb-6">
                              <div className="bg-[#8C2C39] text-white p-2 font-bold text-center text-lg">
                                  {room.name}
                              </div>
                              <div className="p-4 bg-white">
                                  {room.generatedImages.map((genImg, idx) => {
                                      if (!genImg) return null;
                                      return (
                                          <div key={idx} className="flex flex-col gap-2 mb-6 last:mb-0">
                                              <div className="flex justify-between text-xs font-bold text-slate-600 uppercase px-1">
                                                  <span>Estado Actual</span>
                                                  <span>Propuesta</span>
                                              </div>
                                              <div className="grid grid-cols-2 gap-2 h-40">
                                                  <img src={room.images[idx].data} className="w-full h-full object-cover border border-slate-200" alt="Antes" />
                                                  <img src={genImg} className="w-full h-full object-cover border border-slate-200" alt="Después" />
                                              </div>
                                          </div>
                                      )
                                  })}
                              </div>
                          </div>
                      );
                  })}
              </div>
              
              <div className="mt-12 pt-4 border-t border-slate-300 text-center text-[10px] text-slate-400">
                  Documento generado automáticamente por tecnología Flipping Master IA.<br/>
                  La validación técnica final es responsabilidad del usuario.
              </div>
          </div>
      </div>

    </div>
  );
};

export default FinalReport;