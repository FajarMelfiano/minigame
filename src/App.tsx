import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Camera, Play, Pause, Gift, Target, ShieldAlert, Sparkles, MoveRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Upgrade = {
  id: number;
  name: string;
  desc: string;
  cost: number;
  effect: 'auto' | 'click';
  value: number;
  count: number;
  icon: string;
};

const INITIAL_UPGRADES: Upgrade[] = [
  { id: 1, name: 'Kipas Sate', desc: '+1 auto/sec', cost: 50, effect: 'auto', value: 1, count: 0, icon: '🪭' },
  { id: 2, name: 'Paru Latihan', desc: '+1 click', cost: 100, effect: 'click', value: 1, count: 0, icon: '🫁' },
  { id: 3, name: 'Blower Masjid', desc: '+10 auto/sec', cost: 500, effect: 'auto', value: 10, count: 0, icon: '🌪️' },
  { id: 4, name: 'Paru Baja', desc: '+5 click', cost: 1500, effect: 'click', value: 5, count: 0, icon: '⚙️' },
  { id: 5, name: 'Avatar Aang', desc: '+50 auto/sec', cost: 5000, effect: 'auto', value: 50, count: 0, icon: '💨' },
];

const GACHA_POOL = [
  // N (50%)
  { name: 'Struk Indomaret', rarity: 'N', emoji: '🧾' },
  { name: 'Batu Kali', rarity: 'N', emoji: '🪨' },
  { name: 'Sendal Putus', rarity: 'N', emoji: '🩴' },
  { name: 'Angin Lewat', rarity: 'N', emoji: '💨' },
  // R (30%)
  { name: 'Seblak Pedas', rarity: 'R', emoji: '🍜' },
  { name: 'Voucher 10k', rarity: 'R', emoji: '📱' },
  { name: 'Kucing Oren', rarity: 'R', emoji: '🐈' },
  // SR (15%)
  { name: 'Tiket VIP', rarity: 'SR', emoji: '🎬' },
  { name: 'AirPods KW', rarity: 'SR', emoji: '🎧' },
  { name: 'Pujian Tulus', rarity: 'SR', emoji: '🥺' },
  // SSR (4%)
  { name: 'Laptop Rata Kanan', rarity: 'SSR', emoji: '💻' },
  { name: 'Tiket ke Bali', rarity: 'SSR', emoji: '🏝️' },
  // UR (1%)
  { name: 'Bebas Overthinking', rarity: 'UR', emoji: '🕊️' },
  { name: 'Bebas Finansial', rarity: 'UR', emoji: '💎' },
];

export default function App() {
  const [currentPage, setCurrentPage] = useState(1);
  
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  return (
    <div className="w-full min-h-screen">
      {currentPage === 1 && <Page1 onNext={() => setCurrentPage(2)} />}
      {currentPage === 2 && <Page2 onNext={() => setCurrentPage(3)} onBack={() => setCurrentPage(1)} />}
      {currentPage === 3 && <Page3 onBack={() => setCurrentPage(2)} />}
    </div>
  );
}

