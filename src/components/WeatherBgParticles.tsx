import React from "react";
import { motion } from "motion/react";
import { WeatherCondition } from "../types";

interface WeatherBgParticlesProps {
  condition: WeatherCondition;
  humidity?: number;
}

export default function WeatherBgParticles({
  condition,
  humidity = 0,
}: WeatherBgParticlesProps) {
  // Generate random seeds for animations
  const itemsCountByCondition: { [key in WeatherCondition]: number } = {
    sunny: 12,
    rainy: 28,
    stormy: 35,
    cloudy: 8,
    snowy: 20,
    windy: 15,
  };

  const count = itemsCountByCondition[condition] || 0;

  // Configuration for slow-drifting, gorgeous ambient blur light flares
  const getOrbsConfig = (cond: WeatherCondition) => {
    switch (cond) {
      case "sunny":
        return [
          {
            color: "bg-amber-400/20 md:bg-amber-400/25",
            size: "w-72 h-72 md:w-[480px] md:h-[480px]",
            x: [0, 40, -30, 0],
            y: [0, -30, 20, 0],
            duration: 22,
          },
          {
            color: "bg-orange-500/15 md:bg-orange-500/20",
            size: "w-64 h-64 md:w-[380px] md:h-[380px]",
            x: [0, -50, 30, 0],
            y: [0, 40, -30, 0],
            duration: 28,
          },
          {
            color: "bg-rose-400/15 md:bg-rose-500/15",
            size: "w-56 h-56 md:w-[340px] md:h-[340px]",
            x: [0, 30, -40, 0],
            y: [0, -25, 30, 0],
            duration: 18,
          },
        ];
      case "rainy":
        return [
          {
            color: "bg-sky-500/20 md:bg-sky-500/25",
            size: "w-72 h-72 md:w-[450px] md:h-[450px]",
            x: [0, 35, -25, 0],
            y: [0, -25, 30, 0],
            duration: 25,
          },
          {
            color: "bg-blue-600/15 md:bg-blue-600/20",
            size: "w-64 h-64 md:w-[360px] md:h-[360px]",
            x: [0, -40, 30, 0],
            y: [0, 35, -25, 0],
            duration: 30,
          },
          {
            color: "bg-teal-400/15 md:bg-teal-400/20",
            size: "w-56 h-56 md:w-[320px] md:h-[320px]",
            x: [0, 25, -30, 0],
            y: [0, -20, 25, 0],
            duration: 20,
          },
        ];
      case "stormy":
        return [
          {
            color: "bg-purple-900/25 md:bg-purple-800/30",
            size: "w-80 h-80 md:w-[500px] md:h-[500px]",
            x: [0, 30, -35, 0],
            y: [0, -35, 30, 0],
            duration: 24,
          },
          {
            color: "bg-indigo-950/30 md:bg-indigo-900/35",
            size: "w-72 h-72 md:w-[420px] md:h-[420px]",
            x: [0, -35, 40, 0],
            y: [0, 35, -35, 0],
            duration: 28,
          },
          {
            color: "bg-fuchsia-900/15 md:bg-fuchsia-800/20",
            size: "w-60 h-60 md:w-[320px] md:h-[320px]",
            x: [0, 25, -30, 0],
            y: [0, -20, 25, 0],
            duration: 19,
          },
        ];
      case "cloudy":
        return [
          {
            color: "bg-slate-400/20 md:bg-slate-400/25",
            size: "w-72 h-72 md:w-[460px] md:h-[460px]",
            x: [0, 45, -25, 0],
            y: [0, -20, 25, 0],
            duration: 32,
          },
          {
            color: "bg-sky-200/20 md:bg-sky-300/25",
            size: "w-64 h-64 md:w-[350px] md:h-[350px]",
            x: [0, -30, 40, 0],
            y: [0, 30, -25, 0],
            duration: 26,
          },
          {
            color: "bg-indigo-400/15 md:bg-blue-400/15",
            size: "w-56 h-56 md:w-[310px] md:h-[310px]",
            x: [0, 20, -35, 0],
            y: [0, -15, 20, 0],
            duration: 22,
          },
        ];
      case "snowy":
        return [
          {
            color: "bg-teal-300/20 md:bg-teal-200/25",
            size: "w-72 h-72 md:w-[440px] md:h-[440px]",
            x: [0, 30, -20, 0],
            y: [0, -20, 20, 0],
            duration: 23,
          },
          {
            color: "bg-sky-200/20 md:bg-sky-300/25",
            size: "w-64 h-64 md:w-[360px] md:h-[360px]",
            x: [0, -25, 30, 0],
            y: [0, 25, -20, 0],
            duration: 29,
          },
          {
            color: "bg-white/15 md:bg-cyan-100/15",
            size: "w-56 h-56 md:w-[300px] md:h-[300px]",
            x: [0, 20, -30, 0],
            y: [0, -15, 20, 0],
            duration: 18,
          },
        ];
      case "windy":
        return [
          {
            color: "bg-emerald-400/20 md:bg-emerald-300/25",
            size: "w-72 h-72 md:w-[450px] md:h-[450px]",
            x: [0, 50, -40, 0],
            y: [0, -20, 20, 0],
            duration: 21,
          },
          {
            color: "bg-teal-300/20 md:bg-teal-300/25",
            size: "w-64 h-64 md:w-[360px] md:h-[360px]",
            x: [0, -40, 50, 0],
            y: [0, 25, -25, 0],
            duration: 27,
          },
          {
            color: "bg-purple-300/15 md:bg-fuchsia-400/15",
            size: "w-56 h-56 md:w-[325px] md:h-[325px]",
            x: [0, 30, -30, 0],
            y: [0, -20, 30, 0],
            duration: 19,
          },
        ];
      default:
        return [];
    }
  };

  const orbs = getOrbsConfig(condition);

  // Render sparkles or rain drips
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* Decorative, premium slow-drifting atmospheric fluid orbs to make the background deeply interactive */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none filter blur-[80px] md:blur-[140px] opacity-80 mix-blend-normal">
        {orbs.map((orb, i) => {
          // Position each in separate quadrants of the screen for balanced illumination
          const initialPos = [
            { top: "10%", left: "15%" },
            { bottom: "15%", right: "10%" },
            { top: "45%", left: "42%" },
          ][i] || { top: "30%", left: "30%" };

          return (
            <motion.div
              key={`bg-orb-${i}`}
              className={`absolute rounded-full pointer-events-none ${orb.color} ${orb.size}`}
              style={{
                ...initialPos,
              }}
              animate={{
                x: orb.x,
                y: orb.y,
                scale: [1, 1.15, 0.9, 1.08, 1],
              }}
              transition={{
                duration: orb.duration,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          );
        })}
      </div>
      {condition === "rainy" && (
        <div className="absolute inset-0">
          {Array.from({ length: count }).map((_, i) => {
            const left = Math.random() * 100;
            const duration = 0.8 + Math.random() * 0.7;
            const delay = Math.random() * 2;
            const length = 15 + Math.random() * 20;
            const opacity = 0.2 + Math.random() * 0.45;

            return (
              <motion.div
                key={`rain-${i}`}
                className="absolute w-[1.5px] bg-gradient-to-b from-sky-400 to-blue-500/10 rounded-full"
                style={{
                  left: `${left}%`,
                  top: "-10%",
                  height: `${length}px`,
                  opacity: opacity,
                }}
                animate={{
                  y: ["0vh", "110vh"],
                  x: [`${Math.random() * -30}px`, `${Math.random() * -10}px`],
                }}
                transition={{
                  duration: duration,
                  repeat: Infinity,
                  delay: delay,
                  ease: "linear",
                }}
              />
            );
          })}
        </div>
      )}

      {condition === "stormy" && (
        <div className="absolute inset-0">
          {/* Periodic rapid lightning sheet flashes behind layers */}
          <motion.div
            className="absolute inset-0 bg-amber-400/5 mix-blend-color-dodge"
            animate={{
              opacity: [0, 0, 0.4, 0, 0.7, 0, 0, 0.2, 0, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 5,
              delay: 3,
            }}
          />
          {Array.from({ length: count }).map((_, i) => {
            const left = Math.random() * 100;
            const duration = 0.6 + Math.random() * 0.5;
            const delay = Math.random() * 2;
            const length = 20 + Math.random() * 25;
            const opacity = 0.3 + Math.random() * 0.5;

            return (
              <motion.div
                key={`storm-rain-${i}`}
                className="absolute w-[1.8px] bg-gradient-to-b from-indigo-300 to-purple-500/20 rounded-full"
                style={{
                  left: `${left}%`,
                  top: "-10%",
                  height: `${length}px`,
                  opacity: opacity,
                }}
                animate={{
                  y: ["0vh", "110vh"],
                  x: [
                    `${-30 + Math.random() * -20}px`,
                    `${-10 + Math.random() * -10}px`,
                  ],
                }}
                transition={{
                  duration: duration,
                  repeat: Infinity,
                  delay: delay,
                  ease: "linear",
                }}
              />
            );
          })}
        </div>
      )}

      {condition === "sunny" && (
        <div className="absolute inset-0">
          {Array.from({ length: count }).map((_, i) => {
            const left = Math.random() * 100;
            const top = Math.random() * 100;
            const scale = 0.5 + Math.random() * 0.8;
            const duration = 2.5 + Math.random() * 3.5;
            const delay = Math.random() * 3;

            return (
              <motion.svg
                key={`sunny-glimmer-${i}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="absolute text-yellow-300 pointer-events-none drop-shadow-[0_0_8px_rgba(253,224,71,0.6)]"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  width: `${14 * scale}px`,
                  height: `${14 * scale}px`,
                }}
                animate={{
                  scale: [0, scale, 0],
                  rotate: [0, 180, 360],
                  opacity: [0, 0.8, 0],
                }}
                transition={{
                  duration: duration,
                  repeat: Infinity,
                  delay: delay,
                  ease: "easeInOut",
                }}
              >
                <path
                  d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </motion.svg>
            );
          })}
        </div>
      )}

      {condition === "cloudy" && (
        <div className="absolute inset-0">
          {Array.from({ length: count }).map((_, i) => {
            const top = 10 + Math.random() * 70;
            const sizeWidth = 120 + Math.random() * 160;
            const sizeHeight = 40 + Math.random() * 60;
            const duration = 30 + Math.random() * 40;
            const delay = Math.random() * -40;

            return (
              <motion.div
                key={`cloud-drift-${i}`}
                className="absolute bg-white/5 rounded-full blur-2xl pointer-events-none mix-blend-lighten"
                style={{
                  top: `${top}%`,
                  width: `${sizeWidth}px`,
                  height: `${sizeHeight}px`,
                  left: "-30%",
                }}
                animate={{
                  x: ["0vw", "130vw"],
                }}
                transition={{
                  duration: duration,
                  repeat: Infinity,
                  delay: delay,
                  ease: "linear",
                }}
              />
            );
          })}
        </div>
      )}

      {condition === "windy" && (
        <div className="absolute inset-0">
          {Array.from({ length: count }).map((_, i) => {
            const top = Math.random() * 100;
            const length = 80 + Math.random() * 120;
            const duration = 1.8 + Math.random() * 1.5;
            const delay = Math.random() * 3;
            const opacity = 0.05 + Math.random() * 0.12;

            return (
              <motion.div
                key={`wind-breeze-${i}`}
                className="absolute h-[1.2px] bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full"
                style={{
                  top: `${top}%`,
                  left: "-15%",
                  width: `${length}px`,
                  opacity: opacity,
                }}
                animate={{
                  x: ["0vw", "125vw"],
                  skewX: [-15, -15],
                }}
                transition={{
                  duration: duration,
                  repeat: Infinity,
                  delay: delay,
                  ease: "easeInOut",
                }}
              />
            );
          })}

          {/* Flying Leaves */}
          {Array.from({ length: Math.floor(count * 0.6) }).map((_, i) => {
            const top = -10 + Math.random() * 100;
            const size = 12 + Math.random() * 8;
            const duration = 2.5 + Math.random() * 2;
            const delay = Math.random() * 5;

            return (
              <motion.svg
                key={`wind-leaf-${i}`}
                viewBox="0 0 24 24"
                fill="currentColor"
                stroke="none"
                className="absolute text-emerald-500/30 md:text-emerald-500/20 drop-shadow-sm pointer-events-none"
                style={{
                  top: `${top}%`,
                  left: "-10%",
                  width: `${size}px`,
                  height: `${size}px`,
                }}
                animate={{
                  x: ["0vw", "120vw"],
                  y: [0, Math.random() * 60 - 30, Math.random() * 80 - 40],
                  rotate: [
                    0,
                    360 * (Math.random() > 0.5 ? 1 : -1),
                    720 * (Math.random() > 0.5 ? 1 : -1),
                  ],
                }}
                transition={{
                  duration: duration,
                  repeat: Infinity,
                  delay: delay,
                  ease: "linear",
                }}
              >
                <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C12.42,20 15.35,17.05 16,13C16.71,8.5 17,8 17,8Z" />
              </motion.svg>
            );
          })}
        </div>
      )}

      {condition === "snowy" && (
        <div className="absolute inset-0">
          {Array.from({ length: count }).map((_, i) => {
            const left = Math.random() * 100;
            const size = 3 + Math.random() * 5;
            const duration = 4 + Math.random() * 4;
            const delay = Math.random() * 3;
            const opacity = 0.3 + Math.random() * 0.5;

            return (
              <motion.div
                key={`snow-flake-${i}`}
                className="absolute bg-white rounded-full"
                style={{
                  left: `${left}%`,
                  top: "-5%",
                  width: `${size}px`,
                  height: `${size}px`,
                  opacity: opacity,
                  filter: "blur(0.5px)",
                }}
                animate={{
                  y: ["0vh", "105vh"],
                  x: [`${Math.sin(i) * 30}px`, `${Math.sin(i + 1) * 30}px`],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: duration,
                  repeat: Infinity,
                  delay: delay,
                  ease: "linear",
                }}
              />
            );
          })}
        </div>
      )}

      {/* High Humidity Fog Overlay */}
      {humidity > 80 && (
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden mix-blend-screen">
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={`fog-layer-${i}`}
              className="absolute w-[150vw] h-[120vh] bg-white/5 filter blur-[80px] md:blur-[120px] rounded-[100%]"
              style={{
                top: `${-20 + i * 20}%`,
                left: "-25%",
              }}
              animate={{
                x: ["-10vw", "10vw", "-10vw"],
                y: ["-5vh", "5vh", "-5vh"],
              }}
              transition={{
                duration: 25 + Math.random() * 20,
                repeat: Infinity,
                ease: "easeInOut",
                delay: -Math.random() * 15,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
