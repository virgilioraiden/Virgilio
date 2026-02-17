import React, { useState, useEffect } from 'react';
import { PropertyDetails } from '../types';
import BrandLogo from './BrandLogo';
import { ICONS } from '../constants';

interface Props {
  onComplete: (details: PropertyDetails) => void;
  onFastForward: () => void;
}

const Onboarding: React.FC<Props> = ({ onComplete, onFastForward }) => {
  const [formData, setFormData] = useState<PropertyDetails>({
    city: '',
    address: '',
    type: 'Departamento',
    area: '',
    areaCovered: '',
    areaSemi: '',
    areaOpen: '',
    isArgentina: true, // Default true internally
    age: '40',
    renovationLevel: 'Standard'
  });

  // Auto-calculate Total Area
  useEffect(() => {
    const covered = parseFloat(formData.areaCovered) || 0;
    const semi = parseFloat(formData.areaSemi) || 0;
    const open = parseFloat(formData.areaOpen) || 0;
    const total = covered + semi + open;
    
    if (total > 0) {
        setFormData(prev => ({ ...prev, area: total.toString() }));
    }
  }, [formData.areaCovered, formData.areaSemi, formData.areaOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(formData);
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 mt-10 mb-10">
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
            <div className="w-20 h-20">
                <BrandLogo />
            </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Datos de la Propiedad</h1>
        <p className="text-slate-500 text-sm mt-2">Para comenzar el relevamiento técnico</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Ciudad y Barrio</label>
          <input
            required
            type="text"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#8C2C39] outline-none"
            placeholder="Ej: Palermo Hollywood, CABA"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Dirección Exacta</label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#8C2C39] outline-none"
            placeholder="Ej: Av. Santa Fe 3200, Piso 4"
            value={formData.address || ''}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Propiedad</label>
              <select
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#8C2C39] outline-none"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="Departamento">Departamento</option>
                <option value="Casa">Casa</option>
                <option value="PH">PH</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nivel de Remodelación</label>
              <select
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#8C2C39] outline-none font-medium"
                value={formData.renovationLevel}
                onChange={(e) => setFormData({ ...formData, renovationLevel: e.target.value })}
              >
                <option value="Habitabilidad">Habitabilidad</option>
                <option value="Standard">Standard</option>
                <option value="Standard Plus">Standard Plus</option>
                <option value="Top">Top</option>
              </select>
            </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <label className="block text-sm font-bold text-slate-700 mb-2">Desglose de Superficies (m²)</label>
            <div className="grid grid-cols-3 gap-2">
                <div>
                    <label className="block text-xs text-slate-500 mb-1">Cubierta</label>
                    <input
                      required
                      type="number"
                      className="w-full px-2 py-1 border border-slate-300 rounded focus:ring-1 focus:ring-[#8C2C39] outline-none text-sm"
                      placeholder="0"
                      value={formData.areaCovered}
                      onChange={(e) => setFormData({ ...formData, areaCovered: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-xs text-slate-500 mb-1">Semi</label>
                    <input
                      type="number"
                      className="w-full px-2 py-1 border border-slate-300 rounded focus:ring-1 focus:ring-[#8C2C39] outline-none text-sm"
                      placeholder="0"
                      value={formData.areaSemi}
                      onChange={(e) => setFormData({ ...formData, areaSemi: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-xs text-slate-500 mb-1">Descubierta</label>
                    <input
                      type="number"
                      className="w-full px-2 py-1 border border-slate-300 rounded focus:ring-1 focus:ring-[#8C2C39] outline-none text-sm"
                      placeholder="0"
                      value={formData.areaOpen}
                      onChange={(e) => setFormData({ ...formData, areaOpen: e.target.value })}
                    />
                </div>
            </div>
            <div className="text-right mt-2 text-xs font-bold text-[#8C2C39]">
                Total: {formData.area || 0} m²
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Antigüedad (años)</label>
            <input
              required
              type="number"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#8C2C39] outline-none"
              placeholder="Ej: 40"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            />
        </div>

        <div className="pt-2 space-y-3">
            <button
            type="submit"
            className="w-full mt-6 bg-[#8C2C39] text-white py-3 rounded-lg font-medium hover:bg-[#70232e] transition-colors flex items-center justify-center gap-2"
            >
            Siguiente paso
            <ICONS.ChevronRight className="w-4 h-4" />
            </button>
            
            <button
            type="button"
            onClick={onFastForward}
            className="w-full py-2 text-xs text-slate-400 font-medium hover:text-slate-600 transition-colors flex items-center justify-center gap-1 mt-4 border-t border-slate-100 pt-4"
            >
             <ICONS.CheckCircle className="w-3 h-3" /> ⚡ Testear Reporte PDF (Saltear todo)
            </button>
        </div>
      </form>

      {/* DISCLAIMER / FOOTER LEGAL */}
      <div className="mt-8 pt-6 border-t border-slate-200">
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 mb-2 text-center uppercase tracking-wide">
                Aviso Legal y Propiedad Intelectual
            </h4>
            <div className="text-[10px] text-slate-500 text-justify leading-relaxed space-y-2">
                <p>
                    Esta aplicación ha sido desarrollada por <strong>Flipping Master</strong> como una herramienta de soporte exclusiva para facilitar los procesos de análisis e inversión de sus participantes.
                </p>
                <p>
                    <strong>Exención de Responsabilidad:</strong> La información, diagnósticos técnicos y presupuestos generados por este sistema son estimaciones basadas en Inteligencia Artificial y no reemplazan el juicio profesional ni la verificación in situ. <strong>Flipping Master</strong> no asume responsabilidad alguna por la exactitud de los datos, costos o viabilidad técnica. El usuario asume total y exclusiva responsabilidad por la revisión de la información antes de tomar decisiones constructivas o contractuales.
                </p>
                <p className="text-center font-bold text-[#8C2C39] pt-2 border-t border-slate-200 mt-2">
                    © {new Date().getFullYear()} Flipping Master / Virgilio Raiden. Todos los derechos reservados.
                </p>
            </div>
        </div>
      </div>

    </div>
  );
};

export default Onboarding;