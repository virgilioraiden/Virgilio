import React, { useState } from 'react';
import { AppStep, PropertyDetails, Room, FileData, GlobalProjectDecisions } from './types';
import Onboarding from './components/Onboarding';
import FloorPlanSelector from './components/FloorPlanSelector';
import RoomManager from './components/RoomManager';
import AnalysisView from './components/AnalysisView';
import FinalReport from './components/FinalReport';
import BrandLogo from './components/BrandLogo';
import { diagnoseRoom, generateTechnicalPlan } from './geminiService';
import { ICONS } from './constants';

const App = () => {
  const [step, setStep] = useState<AppStep>('onboarding');
  const [property, setProperty] = useState<PropertyDetails | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [globalPlan, setGlobalPlan] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Track global infrastructure and aesthetic decisions
  const [globalDecisions, setGlobalDecisions] = useState<GlobalProjectDecisions>({
    electricity: 'pending',
    plumbing: 'pending',
    painting: 'pending',
    skirting: 'pending',
    flooring: 'pending',
    flooringMaterial: ''
  });

  // Step 1: Onboarding Complete -> Go to Floor Plan
  const handleOnboardingComplete = (details: PropertyDetails) => {
    setProperty(details);
    setStep('floorplan');
  };

  // Step 2: Floor Plan Complete -> Go to Room Manager
  const handleFloorPlanComplete = (data: { 
      hasPlan: boolean, 
      floorPlanCurrent: FileData | null, 
      floorPlanRemodel: FileData | null, 
      listingDescription: string, 
      listingImage: FileData | null 
  }) => {
    if (property) {
        setProperty({
            ...property,
            hasFloorPlan: data.hasPlan,
            floorPlanCurrent: data.floorPlanCurrent,
            floorPlanRemodel: data.floorPlanRemodel,
            listingDescription: data.listingDescription,
            listingImage: data.listingImage
        });
    }
    setStep('rooms');
  };

  // Step 3: Start Diagnosis Loop (Analyze currently added rooms)
  const handleStartAnalysis = async () => {
    // Only analyze rooms that haven't been diagnosed yet or need re-analysis
    const undiagnosedRooms = rooms.filter(r => !r.diagnosis);
    
    if (undiagnosedRooms.length === 0 && rooms.length > 0) {
        // If all are diagnosed, just go to view
        setStep('diagnosis');
        return;
    }

    setStep('diagnosis');
    
    const newRooms = [...rooms];
    
    for (let i = 0; i < newRooms.length; i++) {
      const room = newRooms[i];
      // Skip if already diagnosed to save tokens/time, unless forced
      if (room.diagnosis) continue;

      // Mark as analyzing
      setRooms(prev => prev.map(r => r.id === room.id ? { ...r, isAnalyzing: true } : r));
      
      try {
        if (property) {
          const diagnosis = await diagnoseRoom(room, property);
          setRooms(prev => prev.map(r => r.id === room.id ? { 
            ...r, 
            diagnosis: diagnosis, 
            isAnalyzing: false 
          } : r));
        }
      } catch (e) {
        setRooms(prev => prev.map(r => r.id === room.id ? { 
            ...r, 
            diagnosis: "Error al analizar este ambiente.", 
            isAnalyzing: false 
          } : r));
      }
    }
  };

  // NEW FEATURE: Loop back to Room Manager to add more rooms
  const handleAddMoreRooms = () => {
    setStep('rooms');
  };

  // Step 4: Generate Final Plan
  const handleGeneratePlan = async () => {
    if (!property) return;
    setIsProcessing(true);
    try {
      const plan = await generateTechnicalPlan(rooms, property, globalDecisions);
      setGlobalPlan(plan);
      setStep('results');
    } catch (e) {
      alert("Hubo un error generando el reporte final. Por favor intente nuevamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handler to update Global Decisions from AnalysisView
  const handleGlobalDecisionUpdate = (type: keyof GlobalProjectDecisions, status: any) => {
    setGlobalDecisions(prev => ({
        ...prev,
        [type]: status
    }));
  };

  // Fast Forward Handler for Testing/Demo
  const handleFastForward = () => {
    // 1. Set Demo Property
    const demoProperty: PropertyDetails = {
      city: 'Palermo Soho, CABA',
      address: 'Gurruchaga 1500',
      type: 'Departamento',
      area: '55',
      areaCovered: '50',
      areaSemi: '5',
      areaOpen: '0',
      isArgentina: true,
      age: '40',
      renovationLevel: 'Standard Plus'
    };
    setProperty(demoProperty);

    // 2. Set Demo Rooms
    const demoRooms: Room[] = [
      {
        id: 'demo-room-1',
        name: 'Living Comedor',
        description: 'Pisos de parquet gastados, paredes con pintura vieja.',
        images: [],
        diagnosis: {
          analysis: 'El ambiente presenta buena estructura pero acabados deteriorados.',
          suggestions: [],
          structuredAnalysis: {
            generalState: 'Estructuralmente sano, estéticamente obsoleto.',
            pathologies: 'Desgaste superficial en pisos.',
            ageSuggestionElectric: '',
            ageSuggestionPlumbing: '',
            interventions: [
               { id: 'i1', task: 'Pulido e Hidrolaqueado', materials: 'Hidrolaca satinada', roiJustification: 'Alto impacto visual' },
               { id: 'i2', task: 'Pintura General', materials: 'Látex lavable premium', roiJustification: 'Esencial' }
            ]
          }
        },
        decisions: {
          'i1': { status: 'approved' },
          'i2': { status: 'approved' }
        },
        tasks: null,
        userNotes: '',
        generatedImages: [],
        isAnalyzing: false,
        isRendering: [],
        length: '5',
        width: '3.5',
        area: '17.5',
        isIrregular: false
      }
    ];
    setRooms(demoRooms);

    // 3. Set Demo Plan
    setGlobalPlan(`# INFORME TÉCNICO PRELIMINAR (MODO DEMO)

## 1. Portada Técnica
- Dirección: Gurruchaga 1500
- Tipo: Departamento
- Superficie: 55 m2 (Cub: 50, Semi: 5)

## 2. Alcance General
Se realizará una puesta en valor estética manteniendo la distribución original.

## 3. Listado Técnico
### Living Comedor
1. Pulido e Hidrolaqueado de pisos.
2. Pintura general muros y cielorrasos (Alba/Sherwin).
`);
    
    // 4. Jump to Results
    setStep('results');
  };

  // Navbar
  const Navbar = () => (
    <nav className="bg-slate-900 text-white p-4 shadow-md sticky top-0 z-50 print:hidden">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8">
             <BrandLogo />
          </div>
          <span className="text-xl font-bold tracking-tight">Flipping Master IA ReModela</span>
        </div>
        <div className="text-sm text-slate-400">
           {property ? `${property.type} en ${property.city}` : 'Consultor Virtual'}
        </div>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 print:bg-white">
      <Navbar />

      <main className="container mx-auto px-4 py-8 print:p-0 print:w-full">
        
        {step === 'onboarding' && (
          <Onboarding 
            onComplete={handleOnboardingComplete} 
            onFastForward={handleFastForward} 
          />
        )}

        {step === 'floorplan' && (
            <FloorPlanSelector onComplete={handleFloorPlanComplete} />
        )}

        {step === 'rooms' && (
          <RoomManager 
            rooms={rooms} 
            setRooms={setRooms} 
            onNext={handleStartAnalysis}
            hasFloorPlan={property?.hasFloorPlan || false}
          />
        )}

        {step === 'diagnosis' && (
          <AnalysisView 
            rooms={rooms} 
            setRooms={setRooms} 
            onGeneratePlan={handleGeneratePlan}
            onAddMoreRooms={handleAddMoreRooms}
            isGeneratingPlan={isProcessing}
            globalDecisions={globalDecisions}
            onGlobalDecisionUpdate={handleGlobalDecisionUpdate}
          />
        )}

        {step === 'results' && (
          <FinalReport 
            plan={globalPlan} 
            rooms={rooms} 
            setRooms={setRooms}
          />
        )}

      </main>
    </div>
  );
};

export default App;