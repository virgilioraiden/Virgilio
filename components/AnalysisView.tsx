import React from 'react';
import { Room, GlobalProjectDecisions } from '../types';
import { ICONS } from '../constants';
import { generateRoomRender } from '../geminiService';

interface Props {
  rooms: Room[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  onGeneratePlan: () => void;
  onAddMoreRooms: () => void;
  isGeneratingPlan: boolean;
  globalDecisions: GlobalProjectDecisions;
  onGlobalDecisionUpdate: (type: keyof GlobalProjectDecisions, status: any) => void;
}

const AnalysisView: React.FC<Props> = ({ 
    rooms, setRooms, onGeneratePlan, onAddMoreRooms, isGeneratingPlan,
    globalDecisions, onGlobalDecisionUpdate
}) => {

  const handleDecision = (roomId: string, interventionId: string, status: 'approved' | 'rejected' | 'modified') => {
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, decisions: { ...r.decisions, [interventionId]: { ...r.decisions[interventionId], status } } } : r));
  };

  const handleModificationText = (roomId: string, interventionId: string, text: string) => {
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, decisions: { ...r.decisions, [interventionId]: { status: text.trim() ? 'modified' : 'pending', modificationNote: text } } } : r));
  };

  const handleRenderPromptChange = (roomId: string, index: number, text: string) => {
    setRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        const newPrompts = [...(r.renderPrompts || [])];
        newPrompts[index] = text;
        return { ...r, renderPrompts: newPrompts };
      }
      return r;
    }));
  };

  const handleGenerateRender = async (roomId: string, index: number) => {
    setRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        const newIsRendering = [...(r.isRendering || [false, false])];
        newIsRendering[index] = true;
        return { ...r, isRendering: newIsRendering };
      }
      return r;
    }));
    
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      const customInstruction = room.renderPrompts?.[index] || "";
      const generatedImage = await generateRoomRender(room, index, customInstruction, globalDecisions);
      
      setRooms(prev => prev.map(r => {
          if (r.id === roomId) {
            const newImages = [...(r.generatedImages || [null, null])];
            newImages[index] = generatedImage;
            const newIsRendering = [...(r.isRendering || [false, false])];
            newIsRendering[index] = false;
            return { ...r, generatedImages: newImages, isRendering: newIsRendering };
          }
          return r;
      }));
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-32">
      <div className="bg-white rounded-xl shadow-lg border-t-4 border-slate-800 p-6 grid md:grid-cols-2 gap-8">
        <div>
          <h4 className="font-bold text-[#8C2C39] text-sm uppercase mb-3 border-b pb-1">Infraestructura</h4>
          <div className="space-y-3">
            {['electricity', 'plumbing'].map(type => (
              <div key={type} className="bg-slate-50 p-2 rounded border flex justify-between items-center">
                <span className="text-sm font-bold capitalize">{type === 'electricity' ? 'Electricidad' : 'Plomería'}</span>
                <div className="flex gap-1">
                  <button onClick={() => onGlobalDecisionUpdate(type as any, 'approved')} className={`text-[10px] px-2 py-1 rounded ${globalDecisions[type as keyof GlobalProjectDecisions] === 'approved' ? 'bg-green-600 text-white' : 'bg-slate-200'}`}>Aprobar</button>
                  <button onClick={() => onGlobalDecisionUpdate(type as any, 'rejected')} className={`text-[10px] px-2 py-1 rounded ${globalDecisions[type as keyof GlobalProjectDecisions] === 'rejected' ? 'bg-red-600 text-white' : 'bg-slate-200'}`}>No</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-bold text-[#8C2C39] text-sm uppercase mb-3 border-b pb-1">Terminaciones</h4>
          <div className="space-y-3">
             <div className="bg-slate-50 p-2 rounded border">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold">Pisos Unificados</span>
                    <button onClick={() => onGlobalDecisionUpdate('flooring', globalDecisions.flooring === 'approved' ? 'rejected' : 'approved')} className={`text-[10px] px-2 py-1 rounded ${globalDecisions.flooring === 'approved' ? 'bg-green-600 text-white' : 'bg-slate-200'}`}>
                        {globalDecisions.flooring === 'approved' ? '✓ Activado' : 'Activar'}
                    </button>
                </div>
                {globalDecisions.flooring === 'approved' && (
                    <input 
                        className="w-full text-xs p-1 border rounded" 
                        placeholder="Material (ej: Porcelanato gris)" 
                        value={globalDecisions.flooringMaterial}
                        onChange={e => onGlobalDecisionUpdate('flooringMaterial', e.target.value)}
                    />
                )}
             </div>
             <div className="grid grid-cols-2 gap-2">
                {['painting', 'skirting'].map(type => (
                    <button key={type} onClick={() => onGlobalDecisionUpdate(type as any, globalDecisions[type as keyof GlobalProjectDecisions] === 'approved' ? 'rejected' : 'approved')} className={`text-[10px] p-2 rounded border font-bold ${globalDecisions[type as keyof GlobalProjectDecisions] === 'approved' ? 'bg-slate-800 text-white' : 'bg-slate-50'}`}>
                        {type === 'painting' ? 'Pintura General' : 'Zócalos Nuevos'}
                    </button>
                ))}
             </div>
          </div>
        </div>
      </div>

      <div className="space-y-12">
        {rooms.map(room => (
          <div key={room.id} className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="bg-[#8C2C39] p-4 text-white font-bold flex justify-between">
              <span>{room.name}</span>
              {room.isAnalyzing && <ICONS.Loader className="animate-spin w-5 h-5" />}
            </div>
            <div className="p-6 space-y-6">
                {room.diagnosis && typeof room.diagnosis === 'object' && room.diagnosis.structuredAnalysis && (
                    <>
                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50"><tr><th className="p-3 text-left">Sugerencia</th><th className="p-3 text-left">Decisión</th></tr></thead>
                                <tbody className="divide-y">
                                    {room.diagnosis.structuredAnalysis.interventions.map(item => (
                                        <tr key={item.id}>
                                            <td className="p-3"><strong>{item.task}</strong><br/><span className="text-xs text-slate-500">{item.materials}</span></td>
                                            <td className="p-3">
                                                <div className="flex gap-2 mb-2">
                                                    <button onClick={() => handleDecision(room.id, item.id, 'approved')} className={`text-[10px] px-2 py-1 rounded ${room.decisions[item.id]?.status === 'approved' ? 'bg-green-600 text-white' : 'bg-slate-100'}`}>Si</button>
                                                    <button onClick={() => handleDecision(room.id, item.id, 'rejected')} className={`text-[10px] px-2 py-1 rounded ${room.decisions[item.id]?.status === 'rejected' ? 'bg-red-600 text-white' : 'bg-slate-100'}`}>No</button>
                                                </div>
                                                <input className="text-[10px] border p-1 w-full" placeholder="Modificar..." onChange={e => handleModificationText(room.id, item.id, e.target.value)} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                            {room.images.map((img, idx) => (
                                <div key={idx} className="bg-slate-50 p-3 rounded border">
                                    <div className="aspect-video bg-slate-200 rounded mb-2 overflow-hidden relative">
                                        <img src={room.generatedImages[idx] || img.data} className="w-full h-full object-cover" />
                                        {room.isRendering[idx] && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs">Generando...</div>}
                                    </div>
                                    <textarea 
                                        className="w-full text-[10px] p-2 border rounded mb-2 h-16 resize-none" 
                                        placeholder="Instrucciones para la IA (ej: eliminar mueble, cambiar color pared...)" 
                                        value={room.renderPrompts?.[idx] || ''}
                                        onChange={e => handleRenderPromptChange(room.id, idx, e.target.value)}
                                    />
                                    <button onClick={() => handleGenerateRender(room.id, idx)} className="w-full bg-slate-800 text-white py-2 rounded text-xs font-bold hover:bg-black transition">
                                        {room.generatedImages[idx] ? 'Regenerar con Ajustes' : 'Generar Vista'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
          </div>
        ))}
      </div>
      <div className="fixed bottom-0 inset-x-0 bg-white border-t p-4 flex justify-between items-center shadow-lg z-50">
          <button onClick={onAddMoreRooms} className="text-[#8C2C39] font-bold">← Agregar Ambientes</button>
          <button onClick={onGeneratePlan} disabled={isGeneratingPlan} className="bg-[#8C2C39] text-white px-8 py-3 rounded-lg font-bold">
              {isGeneratingPlan ? 'Generando Informe...' : 'Finalizar Reporte'}
          </button>
      </div>
    </div>
  );
};

export default AnalysisView;