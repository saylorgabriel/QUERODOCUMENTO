'use client'

export default function RegistrySeal() {
  return (
    <div className="registry-seal shadow-xl">
      <svg 
        width="64" 
        height="64" 
        viewBox="0 0 80 80" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Circular text path */}
        <defs>
          <path 
            id="circle-path-top" 
            d="M 40,40 m -30,0 a 30,30 0 0,1 60,0"
          />
          <path 
            id="circle-path-bottom" 
            d="M 40,40 m 30,0 a 30,30 0 0,1 -60,0"
          />
        </defs>
        
        {/* Top text */}
        <text fontSize="9" fontWeight="600" fill="#333" letterSpacing="1">
          <textPath href="#circle-path-top" startOffset="50%" textAnchor="middle">
            CONSULTA DE
          </textPath>
        </text>
        
        {/* Bottom text */}
        <text fontSize="9" fontWeight="600" fill="#333" letterSpacing="1">
          <textPath href="#circle-path-bottom" startOffset="50%" textAnchor="middle">
            PROTESTO EM 24H ÚTEIS
          </textPath>
        </text>
        
        {/* Center circle with Q */}
        <circle cx="40" cy="40" r="16" fill="#2563eb" />
        <text 
          x="40" 
          y="47" 
          textAnchor="middle" 
          fontSize="18" 
          fontWeight="bold"
          fill="white"
          fontFamily="Inter, sans-serif"
        >
          Q
        </text>
      </svg>
    </div>
  )
}