/* ═══════════════════ PAGE 1 ═══════════════════ */
function Page1({ onNext }: { onNext: () => void }) {
  return (
    <div className="page-transition">
      <section className="hero">
        <div className="hero-bg-circle c1"></div>
        <div className="hero-bg-circle c2"></div>
        <div className="hero-inner">
          <p className="hero-label">↓ for you</p>
          <h1 className="hero-name">
            MUTIA<br />AL HAURA
            <span className="underline-red"></span>
          </h1>
          <div className="hero-date">05.05</div>
          <div className="hero-hbd">
            HAPPY BIRTHDAY
            <span className="hbd-tag">2010 → now</span>
          </div>
          <p className="scroll-hint">scroll down <span>↓</span></p>
        </div>

        <div className="hero-deco">
          <svg className="hero-deco-blob" viewBox="0 0 280 300" xmlns="http://www.w3.org/2000/svg">
            <path d="M200,40 C240,60 270,110 265,160 C260,210 230,260 185,275 C140,290 85,270 55,230 C25,190 30,130 55,90 C80,50 130,20 175,18 C185,17 195,35 200,40 Z"
              fill="none" stroke="#0a0a0a" strokeWidth="2" opacity="0.08"/>
            <path d="M195,55 C228,72 252,118 248,164 C244,210 216,252 176,265 C136,278 88,260 62,224 C36,188 42,134 65,96 C88,58 132,30 170,28 C182,27 190,47 195,55 Z"
              fill="#ffd600" opacity="0.12"/>
            <circle cx="248" cy="90" r="10" fill="#e8001d" opacity="0.7"/>
            <circle cx="40" cy="200" r="6" fill="#0057ff" opacity="0.6"/>
            <text x="255" y="200" fontFamily="'Bebas Neue', cursive" fontSize="11"
              fill="#0a0a0a" opacity="0.25" letterSpacing="3"
              transform="rotate(90, 255, 150)" textAnchor="middle">HAPPY BIRTHDAY</text>
          </svg>
        </div>

        <div className="hero-star s1">✦</div>
        <div className="hero-star s2">✶</div>
        <div className="hero-star s3">★</div>
      </section>

      <section className="section">
        <p className="section-num">01 — message</p>
        <div className="message-block">
          <div className="msg-line big"><span className="yellow-bg">happy birthday</span></div>
          <div className="msg-line big">yaaa 🎂</div>
          <div className="msg-line red-txt">another year unlocked 😭</div>
          <div className="msg-line blue-txt mt-4">semoga lebih chill</div>
          <div className="msg-line blue-txt">tahun ini.</div>
          <div className="msg-line mt-[14px] opacity-55 text-[clamp(14px,3vw,26px)]">less overthinking,<br/>more good days.</div>
        </div>
        <p className="msg-sub">— from someone who cares (obviously)</p>
      </section>

      <section className="section">
        <p className="section-num">02 — things about you</p>
        <h2 className="facts-title">5 things<br/>about you<span className="dot-blue"></span></h2>
        <ul className="facts-list">
          <li className="fact-item">
            <span className="fact-num">01</span>
            <span className="fact-text">lowkey random <span className="fact-tag">always</span></span>
          </li>
          <li className="fact-item">
            <span className="fact-num">02</span>
            <span className="fact-text">kadang diem banget</span>
          </li>
          <li className="fact-item">
            <span className="fact-num">03</span>
            <span className="fact-text">kadang rame sendiri 😭</span>
          </li>
          <li className="fact-item">
            <span className="fact-num">04</span>
            <span className="fact-text">overthinking dikit <span className="fact-tag">classic</span></span>
          </li>
          <li className="fact-item pb-0 border-b-0">
            <span className="fact-num">05</span>
            <span className="fact-text">but still... <strong>you're you.</strong> and that's the best part.</span>
          </li>
        </ul>
      </section>

      <section className="section">
        <p className="section-num">03 — notes</p>
        <div className="notes-grid">
          <div className="note-card yellow-card">umur nambah, encok juga nambah <span className="card-star">★</span></div>
          <div className="note-card red-card">take it easy. fr. <span className="card-star">✦</span></div>
          <div className="note-card">enjoy your day <span className="card-star">✶</span></div>
          <div className="note-card blue-card">you deserve good things <span className="card-star">★</span></div>
        </div>
      </section>

      <div className="nav-section">
        <p className="nav-label">photos await →</p>
        <button className="btn-main" onClick={onNext}><span>see your photos ↗</span></button>
      </div>
    </div>
  );
}

