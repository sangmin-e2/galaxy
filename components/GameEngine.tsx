
import React, { useEffect, useRef, useState, useCallback } from 'react';

interface GameEngineProps {
  level: number;
  onGameOver: (score: number, enemies: number) => void;
  onLevelComplete: (nextLevel: number) => void;
  onWin: () => void;
  isPaused: boolean;
  score: number;
  setScore: React.Dispatch<React.SetStateAction<number>>;
}

const GameEngine: React.FC<GameEngineProps> = ({ 
  level, 
  onGameOver, 
  onLevelComplete, 
  onWin,
  isPaused, 
  score, 
  setScore 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(null);
  
  // Game logic refs to avoid recreation of the loop
  const playerRef = useRef({ x: 0, y: 0, w: 30, h: 30, speed: 7 });
  const bulletsRef = useRef<any[]>([]);
  const enemiesRef = useRef<any[]>([]);
  const enemyBulletsRef = useRef<any[]>([]);
  const particlesRef = useRef<any[]>([]);
  const starsRef = useRef<any[]>([]);
  const keysPressed = useRef<Record<string, boolean>>({});
  const enemiesKilled = useRef(0);
  const isTransitioningRef = useRef(false);
  const lastShootTime = useRef(0); // 발사 쿨다운용
  const levelTextTimerRef = useRef(120); // 120 frames ~ 2 seconds
  
  // State for UI only
  const [showLevelText, setShowLevelText] = useState(true);

  const initLevel = useCallback((width: number, height: number, currentLevel: number) => {
    // Reset player position
    playerRef.current = {
      x: width / 2 - 15,
      y: height - 100, // Move player down a bit for more distance from enemies
      w: 30,
      h: 30,
      speed: 7
    };
    
    // Clear projectiles
    bulletsRef.current = [];
    enemyBulletsRef.current = [];
    particlesRef.current = [];
    
    // Grid of enemies
    enemiesRef.current = [];
    const rows = 4;
    const cols = 8;
    const spacing = 40;
    const startX = (width - (cols * spacing)) / 2;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        enemiesRef.current.push({
          x: startX + col * spacing,
          y: 60 + row * spacing,
          w: 24,
          h: 24,
          type: row === 0 ? 'boss' : row < 2 ? 'red' : 'blue',
          hp: row === 0 ? 2 : 1,
          direction: 1,
          moveTimer: 0,
          diveTimer: Math.random() * 500,
          isDiving: false
        });
      }
    }

    // Starfield if not exists
    if (starsRef.current.length === 0) {
        starsRef.current = Array.from({ length: 100 }, () => ({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 2,
          speed: 1 + Math.random() * 3
        }));
    }
    
    // Reset Level Intro
    levelTextTimerRef.current = 120;
    setShowLevelText(true);
    isTransitioningRef.current = false;
  }, []);

  const shoot = useCallback(() => {
    const now = Date.now();
    const cooldown = 150; // 150ms 쿨다운
    
    console.log('🔫 shoot fired', {
      isPaused,
      levelText: levelTextTimerRef.current,
      transitioning: isTransitioningRef.current,
      timeSinceLastShot: now - lastShootTime.current
    });
    
    if (isPaused || levelTextTimerRef.current > 0 || isTransitioningRef.current) {
      console.log('❌ Shoot blocked by condition');
      return;
    }
    
    // 쿨다운 체크
    if (now - lastShootTime.current < cooldown) {
      console.log('⏱️ Cooldown active');
      return;
    }
    
    lastShootTime.current = now;
    const bullet = {
      x: playerRef.current.x + playerRef.current.w / 2 - 2,
      y: playerRef.current.y,
      w: 4,
      h: 12,
      speed: 10
    };
    bulletsRef.current.push(bullet);
    console.log('✅ Bullet created!', bullet, 'Total bullets:', bulletsRef.current.length);
  }, [isPaused]);

  // Initial setup and Resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = canvasRef.current.clientWidth;
        canvasRef.current.height = canvasRef.current.clientHeight;
        initLevel(canvasRef.current.width, canvasRef.current.height, level);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [level, initLevel]);

  // Input listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = true;
      if (e.code === 'Space') shoot();
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [shoot]);

  // Unified Game Loop
  useEffect(() => {
    const loop = () => {
      if (!canvasRef.current || isPaused) {
        requestRef.current = requestAnimationFrame(loop);
        return;
      }

      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;
      const { width, height } = canvasRef.current;

      // Logic: Level Timer
      if (levelTextTimerRef.current > 0) {
        levelTextTimerRef.current--;
        if (levelTextTimerRef.current === 0) {
          setShowLevelText(false);
        }
      }

      // Logic: Starfield movement
      starsRef.current.forEach(s => {
        s.y += s.speed;
        if (s.y > height) s.y = 0;
      });

      // Skip logic while level intro is showing
      if (levelTextTimerRef.current <= 0 && !isTransitioningRef.current) {
        // Player Movement
        if (keysPressed.current['ArrowLeft'] && playerRef.current.x > 0) {
          playerRef.current.x -= playerRef.current.speed;
        }
        if (keysPressed.current['ArrowRight'] && playerRef.current.x < width - playerRef.current.w) {
          playerRef.current.x += playerRef.current.speed;
        }

        // Continuous Shooting
        if (keysPressed.current['Space']) {
          shoot();
        }

        // Bullets
        const beforeCount = bulletsRef.current.length;
        bulletsRef.current = bulletsRef.current.filter(b => {
          b.y -= b.speed;
          return b.y > 0;
        });
        if (beforeCount !== bulletsRef.current.length) {
          console.log(`🗑️ Bullets cleaned: ${beforeCount} -> ${bulletsRef.current.length}`);
        }

        // Shooting probability (+10% each level)
        const shootProb = 0.002 * Math.pow(1.1, level - 1);

        // Enemy movement
        let edgeHit = false;
        enemiesRef.current.forEach(e => {
          if (!e.isDiving) {
            e.x += e.direction * (1 + level * 0.1);
            if (e.x > width - 40 || e.x < 10) edgeHit = true;
          } else {
            e.y += (3 + level * 0.2);
            e.x += Math.sin(e.y / 20) * 2;
            if (e.y > height) {
              e.y = 0;
              e.isDiving = false;
            }
          }

          if (!e.isDiving && Math.random() < 0.001) e.isDiving = true;
          
          if (Math.random() < shootProb) {
            enemyBulletsRef.current.push({ 
              x: e.x + e.w/2, y: e.y + e.h, w: 4, h: 10, speed: 4 + level * 0.1 
            });
          }
        });

        if (edgeHit) {
          enemiesRef.current.forEach(e => {
            if (!e.isDiving) {
              e.direction *= -1;
              e.y += 5;
            }
          });
        }

        // Enemy bullets
        enemyBulletsRef.current = enemyBulletsRef.current.filter(eb => {
          eb.y += eb.speed;
          return eb.y < height;
        });

        // Collisions: Bullets vs Enemies
        bulletsRef.current.forEach((b, bi) => {
          enemiesRef.current.forEach((e, ei) => {
            if (b.x < e.x + e.w && b.x + b.w > e.x && b.y < e.y + e.h && b.y + b.h > e.y) {
              e.hp--;
              bulletsRef.current.splice(bi, 1);
              if (e.hp <= 0) {
                for (let i = 0; i < 8; i++) {
                  particlesRef.current.push({
                    x: e.x + e.w / 2,
                    y: e.y + e.h / 2,
                    vx: (Math.random() - 0.5) * 4,
                    vy: (Math.random() - 0.5) * 4,
                    life: 30,
                    color: e.type === 'boss' ? '#4ade80' : e.type === 'red' ? '#f87171' : '#60a5fa'
                  });
                }
                enemiesRef.current.splice(ei, 1);
                enemiesKilled.current++;
                setScore(prev => prev + (e.type === 'boss' ? 400 : e.type === 'red' ? 150 : 80));
              }
            }
          });
        });

        // Collisions: Enemy Bullets/Body vs Player
        enemyBulletsRef.current.forEach((eb) => {
          if (eb.x < playerRef.current.x + playerRef.current.w && 
              eb.x + eb.w > playerRef.current.x && 
              eb.y < playerRef.current.y + playerRef.current.h && 
              eb.y + eb.h > playerRef.current.y) {
            onGameOver(score, enemiesKilled.current);
          }
        });
        enemiesRef.current.forEach(e => {
          if (e.x < playerRef.current.x + playerRef.current.w && 
              e.x + e.w > playerRef.current.x && 
              e.y < playerRef.current.y + playerRef.current.h && 
              e.y + e.h > playerRef.current.y) {
            onGameOver(score, enemiesKilled.current);
          }
        });

        // Level completion check
        if (enemiesRef.current.length === 0 && !isTransitioningRef.current) {
          isTransitioningRef.current = true;
          if (level < 7) {
            onLevelComplete(level + 1);
          } else {
            onWin();
          }
        }
      }

      // Logic: Particles
      particlesRef.current = particlesRef.current.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        return p.life > 0;
      });

      // Drawing
      ctx.clearRect(0, 0, width, height);
      
      // Debug: bullets count
      if (bulletsRef.current.length > 0) {
        console.log(`🎨 Rendering ${bulletsRef.current.length} bullets:`, bulletsRef.current.map(b => ({x: b.x, y: b.y})));
      }

      // Draw Stars
      ctx.fillStyle = 'white';
      starsRef.current.forEach(s => {
        ctx.globalAlpha = s.size / 2;
        ctx.fillRect(s.x, s.y, s.size, s.size);
      });
      ctx.globalAlpha = 1;

      // Draw Player
      ctx.fillStyle = 'white';
      ctx.fillRect(playerRef.current.x, playerRef.current.y + 10, playerRef.current.w, playerRef.current.h - 10);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(playerRef.current.x + 10, playerRef.current.y, playerRef.current.w - 20, 15);
      ctx.fillStyle = '#60a5fa';
      ctx.globalAlpha = 0.5 + Math.random() * 0.5;
      ctx.fillRect(playerRef.current.x + 12, playerRef.current.y + playerRef.current.h, playerRef.current.w - 24, 8);
      ctx.globalAlpha = 1;

      // Draw Bullets
      ctx.fillStyle = '#ef4444';
      bulletsRef.current.forEach(b => ctx.fillRect(b.x, b.y, b.w, b.h));

      // Draw Enemy Bullets
      ctx.fillStyle = '#ffffff';
      enemyBulletsRef.current.forEach(eb => ctx.fillRect(eb.x, eb.y, eb.w, eb.h));

      // Draw Enemies
      enemiesRef.current.forEach(e => {
        if (e.type === 'boss') {
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(e.x, e.y, e.w, e.h);
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.arc(e.x + e.w / 2, e.y + e.h / 2, 6, 0, Math.PI * 2);
          ctx.fill();
        } else if (e.type === 'red') {
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(e.x, e.y, e.w, e.h);
        } else {
          ctx.fillStyle = '#60a5fa';
          ctx.fillRect(e.x, e.y, e.w, e.h);
        }
      });

      // Draw Particles
      particlesRef.current.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / 30;
        ctx.fillRect(p.x, p.y, 3, 3);
      });
      ctx.globalAlpha = 1;

      // Draw Overlay Text
      if (levelTextTimerRef.current > 0) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#f20df2';
        ctx.font = '24px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText(`LEVEL ${level}`, width / 2, height / 2);
        ctx.fillStyle = 'white';
        ctx.font = '12px "Press Start 2P"';
        ctx.fillText('READY PILOT?', width / 2, height / 2 + 50);
      }

      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPaused, level, onGameOver, onLevelComplete, onWin, setScore, score]);

  return (
    <div className="absolute inset-0 bg-black flex flex-col">
       <div className="flex justify-between items-center px-4 py-2 bg-black/50 z-20 backdrop-blur-sm border-b border-white/10">
          <div className="text-red-500 text-sm animate-pulse font-arcade">1UP</div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-gray-400 font-arcade uppercase">Score</span>
            <span className="text-yellow-400 text-sm font-arcade">{score.toLocaleString()}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[8px] text-gray-400 font-arcade uppercase">Sector</span>
            <span className="text-white text-sm font-arcade">{level}</span>
          </div>
        </div>

      <canvas 
        ref={canvasRef} 
        className="flex-1 w-full bg-black cursor-none"
      />

      <div className="bg-zinc-950 pb-20 pt-2 px-4 flex justify-center items-center gap-6 border-t border-white/10 relative z-20 pointer-events-auto">
        <button 
          onPointerDown={() => keysPressed.current['ArrowLeft'] = true}
          onPointerUp={() => keysPressed.current['ArrowLeft'] = false}
          onPointerLeave={() => keysPressed.current['ArrowLeft'] = false}
          className="w-20 h-20 rounded-full bg-zinc-800 shadow-[0_4px_0_rgba(0,0,0,1)] border-b-4 border-zinc-950 active:translate-y-1 active:shadow-none transition-all flex justify-center items-center"
        >
          <span className="material-symbols-outlined text-4xl text-zinc-400">arrow_back</span>
        </button>
        
        <div className="relative -mt-4">
          <button 
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              shoot();
            }}
            className="w-24 h-24 rounded-full bg-red-600 shadow-[0_6px_0_#991b1b,0_8px_15px_rgba(220,38,38,0.4)] border-b-4 border-red-900 active:translate-y-1 active:shadow-none transition-all flex flex-col justify-center items-center z-10 touch-none select-none pointer-events-auto"
          >
            <span className="material-symbols-outlined text-5xl text-red-100">gps_fixed</span>
            <span className="text-[10px] text-red-200 mt-1 tracking-widest font-bold uppercase">Fire</span>
          </button>
          <div className="absolute inset-0 rounded-full bg-red-500/20 blur-xl -z-0"></div>
        </div>

        <button 
          onPointerDown={() => keysPressed.current['ArrowRight'] = true}
          onPointerUp={() => keysPressed.current['ArrowRight'] = false}
          onPointerLeave={() => keysPressed.current['ArrowRight'] = false}
          className="w-20 h-20 rounded-full bg-zinc-800 shadow-[0_4px_0_rgba(0,0,0,1)] border-b-4 border-zinc-950 active:translate-y-1 active:shadow-none transition-all flex justify-center items-center"
        >
          <span className="material-symbols-outlined text-4xl text-zinc-400">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};

export default GameEngine;
