import React from 'react';
import { motion } from 'framer-motion';

const EcoMascot = ({
  message = "Let's play!",
  emotion = "happy",
  size = "medium",
  animate = true
}) => {
  const sizeClasses = {
    small: "w-16 h-20 sm:w-20 sm:h-24",
    medium: "w-24 h-28 sm:w-28 sm:h-32",
    large: "w-32 h-36 sm:w-36 sm:h-40"
  };

  const MascotBody = () => (
    <motion.svg
      viewBox="0 0 200 240"
      className={`${sizeClasses[size]} drop-shadow-lg`}
      animate={animate ? {
        y: [0, -3, 0],
        rotate: [0, 1, -1, 0]
      } : {}}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {/* Banner being held up - "Little Kids" like in the image */}
      <g>
        {/* Banner background */}
        <path
          d="M40 20 L160 20 L155 5 L170 15 L155 25 L160 35 L40 35 L45 25 L30 15 L45 5 Z"
          fill="#9ACD32"
          stroke="#7CB342"
          strokeWidth="2"
        />
        {/* Banner text */}
        <text
          x="100"
          y="30"
          textAnchor="middle"
          className="text-xs font-bold fill-white"
          fontSize="12"
        >
          Little Kids
        </text>
      </g>

      {/* Left arm holding banner */}
      <motion.ellipse
        cx="35"
        cy="70"
        rx="10"
        ry="25"
        fill="#7CB342"
        stroke="#5A8E32"
        strokeWidth="2"
        style={{ transformOrigin: "35px 60px" }}
        animate={animate ? { rotate: [-15, -10, -15] } : {}}
        transition={{ duration: 3, repeat: Infinity }}
      />

      {/* Right arm holding banner */}
      <motion.ellipse
        cx="165"
        cy="70"
        rx="10"
        ry="25"
        fill="#7CB342"
        stroke="#5A8E32"
        strokeWidth="2"
        style={{ transformOrigin: "165px 60px" }}
        animate={animate ? { rotate: [15, 10, 15] } : {}}
        transition={{ duration: 3, repeat: Infinity }}
      />

      {/* Main body - rounded like the original */}
      <motion.ellipse
        cx="100"
        cy="130"
        rx="50"
        ry="55"
        fill="#7CB342"
        stroke="#5A8E32"
        strokeWidth="3"
        animate={animate ? { scaleY: [1, 1.02, 1] } : {}}
        transition={{ duration: 3, repeat: Infinity }}
      />

      {/* Belly highlight */}
      <ellipse
        cx="100"
        cy="140"
        rx="35"
        ry="40"
        fill="#9ACD32"
        opacity="0.6"
      />

      {/* Head - wider to match the image */}
      <motion.ellipse
        cx="100"
        cy="80"
        rx="45"
        ry="35"
        fill="#7CB342"
        stroke="#5A8E32"
        strokeWidth="3"
        animate={animate ? { scaleX: [1, 1.01, 1] } : {}}
        transition={{ duration: 2.5, repeat: Infinity }}
      />

      {/* Eyes - larger and more prominent like in the image */}
      <g>
        {/* Left eye white */}
        <motion.ellipse
          cx="80"
          cy="75"
          rx="15"
          ry="18"
          fill="white"
          stroke="#333"
          strokeWidth="2"
          animate={animate ? {
            scaleX: [1, 0.1, 1],
            scaleY: [1, 0.8, 1]
          } : {}}
          transition={{
            duration: 4,
            repeat: Infinity,
            times: [0, 0.1, 0.2]
          }}
        />

        {/* Right eye white */}
        <motion.ellipse
          cx="120"
          cy="75"
          rx="15"
          ry="18"
          fill="white"
          stroke="#333"
          strokeWidth="2"
          animate={animate ? {
            scaleX: [1, 0.1, 1],
            scaleY: [1, 0.8, 1]
          } : {}}
          transition={{
            duration: 4,
            repeat: Infinity,
            times: [0, 0.1, 0.2]
          }}
        />

        {/* Left eye pupil - bright blue like the image */}
        <ellipse cx="80" cy="75" rx="10" ry="12" fill="#1E90FF" />
        <ellipse cx="120" cy="75" rx="10" ry="12" fill="#1E90FF" />

        {/* Eye highlights */}
        <circle cx="85" cy="70" r="3" fill="white" opacity="0.9" />
        <circle cx="125" cy="70" r="3" fill="white" opacity="0.9" />
        <circle cx="82" cy="72" r="1.5" fill="white" opacity="0.7" />
        <circle cx="122" cy="72" r="1.5" fill="white" opacity="0.7" />
      </g>

      {/* Wide smile like in the image */}
      <motion.path
        d="M70 95 Q100 115 130 95"
        stroke="#333"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        animate={animate ? {
          d: [
            "M70 95 Q100 115 130 95",
            "M70 95 Q100 118 130 95",
            "M70 95 Q100 115 130 95"
          ]
        } : {}}
        transition={{ duration: 3, repeat: Infinity }}
      />

      {/* Smile inner */}
      <path
        d="M75 98 Q100 110 125 98"
        stroke="white"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* Lower body/legs area */}
      <ellipse
        cx="85"
        cy="195"
        rx="15"
        ry="25"
        fill="#7CB342"
        stroke="#5A8E32"
        strokeWidth="2"
      />
      <ellipse
        cx="115"
        cy="195"
        rx="15"
        ry="25"
        fill="#7CB342"
        stroke="#5A8E32"
        strokeWidth="2"
      />

      {/* Feet - wide like frog feet */}
      <ellipse
        cx="80"
        cy="220"
        rx="20"
        ry="12"
        fill="#7CB342"
        stroke="#5A8E32"
        strokeWidth="2"
      />
      <ellipse
        cx="120"
        cy="220"
        rx="20"
        ry="12"
        fill="#7CB342"
        stroke="#5A8E32"
        strokeWidth="2"
      />
    </motion.svg>
  );

  return (
    <div className="flex flex-col items-center">
      <MascotBody />
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 px-3 py-2 bg-white rounded-2xl shadow-sm border border-green-200 relative max-w-xs"
        >
          {/* Speech bubble tail */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-white z-10"></div>
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-0 h-0 w-[10px] h-[10px] bg-white border-t border-l border-green-200 rotate-45 z-0"></div>

          <span className="text-sm font-bold text-gray-800 text-center block relative z-20">
            {message}
          </span>
        </motion.div>
      )}
    </div>
  );
};

export default EcoMascot;