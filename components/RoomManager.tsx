import React, { useState, useEffect } from 'react';
import { Room, FileData } from '../types';
import { ICONS } from '../constants';

interface Props {
  rooms: Room[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  onNext: () => void;
  hasFloorPlan: boolean;
}

const RoomManager: React.FC<Props> = ({ rooms, setRooms, onNext, hasFloorPlan }) => {
  // Local state for the new room form
  const [newRoomName, setNewRoomName] = useState('');
  const [description, setDescription] = useState('');
  
  // Dimension states
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [isIrregular, setIsIrregular] = useState(false);
  const [manualArea, setManualArea] = useState('');

  // Auto-calculate area when length or width changes (only if not irregular)
  useEffect(() => {
    if (!isIrregular) {
      const l = parseFloat(length);
      const w = parseFloat(width);
      if (!isNaN(l) && !isNaN(w)) {
        setManualArea((l * w).toFixed(2));
      } else {
        setManualArea('');
      }
    }
  }, [length, width, isIrregular]);

  const handleAddRoom = () => {
    if (!newRoomName.trim()) return;
    
    // Ensure we have an area value
    const finalArea = manualArea || '0';

    const newRoom: Room = {
      id: crypto.randomUUID(),
      name: newRoomName,
      description: description,
      images: [],
      diagnosis: null,
      decisions: {}, // Initialize empty decisions
      tasks: null,
      userNotes: '',
      generatedImages: [], // Initialize as empty string array
      isAnalyzing: false,
      isRendering: [], // Initialize as empty boolean array
      // Dimensions
      length: length,
      width: width,
      area: finalArea,
      isIrregular: isIrregular
    };

    setRooms([...rooms, newRoom]);
    
    // Reset Form
    setNewRoomName('');
    setDescription('');
    setLength('');
    setWidth('');
    setManualArea('');
    setIsIrregular(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, roomId: string) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImages: FileData[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      
      const promise = new Promise<FileData>((resolve) => {
        reader.onload = (event) => {
          if (event.target?.result) {
            resolve({
              id: crypto.randomUUID(),
              data: event.target.result as string,
              mimeType: file.type
            });
          }
        };
      });
      reader.readAsDataURL(file);
      newImages.push(await promise);
    }

    setRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        return { ...r, images: [...r.images, ...newImages] };
      }
      return r;
    }));
  };

  const removeRoom = (id: string) => {
    setRooms(prev => prev.filter(r => r.id !== id));
  };

  const handleAddDemoKitchen = () => {
    const demoKitchen: Room = {
      id: crypto.randomUUID(),
      name: 'Cocina Demo',
      description: 'Cocina original de época. Azulejos celestes, mueble bajo mesada deteriorado.',
      images: [],
      diagnosis: null,
      decisions: {},
      tasks: null,
      userNotes: '',
      generatedImages: [],
      isAnalyzing: false,
      isRendering: [],
      length: '3.0',
      width: '2.5',
      area: '7.5',
      isIrregular: false
    };
    setRooms([...rooms, demoKitchen]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800">Relevamiento de Ambientes</h2>
        <p className="text-slate-600">
            {hasFloorPlan 
             ? "Aunque tenemos el plano, por favor detalla cada ambiente para el diagnóstico técnico."
             : "Agrega los ambientes, sus medidas y sube fotos."}
        </p>
      </div>

      {/* Add Room Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h3 className="text-lg font-semibold text-slate-800">Nuevo Ambiente</h3>
            <button 
                type="button"
                onClick={handleAddDemoKitchen}
                className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded hover:bg-slate-200 transition"
            >
                + Cargar Cocina Demo
            </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="col-span-1 md:col-span-2">
             <label className="block text-sm text-slate-600 mb-1">Nombre del Ambiente</label>
             <input
                type="text"
                placeholder="Ej: Cocina, Dormitorio Principal"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#8C2C39] outline-none"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
            />
          </div>
          
          {/* Dimension Section */}
          <div className="col-span-1 md:col-span-2 bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-slate-700">Medidas</span>
                  <label className="flex items-center text-xs text-slate-600 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={isIrregular}
                        onChange={(e) => setIsIrregular(e.target.checked)}
                        className="mr-2 accent-[#8C2C39]"
                      />
                      Es irregular / Tiene martillos
                  </label>
              </div>

              <div className="grid grid-cols-3 gap-4">
                  <div>
                      <label className="block text-xs text-slate-500 mb-1">Largo (m)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="0.00"
                        disabled={isIrregular}
                        className={`w-full px-3 py-2 border rounded-lg outline-none ${isIrregular ? 'bg-slate-100 text-slate-400' : 'bg-white focus:ring-2 focus:ring-[#8C2C39]'}`}
                        value={length}
                        onChange={(e) => setLength(e.target.value)}
                      />
                  </div>
                  <div>
                      <label className="block text-xs text-slate-500 mb-1">Ancho (m)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="0.00"
                        disabled={isIrregular}
                        className={`w-full px-3 py-2 border rounded-lg outline-none ${isIrregular ? 'bg-slate-100 text-slate-400' : 'bg-white focus:ring-2 focus:ring-[#8C2C39]'}`}
                        value={width}
                        onChange={(e) => setWidth(e.target.value)}
                      />
                  </div>
                  <div>
                      <label className="block text-xs text-slate-500 mb-1">Área Total (m²)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="0.00"
                        readOnly={!isIrregular}
                        className={`w-full px-3 py-2 border rounded-lg outline-none font-bold ${!isIrregular ? 'bg-slate-100 text-slate-700' : 'bg-white text-[#8C2C39] border-[#8C2C39] focus:ring-2 focus:ring-[#8C2C39]'}`}
                        value={manualArea}
                        onChange={(e) => setManualArea(e.target.value)}
                      />
                  </div>
              </div>
              {isIrregular && (
                  <p className="text-xs text-[#8C2C39] mt-2 flex items-center gap-1">
                      <ICONS.Alert className="w-3 h-3" />
                      Ingrese el área total manual ya que la forma es irregular.
                  </p>
              )}
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm text-slate-600 mb-1">Notas adicionales (opcional)</label>
            <input
                type="text"
                placeholder="Ej: Techos altos, ventana al patio, humedad visible..."
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#8C2C39] outline-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        
        <button
          onClick={handleAddRoom}
          disabled={!newRoomName.trim() || !manualArea}
          className="w-full bg-slate-800 text-white py-2 rounded-lg hover:bg-slate-900 transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <ICONS.Plus className="w-4 h-4" /> Agregar Ambiente
        </button>
      </div>

      {/* Room List */}
      <div className="space-y-4">
        {rooms.map((room) => (
          <div key={room.id} className="bg-white p-6 rounded-xl shadow-md border-l-4 border-[#8C2C39] transition-all hover:shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    {room.name}
                    <span className="text-xs font-normal bg-slate-100 px-2 py-1 rounded text-slate-600 border border-slate-200">
                        {room.area} m² {room.isIrregular ? '(Irr.)' : ''}
                    </span>
                </h3>
                {room.description && <p className="text-slate-500 text-sm">{room.description}</p>}
                {!room.isIrregular && room.length && room.width && (
                    <p className="text-xs text-slate-400 mt-1">Medidas: {room.length}m x {room.width}m</p>
                )}
              </div>
              <button 
                onClick={() => removeRoom(room.id)}
                className="text-red-400 hover:text-red-600 p-1"
              >
                <ICONS.Trash className="w-5 h-5" />
              </button>
            </div>

            {/* Image Uploader */}
            <div className="mt-4">
              <label className="block w-full cursor-pointer bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-slate-100 transition">
                <ICONS.Camera className="w-6 h-6 mx-auto text-slate-400 mb-2" />
                <span className="text-sm text-slate-600">Subir fotos de {room.name}</span>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => handleFileUpload(e, room.id)}
                />
              </label>
            </div>

            {/* Thumbnails */}
            {room.images.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {room.images.map((img, idx) => (
                  <div key={idx} className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200">
                    <img src={img.data} alt="Room" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {rooms.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            No hay ambientes cargados aún.
          </div>
        )}
      </div>

      {/* Action */}
      <div className="flex justify-end pt-4">
        <button
          onClick={onNext}
          disabled={rooms.length === 0}
          className="bg-[#8C2C39] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#70232e] transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Analizar y Diagnosticar <ICONS.ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default RoomManager;