/* ═══════════════════ PAGE 2 ═══════════════════ */
function Page2({ onNext, onBack }: { onNext: () => void, onBack: () => void }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => console.log('Audio play failed, maybe needs interaction'));
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="page-transition">
      <div className="gallery-hero">
        <div className="gallery-hero-bg"></div>
        <div className="gallery-title">
          <span className="line-red">YOUR</span><br/>
          PHOTOS.
        </div>
      </div>

      <div className="music-section flex flex-col justify-center">
        <p className="music-label">🎵 vibe check</p>
        <div className="music-card">
          <button className={`music-btn ${isPlaying ? 'playing play-pop' : ''}`} onClick={toggleMusic} title="play / pause">
            <span>{isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1"/>}</span>
          </button>
          <div className="music-info">
            <div className="music-title">Best Part</div>
            <div className="music-artist">Daniel Caesar ft. H.E.R.</div>
          </div>
          <p className="music-vibe mt-auto">→ play this for the vibe</p>
        </div>
        <audio ref={audioRef} src="src/music.mp3" preload="auto" />
      </div>

      <div className="gallery-section">
        <div className="ed-row-1">
          <div className="ed-photo group">
            <div className="ed-ph"><Camera className="ed-ph-icon" /><div className="ed-ph-text">add photo</div></div>
            <div className="ed-index">01</div>
            <div className="ed-caption"><span className="ed-cap-tag red">this one.</span></div>
          </div>
          <div className="ed-photo group">
            <div className="ed-ph"><Camera className="ed-ph-icon" /><div className="ed-ph-text">add photo</div></div>
            <div className="ed-index">02</div>
            <div className="ed-caption"><span className="ed-cap-tag">fav ✦</span></div>
          </div>
        </div>

        <div className="ed-row-2">
          <div className="ed-photo group">
            <div className="ed-ph"><Camera className="ed-ph-icon" /><div className="ed-ph-text">add photo</div></div>
            <div className="ed-overlay-text">
              <span className="ed-overlay-big">you here.</span>
              <span className="ed-overlay-sub">05 · 05 · 2010</span>
            </div>
          </div>
        </div>

        <div className="ed-row-3">
          <div className="ed-photo group">
            <div className="ed-ph"><Camera className="ed-ph-icon" /><div className="ed-ph-text">add photo</div></div>
            <div className="ed-index">04</div>
            <div className="ed-caption"><span className="ed-cap-tag blue">nice.</span></div>
          </div>
          <div className="ed-photo group">
            <div className="ed-ph"><Camera className="ed-ph-icon" /><div className="ed-ph-text">add photo</div></div>
            <div className="ed-index">05</div>
            <div className="ed-caption"><span className="ed-cap-tag yel">always.</span></div>
          </div>
          <div className="ed-photo group">
            <div className="ed-ph"><Camera className="ed-ph-icon" /><div className="ed-ph-text">add photo</div></div>
            <div className="ed-index">06</div>
            <div className="ed-caption"><span className="ed-cap-tag">u. 🔴</span></div>
          </div>
        </div>
      </div>

      <div className="nav-section">
        <p className="nav-label">bosen? main game yok →</p>
        <button className="btn-main" onClick={onNext}><span>Play Mini Games 🎮</span></button>
      </div>

      <div className="back-nav">
        <div className="back-note">still <span>you</span>. always. ✦</div>
        <button className="btn-back" onClick={onBack}>← back</button>
      </div>
    </div>
  );
}

/* ═══════════════════ PAGE 3 (GAMES) ═══════════════════ */

function Page3({ onBack }: { onBack: () => void }) {
  const [coins, setCoins] = useState(0);
  const [inventory, setInventory] = useState<{name: string, rarity: string, emoji: string}[]>([]);

  return (
    <div className="page-transition">
      <div className="gallery-hero md:!col-span-4 bg-black text-white !pb-12 relative overflow-hidden">
        <div className="gallery-title z-10 relative drop-shadow-[4px_4px_0px_rgba(232,0,29,1)]">
          <span className="line-red text-yellow-400 drop-shadow-none">ARCADE</span><br />
          <span className="text-white font-impact tracking-wider">EDITION.</span>
        </div>
        <p className="font-mono text-xs opacity-80 mt-6 tracking-widest uppercase z-10 relative">
          Kumpulkan COIN dari mini-game dan gacha sampai lemes!
        </p>
        <div className="absolute top-8 right-8 bg-black border-4 border-yellow-400 text-yellow-400 px-4 py-2 md:px-6 md:py-3 rounded-full font-impact text-xl md:text-3xl shadow-[4px_4px_0px_0px_rgba(255,214,0,1)] z-20 animate-bounce">
          💰 {Math.floor(coins)} COIN
        </div>
      </div>

      <Game3_Clicker coins={coins} setCoins={setCoins} />
      <Game1_Overthinking coins={coins} setCoins={setCoins} />
      <Game2_Gacha coins={coins} setCoins={setCoins} inventory={inventory} setInventory={setInventory} />

      <div className="back-nav bg-[#f2f2f2] md:!col-span-4">
        <div className="back-note text-black">udah capek mainnya? <span>haha</span>.</div>
        <button className="btn-back" onClick={onBack}>← Back to Photos</button>
      </div>
    </div>
  );
}

