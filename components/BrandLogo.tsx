import React from 'react';

const BrandLogo: React.FC = () => {
  return (
    <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Escudo Base */}
      <path d="M50 115C50 115 90 95 90 30V10H10V30C10 95 50 115 50 115Z" fill="#8C2C39" />
      
      {/* Elementos de la F estilizada */}
      {/* Barra superior */}
      <path d="M30 40H75L70 55H30V40Z" fill="white" />
      
      {/* Barra inferior */}
      <path d="M30 65H60L55 80H30V65Z" fill="white" />
      
      {/* Sombra sutil para dar volumen (estilo cinta) */}
      <path d="M30 55L35 40V80L30 65V55Z" fill="black" fillOpacity="0.2" />
    </svg>
  );
};

export default BrandLogo;