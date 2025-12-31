
import React, { useState, useCallback } from 'react';
import { GameState, ScoreEntry, GameStats } from './types';
import GameEngine from './components/GameEngine';

const App: React.FC = () => {
  const [state, setState] = useState<GameState>(GameState.START);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(20000);
  const [lastStats, setLastStats] = useState<GameStats>({
    enemiesKilled: 0,
    accuracy: 95,
    stage: 1,
    score: 0
  });

  const startGame = useCallback(() => {
    setScore(0);
    setLevel(1);
    setState(GameState.PLAYING);
  }, []);

  const handleGameOver = useCallback((finalScore: number, enemies: number) => {
    setLastStats({
      enemiesKilled: enemies,
      accuracy: Math.floor(Math.random() * 20) + 80,
      stage: level,
      score: finalScore
    });
    if (finalScore > highScore) setHighScore(finalScore);
    setState(GameState.GAMEOVER);
  }, [highScore, level]);

  const handleLevelComplete = useCallback((nextLevel: number) => {
    setLevel(nextLevel);
  }, []);

  const handleWin = useCallback(() => {
    setState(GameState.WINNER);
  }, []);

  // Screen Components
  const StartScreen = () => (
    <div className="relative flex h-full w-full flex-col bg-[#050205] overflow-hidden justify-between items-center text-white">
      <div className="flex flex-col items-center justify-center gap-6 px-6 z-20 flex-1">
        <div className="relative w-24 h-24 mb-4">
          <div className="absolute inset-0 bg-[#f20df2] rounded-full opacity-20 blur-xl animate-pulse"></div>
          <span className="material-symbols-outlined absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-7xl text-[#f20df2] drop-shadow-[0_0_10px_rgba(242,13,242,0.8)]">
            rocket_launch
          </span>
        </div>
        <h1 className="text-5xl font-black text-center tracking-tighter leading-none italic transform -skew-x-6 drop-shadow-[4px_4px_0px_rgba(242,13,242,0.6)]">
          SANGMIN<br/>
          <span className="text-[#f20df2] text-4xl not-italic skew-x-0 tracking-widest">GALAXY</span>
        </h1>
        <h3 className="text-white/80 tracking-[0.2em] text-[10px] font-bold uppercase mt-8 animate-pulse text-center font-arcade">
          Press Start to Defend Earth
        </h3>
      </div>
      
      <div className="flex flex-col w-full px-6 pb-12 z-20 gap-4">
        <button 
          onClick={startGame}
          className="relative group flex w-full items-center justify-center overflow-hidden rounded-lg h-16 bg-[#f20df2] text-white shadow-[0_0_30px_rgba(242,13,242,0.4)] transition-all active:scale-95 hover:bg-[#d60cd6]"
        >
          <span className="material-symbols-outlined mr-3 text-2xl">play_arrow</span>
          <span className="text-lg font-bold tracking-widest uppercase">Start Mission</span>
        </button>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => setState(GameState.SCORES)}
            className="flex w-full items-center justify-center rounded-lg h-12 border border-white/20 bg-black/40 text-white"
          >
            <span className="material-symbols-outlined mr-2 text-[#f20df2] text-sm">leaderboard</span>
            <span className="text-xs font-bold tracking-wider">SCORES</span>
          </button>
          <button className="flex w-full items-center justify-center rounded-lg h-12 border border-white/20 bg-black/40 text-white">
            <span className="material-symbols-outlined mr-2 text-[#f20df2] text-sm">settings</span>
            <span className="text-xs font-bold tracking-wider">OPTIONS</span>
          </button>
        </div>
      </div>
    </div>
  );

  const WinnerScreen = () => (
    <div className="h-full w-full relative flex flex-col items-center justify-center p-6 bg-[#0a0a20] overflow-hidden text-center">
       <div className="absolute inset-0 bg-gradient-to-b from-[#135bec]/20 to-transparent"></div>
       <div className="relative z-10 flex flex-col items-center gap-6">
          <h1 className="text-6xl font-black italic tracking-tighter text-yellow-400 animate-bounce drop-shadow-[0_0_30px_rgba(250,204,21,0.6)]">WINNER!</h1>
          <div className="w-32 h-32 bg-yellow-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(250,204,21,0.8)] border-4 border-white">
            <span className="material-symbols-outlined text-6xl text-white">star</span>
          </div>
          <p className="text-white text-xl font-bold tracking-widest uppercase mt-4">Galaxy Restored</p>
          <p className="text-gray-400 max-w-xs">You have successfully cleared all 7 sectors. You are the ultimate pilot!</p>
          <div className="mt-8">
             <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Final Score</p>
             <h2 className="text-white text-5xl font-bold">{score.toLocaleString()}</h2>
          </div>
          <button 
            onClick={() => setState(GameState.START)}
            className="mt-12 bg-white text-[#0a0a20] px-10 py-4 rounded-full font-bold tracking-widest uppercase shadow-xl active:scale-95 transition-transform"
          >
            Mission Report
          </button>
       </div>
    </div>
  );

  const GameOverScreen = () => (
    <div className="h-full w-full relative flex flex-col items-center justify-between p-6 overflow-hidden">
      <div className="absolute inset-0 bg-[#050a14]/90 z-0"></div>
      
      <div className="relative z-10 flex flex-col items-center w-full pt-12 gap-8">
        <h1 className="text-white tracking-widest text-4xl font-bold leading-tight text-center drop-shadow-[0_0_15px_rgba(19,91,236,0.6)] animate-pulse">
          GAME OVER
        </h1>
        <div className="w-20 h-20 bg-[#1a202c] rounded-full flex items-center justify-center border border-white/10 shadow-2xl">
          <span className="material-symbols-outlined text-4xl text-[#135bec]">rocket_launch</span>
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center w-full gap-8">
        <div className="text-center">
          <p className="text-gray-400 text-[10px] font-medium uppercase tracking-[0.2em]">Final Score</p>
          <h2 className="text-white text-5xl font-bold tracking-tighter drop-shadow-lg">{lastStats.score.toLocaleString()}</h2>
          <div className="bg-white/5 px-4 py-1 rounded-full mt-3 border border-white/5 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-yellow-500 text-xs">trophy</span>
            <p className="text-gray-400 text-[10px]">High Score: {highScore.toLocaleString()}</p>
          </div>
        </div>

        <div className="w-full grid grid-cols-3 gap-3">
          <div className="bg-[#282e39]/80 p-3 rounded-2xl flex flex-col items-center border border-white/5">
             <span className="material-symbols-outlined text-[#135bec] text-lg mb-1">pest_control</span>
             <p className="text-white text-md font-bold">{lastStats.enemiesKilled}</p>
             <p className="text-gray-400 text-[8px] uppercase font-bold tracking-widest">Enemies</p>
          </div>
          <div className="bg-[#282e39]/80 p-3 rounded-2xl flex flex-col items-center border border-white/5">
             <span className="material-symbols-outlined text-[#135bec] text-lg mb-1">target</span>
             <p className="text-white text-md font-bold">{lastStats.accuracy}%</p>
             <p className="text-gray-400 text-[8px] uppercase font-bold tracking-widest">Accuracy</p>
          </div>
          <div className="bg-[#282e39]/80 p-3 rounded-2xl flex flex-col items-center border border-white/5">
             <span className="material-symbols-outlined text-[#135bec] text-lg mb-1">flag</span>
             <p className="text-white text-md font-bold">{lastStats.stage}</p>
             <p className="text-gray-400 text-[8px] uppercase font-bold tracking-widest">Stage</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex flex-col w-full gap-4 pb-8">
        <button 
          onClick={startGame}
          className="w-full bg-[#135bec] hover:bg-blue-600 text-white font-bold h-14 rounded-full shadow-[0_4px_20px_0_rgba(19,91,236,0.5)] flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">replay</span> PLAY AGAIN
        </button>
        <button 
          onClick={() => setState(GameState.START)}
          className="w-full bg-transparent text-white font-medium h-14 rounded-full border border-white/20 hover:bg-white/5 flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">home</span> BACK TO TITLE
        </button>
      </div>
    </div>
  );

  const ScoresScreen = () => {
    const scores: ScoreEntry[] = [
      { name: 'AAA', score: 1000000, rank: '01' },
      { name: 'BBB', score: 850000, rank: '02' },
      { name: 'CCC', score: 720000, rank: '03' },
      { name: 'ZAP', score: 650400, rank: '04' },
      { name: 'NEO', score: 590100, rank: '05' },
      { name: 'FLY', score: 440000, rank: '06' },
      { name: 'SKY', score: 320500, rank: '07' },
    ];

    return (
      <div className="h-full w-full bg-[#050510] flex flex-col text-white p-6 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[30%] bg-[#135bec]/20 blur-[100px] rounded-full"></div>
        
        <header className="relative z-10 flex flex-col items-center pt-8 pb-4 space-y-4">
          <div className="flex items-center justify-center space-x-3 w-full">
            <span className="material-symbols-outlined text-[#135bec] text-sm animate-pulse">rocket_launch</span>
            <h1 className="text-xl font-bold tracking-[0.2em] bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400 uppercase">Hall of Fame</h1>
            <span className="material-symbols-outlined text-[#135bec] text-sm rotate-180 animate-pulse">rocket_launch</span>
          </div>
          <div className="w-full flex justify-center bg-white/5 p-1 rounded-xl border border-white/10">
            <button className="flex-1 bg-[#135bec] py-2 rounded-lg text-[10px] font-bold tracking-widest">ALL TIME</button>
            <button className="flex-1 py-2 text-gray-400 text-[10px] font-bold tracking-widest">WEEKLY</button>
          </div>
        </header>

        <main className="relative z-10 flex-1 overflow-y-auto space-y-2 mt-4 pr-1">
          {scores.map((s, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${i === 0 ? 'bg-gradient-to-r from-yellow-500/20 to-transparent border-yellow-500/30' : 'bg-white/5 border-white/10'}`}>
              <div className={`flex items-center justify-center shrink-0 size-8 ${i === 0 ? 'text-yellow-400' : 'text-gray-400'} font-bold text-md`}>
                {i === 0 ? <span className="material-symbols-outlined text-[24px] fill-1">trophy</span> : s.rank}
              </div>
              <div className="flex flex-col flex-1">
                <p className="text-md font-bold tracking-widest">{s.name}</p>
                <p className="text-gray-400 text-[10px] tracking-wide uppercase">Rank {s.rank}</p>
              </div>
              <p className={`text-md font-bold tracking-wider ${i === 0 ? 'text-yellow-400' : 'text-white'}`}>{s.score.toLocaleString()}</p>
            </div>
          ))}
        </main>

        <footer className="relative z-10 pt-4">
          <button 
            onClick={() => setState(GameState.START)}
            className="w-full bg-[#135bec] p-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span> BACK TO TITLE
          </button>
        </footer>
      </div>
    );
  };

  return (
    <div className="flex justify-center items-center w-full h-screen bg-black">
      {/* Smartphone Container */}
      <div className="relative w-full max-w-[480px] h-full bg-[#050205] shadow-[0_0_100px_rgba(0,0,0,0.9)] border-x border-white/10 overflow-hidden select-none">
        {state === GameState.START && <StartScreen />}
        {state === GameState.PLAYING && (
          <GameEngine 
            level={level}
            onGameOver={handleGameOver} 
            onLevelComplete={handleLevelComplete}
            onWin={handleWin}
            isPaused={false} 
            score={score}
            setScore={setScore}
          />
        )}
        {state === GameState.GAMEOVER && <GameOverScreen />}
        {state === GameState.WINNER && <WinnerScreen />}
        {state === GameState.SCORES && <ScoresScreen />}
      </div>
    </div>
  );
};

export default App;