// -- GAME 3: IDLE CLICKER --
function Game3_Clicker({ coins, setCoins }: { coins: number, setCoins: React.Dispatch<React.SetStateAction<number>> }) {
  const [clickPower, setClickPower] = useState(1);
  const [autoPower, setAutoPower] = useState(0);
  const [upgrades, setUpgrades] = useState<Upgrade[]>(INITIAL_UPGRADES);
  
  const [clicks, setClicks] = useState<{id: number, x: number, y: number, text: string}[]>([]);

  useEffect(() => {
    if (autoPower > 0) {
      const timer = setInterval(() => {
        setCoins(c => c + autoPower);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [autoPower, setCoins]);

  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    setCoins(c => c + clickPower);
    const id = Date.now();
    setClicks(prev => [...prev, { id, x, y, text: `+${clickPower}` }]);
    setTimeout(() => {
      setClicks(prev => prev.filter(c => c.id !== id));
    }, 1000);
    
    const btn = document.getElementById('flame-btn');
    if (btn) {
      btn.style.transform = 'scale(0.9)';
      setTimeout(() => btn.style.transform = 'scale(1)', 100);
    }
  };

  const buyUpgrade = (id: number) => {
    const upg = upgrades.find(u => u.id === id);
    if (!upg || coins < upg.cost) return;
    
    setCoins(c => c - upg.cost);
    
    if (upg.effect === 'auto') {
      setAutoPower(a => a + upg.value);
    } else {
      setClickPower(c => c + upg.value);
    }
    
    setUpgrades(prev => prev.map(u => {
      if (u.id === id) {
        return { ...u, count: u.count + 1, cost: Math.floor(u.cost * 1.5) };
      }
      return u;
    }));
  };

  return (
    <div className="section md:!col-span-4 bg-[#74b9ff] flex flex-col md:flex-row gap-8 items-stretch pt-20">
      <div className="flex-1 flex flex-col items-center border-4 border-black bg-white rounded-3xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
        <h2 className="font-impact text-4xl mb-2 text-center text-blue-600 tracking-wider">PABRIK COIN LILIN</h2>
        <p className="font-mono text-xs opacity-60 mb-6 text-center text-black font-bold uppercase border-b-2 border-black pb-1">Klik secepat mungkin! Upgrade usahamu.</p>
        
        <div className="text-3xl font-impact bg-yellow-400 px-6 py-2 border-4 border-black rounded-full mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          +{autoPower} COIN/dtk
        </div>
        
        <button 
          id="flame-btn"
          onMouseDown={handleTap}
          onTouchStart={handleTap}
          className="w-48 h-48 bg-red-500 rounded-full border-8 border-black flex items-center justify-center text-7xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-transform select-none mb-8 cursor-pointer relative"
          style={{ touchAction: 'none' }}
        >
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}>🔥</motion.div>
        </button>

        <AnimatePresence>
          {clicks.map(c => (
            <motion.div
              key={c.id}
              initial={{ opacity: 1, y: c.y, x: c.x, scale: 0.5 }}
              animate={{ opacity: 0, y: c.y - 120, scale: 1.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute pointer-events-none font-impact text-4xl text-yellow-400 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]"
            >
              {c.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      <div className="flex-1 flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
        {upgrades.map(u => (
          <button 
            key={u.id}
            onClick={() => buyUpgrade(u.id)}
            disabled={coins < u.cost}
            className={`flex items-center gap-4 p-4 border-4 border-black rounded-2xl text-left transition-all ${coins >= u.cost ? 'bg-white hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer' : 'bg-gray-200 opacity-60 cursor-not-allowed'}`}
          >
            <div className="text-4xl bg-gray-100 w-16 h-16 rounded-xl border-2 border-black flex items-center justify-center flex-shrink-0 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              {u.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-impact text-xl tracking-wide">{u.name} <span className="text-sm bg-black text-white px-2 py-0.5 rounded ml-2 font-mono">Lv.{u.count}</span></h3>
              <p className="font-mono text-xs opacity-70 mt-1 uppercase font-bold text-blue-600">{u.desc}</p>
            </div>
            <div className="font-impact text-xl text-yellow-500 bg-black px-3 py-1 rounded-full border-2 border-yellow-400 shadow-[2px_2px_0px_rgba(255,214,0,1)]">
              💰 {u.cost}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// -- GAME 1: SURVIVAL OVERTHINKING --
function Game1_Overthinking({ coins, setCoins }: { coins: number, setCoins: React.Dispatch<React.SetStateAction<number>> }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [targets, setTargets] = useState<{ id: number, type: 'bad' | 'good', x: number, y: number }[]>([]);
  
  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setTimeLeft(30);
    setTargets([]);
  };

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      const targetTimer = setInterval(() => {
        setTargets(prev => {
          if (prev.length > 6) return prev;
          const isGood = Math.random() < 0.25;
          return [...prev, {
            id: Date.now(),
            type: isGood ? 'good' : 'bad',
            x: Math.random() * 80 + 10,
            y: Math.random() * 70 + 15,
          }];
        });
      }, Math.max(300, 800 - score * 15));

      const cd = setInterval(() => setTimeLeft(t => t - 1), 1000);
      
      return () => { clearInterval(targetTimer); clearInterval(cd); };
    } else if (timeLeft === 0 && isPlaying) {
      setIsPlaying(false);
    }
  }, [isPlaying, timeLeft, score]);

  useEffect(() => {
    if (isPlaying) {
      const cleaner = setInterval(() => {
        setTargets(prev => prev.filter(t => Date.now() - t.id < 2500));
      }, 500);
      return () => clearInterval(cleaner);
    }
  }, [isPlaying]);

  const hitTarget = (id: number, type: 'bad' | 'good', e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isPlaying) return;
    
    setTargets(prev => prev.filter(t => t.id !== id));
    
    if (type === 'bad') {
      setScore(s => s + 1);
      setCoins(c => c + 5);
      let cx = 0; let cy = 0;
      if ('touches' in e) {
        cx = e.touches[0].clientX / window.innerWidth;
        cy = e.touches[0].clientY / window.innerHeight;
      } else {
        cx = (e as React.MouseEvent).clientX / window.innerWidth;
        cy = (e as React.MouseEvent).clientY / window.innerHeight;
      }
      confetti({ particleCount: 15, spread: 30, origin: { x: cx, y: cy } });
    } else {
      setScore(s => Math.max(0, s - 3));
      setCoins(c => Math.max(0, c - 10)); // penalty
      const container = document.getElementById('whack-container');
      if (container) {
        container.classList.add('animate-shake');
        setTimeout(() => container.classList.remove('animate-shake'), 400);
      }
    }
  };

  return (
    <div className="section md:!col-span-4 bg-[#ffeea8] flex flex-col items-center">
      <div className="w-full flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="text-center md:text-left">
          <h2 className="font-impact text-4xl uppercase text-black tracking-wider">PUKUL OVERTHINKING</h2>
          <p className="font-mono text-sm opacity-80 mt-1 font-bold">Hajar setan merah (+5 Coin), hindari es biru (-10 Coin)!</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-black text-white px-6 py-2 rounded-full font-impact text-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black tracking-widest">
            ⏱ {timeLeft}S
          </div>
          <div className="bg-red-500 text-white px-6 py-2 rounded-full font-impact text-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black tracking-widest">
            💀 {score}
          </div>
        </div>
      </div>

      <div id="whack-container" className="relative w-full h-[400px] border-[6px] border-black rounded-3xl bg-white overflow-hidden cursor-crosshair shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMSIgZmlsbD0icmdiYSgwLDAsMCwwLjEpIi8+PC9zdmc+')]">
        {!isPlaying && timeLeft === 0 && score > 0 && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-20 text-white p-6 text-center">
            <motion.h3 initial={{scale:0}} animate={{scale:1}} className="font-impact text-5xl md:text-7xl text-yellow-400 mb-2 drop-shadow-[4px_4px_0px_rgba(232,0,29,1)]">WAKTU HABIS</motion.h3>
            <p className="font-mono text-xl mb-8 uppercase text-gray-300 font-bold border-b-2 border-white pb-2 inline-block">Score Akhir: {score} | Cuan: {score * 5} Coin</p>
            <button onClick={startGame} className="btn-main !bg-red-500 !text-white text-2xl px-10 py-5"><span>Main Lagi 🎮</span></button>
          </div>
        )}
        
        {!isPlaying && score === 0 && (
          <div className="absolute inset-x-8 inset-y-8 md:inset-x-20 md:inset-y-20 flex flex-col items-center justify-center z-20 bg-yellow-400 border-[6px] border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 text-center">
            <h3 className="font-impact text-4xl mb-4 text-black uppercase">Pembersihan Pikiran</h3>
            <p className="font-mono text-sm uppercase font-bold text-gray-800 mb-8 max-w-sm">Siapkan jari jemari. Jangan klik yang biru atau duitmu dikurangin 10 Coin bro.</p>
            <button onClick={startGame} className="btn-main !bg-black !text-white text-2xl hover:!text-yellow-400"><span>START SURVIVAL 🔥</span></button>
          </div>
        )}

        <AnimatePresence>
          {targets.map(t => (
            <motion.button
              key={t.id}
              initial={{ scale: 0, rotate: t.type === 'bad' ? -15 : 15 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              onMouseDown={(e) => hitTarget(t.id, t.type, e)}
              onTouchStart={(e) => hitTarget(t.id, t.type, e)}
              style={{ top: `${t.y}%`, left: `${t.x}%`, touchAction: 'none' }}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-black flex flex-col items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-impact leading-[0.9] tracking-tight hover:brightness-110 active:scale-90 transition-all
                ${t.type === 'bad' ? 'w-24 h-24 md:w-28 md:h-28 bg-red-600 text-white animate-pulse text-lg md:text-xl' : 'w-20 h-20 md:w-24 md:h-24 bg-blue-400 text-white text-sm md:text-base'}`}
            >
              {t.type === 'bad' ? <><span className="text-3xl mb-1">👿</span><br/>OVER<br/>THINK</> : <><span className="text-2xl mb-1">🧊</span><br/>CHILL</>}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// -- GAME 2: GACHA REWARD --
function Game2_Gacha({ coins, setCoins, inventory, setInventory }: { coins: number, setCoins: React.Dispatch<React.SetStateAction<number>>, inventory: any[], setInventory: React.Dispatch<React.SetStateAction<any[]>> }) {
  const [isPulling, setIsPulling] = useState(false);
  const [pulledItem, setPulledItem] = useState<{name: string, rarity: string, emoji: string} | null>(null);

  const pull1 = () => doPull(1);
  const pull10 = () => doPull(10);

  const doPull = (times: number) => {
    const cost = times * 100;
    if (coins < cost || isPulling) return;
    setCoins(c => c - cost);
    setIsPulling(true);
    setPulledItem(null);

    const pullResults: any[] = [];
    for (let i = 0; i < times; i++) {
      const rand = Math.random();
      let rType = 'N';
      if (rand < 0.01) rType = 'UR';
      else if (rand < 0.05) rType = 'SSR';
      else if (rand < 0.20) rType = 'SR';
      else if (rand < 0.50) rType = 'R';
      
      const pool = GACHA_POOL.filter(p => p.rarity === rType);
      const item = pool[Math.floor(Math.random() * pool.length)];
      pullResults.push(item);
    }

    setTimeout(() => {
      setIsPulling(false);
      setInventory(prev => [...prev, ...pullResults]);
      
      const bestItem = pullResults.reduce((best, curr) => {
        const ranks = { N: 1, R: 2, SR: 3, SSR: 4, UR: 5 };
        return ranks[curr.rarity as keyof typeof ranks] > ranks[best.rarity as keyof typeof ranks] ? curr : best;
      }, pullResults[0]);

      setPulledItem(pullResults.length === 1 ? pullResults[0] : { name: `Dapat 10 Item!\n(Best: ${bestItem.name})`, rarity: bestItem.rarity, emoji: '📦' });

      if (bestItem.rarity === 'UR' || bestItem.rarity === 'SSR') {
        confetti({ particleCount: 300, spread: 160, startVelocity: 60, origin: { y: 0.8 } });
      } else if (bestItem.rarity === 'SR') {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.8 } });
      }
    }, 1500);
  };

  const rarityColors = {
    N: 'bg-gray-300 text-gray-800',
    R: 'bg-[#74b9ff] text-white',
    SR: 'bg-purple-500 text-white',
    SSR: 'bg-yellow-400 text-red-600 border-red-500',
    UR: 'bg-black text-yellow-400 border-yellow-400',
  };

  return (
    <div className="section md:!col-span-4 bg-[#ff6b6b] flex flex-col lg:flex-row gap-8 items-stretch pt-20">
       <div className="flex-1 bg-white border-4 border-black rounded-3xl p-6 lg:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center text-center">
         <h2 className="font-impact text-5xl mb-2 text-black tracking-wider drop-shadow-sm">GACHA AMPAS</h2>
         <p className="font-mono text-xs opacity-80 mb-8 border-b-2 border-black pb-2 inline-block font-bold">Habiskan Coin-mu demi barang fiktif.</p>
         
         <div className="flex flex-col sm:flex-row gap-4 mb-10 w-full justify-center">
           <button 
             onClick={pull1} disabled={coins < 100 || isPulling}
             className={`w-full sm:w-[160px] py-4 rounded-2xl border-4 border-black font-impact text-xl transition-all ${coins >= 100 && !isPulling ? 'bg-yellow-400 hover:-translate-y-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer' : 'bg-gray-300 opacity-60 cursor-not-allowed'}`}
           >
             1 PULL<br/><span className="text-sm bg-black text-white px-2 py-1 rounded mt-1 inline-block">100 Coin</span>
           </button>
           <button 
             onClick={pull10} disabled={coins < 1000 || isPulling}
             className={`w-full sm:w-[160px] py-4 rounded-2xl border-4 border-black font-impact text-xl transition-all ${coins >= 1000 && !isPulling ? 'bg-pink-400 text-white hover:-translate-y-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer' : 'bg-gray-300 opacity-60 cursor-not-allowed'}`}
           >
             10 PULL<br/><span className="text-sm bg-black text-white px-2 py-1 rounded mt-1 inline-block">1000 Coin</span>
           </button>
         </div>

         <div className="w-full h-56 border-4 border-dashed border-black rounded-2xl flex items-center justify-center relative bg-gray-50 overflow-hidden">
           {isPulling && (
             <motion.div 
               animate={{ rotate: [0, 10, -10, 10, -10, 0], scale: [1, 1.2, 1] }} 
               transition={{ repeat: Infinity, duration: 0.5 }}
               className="text-7xl absolute z-10"
             >
               🔮
             </motion.div>
           )}
           {!isPulling && pulledItem && (
             <motion.div 
               initial={{ scale: 0, rotate: -180 }}
               animate={{ scale: 1, rotate: 0 }}
               transition={{ type: "spring", stiffness: 200, damping: 15 }}
               className={`absolute inset-4 rounded-xl border-4 border-black flex flex-col items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 ${rarityColors[pulledItem.rarity as keyof typeof rarityColors]}`}
             >
               <div className="text-6xl mb-2 drop-shadow-md">{pulledItem.emoji}</div>
               <div className="font-impact text-2xl tracking-wider text-center leading-tight whitespace-pre-line">{pulledItem.name}</div>
               <div className="absolute top-2 right-3 font-black text-2xl tracking-widest">{pulledItem.rarity}</div>
             </motion.div>
           )}
           {!isPulling && !pulledItem && <span className="font-mono text-xl opacity-30 font-bold uppercase tracking-widest">HASIL GACHA</span>}
         </div>
       </div>

       <div className="flex-1 bg-black border-4 border-black rounded-3xl p-6 text-white overflow-hidden flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] min-h-[400px]">
          <h3 className="font-impact text-3xl text-yellow-400 mb-4 flex flex-col sm:flex-row justify-between sm:items-end border-b-2 border-slate-800 pb-2 gap-2">
            INVENTORY <span className="text-sm font-mono text-gray-400 bg-gray-800 px-3 py-1 rounded-full w-fit">Total: {inventory.length} Item</span>
          </h3>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-3 min-h-[300px]">
            {inventory.length === 0 && <p className="text-center font-mono text-gray-500 mt-10">Kosong melompong, gacha dulu bos.</p>}
            {[...inventory].reverse().map((item, i) => (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                key={Date.now() + i} 
                className={`flex items-center gap-4 p-3 rounded-xl border-2 border-gray-700 bg-gray-900 ${item.rarity === 'UR' || item.rarity === 'SSR' ? 'border-yellow-400 shadow-[0_0_15px_rgba(255,214,0,0.6)] z-10 relative' : ''}`}
              >
                <div className={`w-14 h-14 rounded-lg flex flex-shrink-0 items-center justify-center text-3xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${rarityColors[item.rarity as keyof typeof rarityColors]}`}>
                  {item.emoji}
                </div>
                <div className="flex-1 min-w-0 pr-2">
                  <div className={`font-display font-bold leading-tight ${item.rarity === 'UR' ? 'text-yellow-400' : 'text-white'}`}>{item.name}</div>
                  <div className="font-mono text-[10px] text-gray-500 mt-1 uppercase">Diperoleh Baru Saja</div>
                </div>
                <div className={`font-impact text-xl px-2 rounded-sm border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] ${rarityColors[item.rarity as keyof typeof rarityColors]}`}>{item.rarity}</div>
              </motion.div>
            ))}
          </div>
       </div>
    </div>
  );
}

