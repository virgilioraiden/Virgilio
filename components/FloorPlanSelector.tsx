import React, { useState } from 'react';
import { FileData } from '../types';
import { ICONS } from '../constants';

interface Props {
  onComplete: (data: {
    hasPlan: boolean;
    floorPlanCurrent: FileData | null;
    floorPlanRemodel: FileData | null;
    listingDescription: string;
    listingImage: FileData | null;
  }) => void;
}

const FloorPlanSelector: React.FC<Props> = ({ onComplete }) => {
  const [floorPlanCurrent, setFloorPlanCurrent] = useState<FileData | null>(null);
  const [floorPlanRemodel, setFloorPlanRemodel] = useState<FileData | null>(null);
  const [listingImage, setListingImage] = useState<FileData | null>(null);
  const [listingText, setListingText] = useState('');
  const [contextTab, setContextTab] = useState<'text' | 'image'>('text');

  const handleFileRead = (file: File) => {
    return new Promise<FileData>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                resolve({
                    id: crypto.randomUUID(),
                    data: event.target.result as string,
                    mimeType: file.type
                });
            }
        };
        reader.readAsDataURL(file);
    });
  };

  const handleFloorPlanCurrentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const data = await handleFileRead(file);
        setFloorPlanCurrent(data);
    }
  };

  const handleFloorPlanRemodelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const data = await handleFileRead(file);
        setFloorPlanRemodel(data);
    }
  };

  const handleListingImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const data = await handleFileRead(file);
        setListingImage(data);
    }
  };

  const handleContinue = () => {
    onComplete({
        hasPlan: !!floorPlanCurrent,
        floorPlanCurrent: floorPlanCurrent,
        floorPlanRemodel: floorPlanRemodel,
        listingDescription: listingText,
        listingImage: listingImage
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 mt-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Planos y Contexto</h2>
        <p className="text-slate-500 mt-2">
            Sube los planos para que la IA detecte demoliciones y obras nuevas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Columna Izquierda: Planos */}
          <div className="space-y-4">
              
              {/* Plano Estado Actual */}
              <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                    <ICONS.Map className="w-5 h-5 text-slate-500" />
                    <h3 className="font-bold text-base text-slate-800">A. Plano Estado Actual</h3>
                </div>
                <label className={`block w-full cursor-pointer border-2 border-dashed rounded-xl p-4 text-center transition flex flex-col items-center justify-center ${floorPlanCurrent ? 'border-green-500 bg-green-50' : 'border-slate-300 hover:bg-slate-50'}`}>
                    {!floorPlanCurrent ? (
                        <>
                        <ICONS.Image className="w-6 h-6 mx-auto text-slate-400 mb-1" />
                        <span className="block font-medium text-slate-600 text-xs">Subir plano actual</span>
                        </>
                    ) : (
                        <div className="flex items-center gap-2 text-green-700 font-bold text-sm">
                            <ICONS.CheckCircle className="w-4 h-4" /> Listo
                        </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleFloorPlanCurrentUpload} />
                </label>
              </div>

              {/* Plano Proyecto */}
              <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-[#8C2C39] text-white text-[10px] px-2 py-1 font-bold rounded-bl">RECOMENDADO</div>
                <div className="flex items-center gap-2 mb-2">
                    <ICONS.Hammer className="w-5 h-5 text-[#8C2C39]" />
                    <h3 className="font-bold text-base text-[#8C2C39]">B. Plano Proyecto / Reforma</h3>
                </div>
                <p className="text-xs text-slate-500 mb-3">Si subes el proyecto, la IA comparará ambos para detectar demoliciones y muros nuevos.</p>
                <label className={`block w-full cursor-pointer border-2 border-dashed rounded-xl p-4 text-center transition flex flex-col items-center justify-center ${floorPlanRemodel ? 'border-[#8C2C39] bg-[#8C2C39]/10' : 'border-[#8C2C39]/30 hover:bg-[#8C2C39]/5'}`}>
                    {!floorPlanRemodel ? (
                        <>
                        <ICONS.Image className="w-6 h-6 mx-auto text-[#8C2C39]/50 mb-1" />
                        <span className="block font-medium text-[#8C2C39] text-xs">Subir plano reforma</span>
                        </>
                    ) : (
                        <div className="flex items-center gap-2 text-[#8C2C39] font-bold text-sm">
                            <ICONS.CheckCircle className="w-4 h-4" /> Listo
                        </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleFloorPlanRemodelUpload} />
                </label>
              </div>

          </div>

          {/* Columna Derecha: Contexto del Aviso */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 flex flex-col">
             <div className="flex items-center gap-2 mb-4">
                 <ICONS.FileText className="w-6 h-6 text-[#8C2C39]" />
                 <h3 className="font-bold text-lg text-slate-800">C. Información del Aviso</h3>
             </div>

             {/* Tabs */}
             <div className="flex border-b border-slate-200 mb-4">
                 <button 
                    onClick={() => setContextTab('text')}
                    className={`flex-1 py-2 text-sm font-medium transition ${contextTab === 'text' ? 'text-[#8C2C39] border-b-2 border-[#8C2C39]' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                    Pegar Texto
                 </button>
                 <button 
                    onClick={() => setContextTab('image')}
                    className={`flex-1 py-2 text-sm font-medium transition ${contextTab === 'image' ? 'text-[#8C2C39] border-b-2 border-[#8C2C39]' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                    Subir Captura
                 </button>
             </div>

             <div className="flex-1">
                 {contextTab === 'text' ? (
                     <textarea 
                        className="w-full h-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#8C2C39] outline-none resize-none min-h-[150px]"
                        placeholder="Pega aquí la descripción del portal inmobiliario (ej: 'Muy luminoso, a reciclar, cañerías nuevas...')"
                        value={listingText}
                        onChange={(e) => setListingText(e.target.value)}
                     />
                 ) : (
                    <label className={`block w-full cursor-pointer border-2 border-dashed rounded-xl p-8 text-center transition h-full min-h-[150px] flex flex-col items-center justify-center ${listingImage ? 'border-[#8C2C39] bg-[#8C2C39]/5' : 'border-slate-300 hover:bg-slate-50'}`}>
                        {!listingImage ? (
                            <>
                            <ICONS.Camera className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                            <span className="block font-medium text-slate-700 text-sm">Subir captura del aviso</span>
                            </>
                        ) : (
                            <div className="relative w-full h-full">
                                <img src={listingImage.data} alt="Captura" className="w-full h-full object-contain rounded" />
                                <div className="absolute bottom-2 right-2 bg-white/90 p-1 rounded-full shadow">
                                    <ICONS.CheckCircle className="w-5 h-5 text-[#8C2C39]" />
                                </div>
                            </div>
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={handleListingImageUpload} />
                    </label>
                 )}
             </div>
          </div>
      </div>

      <div className="flex justify-end pt-6">
        <button
            onClick={handleContinue}
            className="px-8 py-3 bg-[#8C2C39] text-white rounded-lg hover:bg-[#70232e] transition font-bold shadow-lg flex items-center gap-2"
        >
            Continuar <ICONS.ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default FloorPlanSelector;