import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Camera, Play, Pause, Gift, Target, ShieldAlert, Sparkles, MoveRight, HelpCircle, Store, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocalStorage } from './lib/useLocalStorage';
import bgMusic from './musik.mp3';

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
  { name: 'Struk Indomaret', rarity: 'N', emoji: '🧾', type: 'material', sellPrice: 2, desc: 'Bisa dijual murah' },
  { name: 'Batu Kali', rarity: 'N', emoji: '🪨', type: 'material', sellPrice: 5, desc: 'Keras. Gak ada gunanya.' },
  { name: 'Sendal Putus', rarity: 'N', emoji: '🩴', type: 'material', sellPrice: 10, desc: 'Bantalan kaki rongsok' },
  { name: 'Angin Lewat', rarity: 'N', emoji: '💨', type: 'buff', buffMultiplier: 1.5, buffDuration: 10, sellPrice: 5, desc: '+50% Coin (10 dtk)' },
  // R (30%)
  { name: 'Seblak Pedas', rarity: 'R', emoji: '🍜', type: 'buff', buffMultiplier: 2, buffDuration: 20, sellPrice: 50, desc: '2x Coin (20 dtk)' },
  { name: 'Voucher 10k', rarity: 'R', emoji: '📱', type: 'instant', amount: 1000, sellPrice: 50, desc: 'Langsung cair 1.000 Coin!' },
  { name: 'Kucing Oren', rarity: 'R', emoji: '🐈', type: 'material', sellPrice: 100, desc: 'Membawa hoki (katanya)' },
  // SR (15%)
  { name: 'Tiket VIP', rarity: 'SR', emoji: '🎬', type: 'instant', amount: 5000, sellPrice: 1000, desc: 'Langsung cair 5.000 Coin!' },
  { name: 'AirPods KW', rarity: 'SR', emoji: '🎧', type: 'buff', buffMultiplier: 5, buffDuration: 30, sellPrice: 500, desc: '5x Coin (30 dtk)' },
  { name: 'Pujian Tulus', rarity: 'SR', emoji: '🥺', type: 'buff', buffMultiplier: 10, buffDuration: 10, sellPrice: 2000, desc: '10x Coin (10 dtk)' },
  // SSR (4%)
  { name: 'Laptop Rata Kanan', rarity: 'SSR', emoji: '💻', type: 'buff', buffMultiplier: 20, buffDuration: 60, sellPrice: 10000, desc: '20x Coin (60 dtk)' },
  { name: 'Tiket ke Bali', rarity: 'SSR', emoji: '🏝️', type: 'instant', amount: 50000, sellPrice: 20000, desc: 'Langsung cair 50.000 Coin!' },
  // UR (1%)
  { name: 'Bebas Overthinking', rarity: 'UR', emoji: '🕊️', type: 'buff', buffMultiplier: 100, buffDuration: 60, sellPrice: 100000, desc: '100x COIN DERAS (60 dtk)!!!' },
  { name: 'Bebas Finansial', rarity: 'UR', emoji: '💎', type: 'instant', amount: 1000000, sellPrice: 500000, desc: 'JACKPOT! 1 JUTA COIN!' },
];

export default function App() {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Hoisted game states so progress doesn't lost on page change
  const [coins, setCoins] = useLocalStorage('arcade_coins', 0);
  const [inventory, setInventory] = useLocalStorage<any[]>('arcade_inventory', []);
  const [clickPower, setClickPower] = useLocalStorage('arcade_clickPower', 1);
  const [autoPower, setAutoPower] = useLocalStorage('arcade_autoPower', 0);
  const [upgrades, setUpgrades] = useLocalStorage<Upgrade[]>('arcade_upgrades', INITIAL_UPGRADES);
  
  // Advanced Economy states
  const [inflation, setInflation] = useLocalStorage('arcade_inflation', 1.0);
  const [franchises, setFranchises] = useLocalStorage<{id: string, typeId: string, name: string, emoji: string, revenue: number, lastMaintained: number, isBankrupt: boolean}[]>('arcade_franchises', []);
  const [bankBalance, setBankBalance] = useLocalStorage('arcade_bank', 0);
  const [portfolio, setPortfolio] = useLocalStorage('arcade_portfolio', {
    ANGN: { shares: 0, avgPrice: 0 },
    SBLK: { shares: 0, avgPrice: 0 },
    OVTK: { shares: 0, avgPrice: 0 },
  });
  
  // Buff state for used items
  const [activeBuff, setActiveBuff] = useLocalStorage<{type: string, multiplier: number, expiresAt: number} | null>('arcade_buff', null);

  // Global Game Loop
  useEffect(() => {
    let tickCount = 0;
    const timer = setInterval(() => {
      tickCount++;
      // 1. Calculate Idle Coins
      const assetPower = inventory.filter(i => i.type === 'asset').reduce((sum, item) => sum + (item.desc.includes('100k') ? 100000 : 0), 0);
      const totalAuto = autoPower + assetPower;
      
      let buffMult = 1;
      if (activeBuff && activeBuff.expiresAt > Date.now()) {
        buffMult = activeBuff.multiplier;
      }

      if (totalAuto > 0) {
        setCoins((c: number) => c + (totalAuto * buffMult));
      }
      
      // 2. Bank Interest (Every 30 ticks = 30 seconds)
      if (tickCount % 30 === 0) {
        setBankBalance((b: number) => {
          if (b > 0) return Math.floor(b * 1.05); // 5% interest
          return b;
        });
      }

      // 3. Auto Gacha 3000 (every 5 ticks)
      const autoGachas = inventory.filter(i => i.name === 'Auto Gacha 3000').length;
      if (autoGachas > 0) {
        // use a random trick: if Math.random() < 0.2 (approx 5 sec) per gacha
        for (let i = 0; i < autoGachas; i++) {
          if (Math.random() < 0.2) {
             const rand = Math.random();
             let rType = 'N';
             if (rand < 0.005) rType = 'UR';
             else if (rand < 0.03) rType = 'SSR';
             else if (rand < 0.15) rType = 'SR';
             else if (rand < 0.40) rType = 'R';
             
             const pool = GACHA_POOL.filter(p => p.rarity === rType);
             const item = pool[Math.floor(Math.random() * pool.length)];
             const itemWithId = { ...item, id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) };
             setInventory((inv: any[]) => [...inv, itemWithId]);
          }
        }
      }

      // 4. Franchise Revenue
      let franchiseRevenue = 0;
      let checkBankrupt = false;
      const now = Date.now();
      franchises.forEach((f: any) => {
        if (!f.isBankrupt) {
          if (now - f.lastMaintained > 60000) {
            checkBankrupt = true;
          } else {
            franchiseRevenue += f.revenue;
          }
        }
      });
      if (franchiseRevenue > 0) {
         setCoins((c: number) => c + franchiseRevenue);
      }
      if (checkBankrupt) {
         setFranchises((prev: any[]) => prev.map(f => {
             if (!f.isBankrupt && now - f.lastMaintained > 60000) {
                 return { ...f, isBankrupt: true };
             }
             return f;
         }));
      }
      
    }, 1000);
    return () => clearInterval(timer);
  }, [autoPower, inventory, activeBuff, setCoins, setInventory, franchises, setFranchises]);

  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  useEffect(() => {
    // Autoplay logic implemented below, cache cleared to fix fetch error
    const handleInteraction = () => {
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(e => console.log('Audio play failed:', e));
      }
    };
    
    // Attempt autoplay immediately
    if (audioRef.current) {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(e => {
          console.log('Autoplay blocked, waiting for interaction:', e);
          setIsPlaying(false);
        });
    }

    document.addEventListener('click', handleInteraction, { once: true });
    return () => document.removeEventListener('click', handleInteraction);
  }, []);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(() => console.log('Audio play failed'));
      }
    }
  };

  return (
    <div className="w-full min-h-screen app-wrapper relative pb-[100px]">
      <audio ref={audioRef} src={bgMusic} loop={true} autoPlay={true} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} />
      
      {/* Floating Mini Player */}
      <div className="floating-player">
        <button className={`music-btn ${isPlaying ? 'playing play-pop' : ''}`} onClick={toggleMusic} title="play / pause">
          <span>{isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-1"/>}</span>
        </button>
        <div className="music-info">
          <div className="music-title">Best Part</div>
          <div className="music-artist">Daniel Caesar ft. H.E.R.</div>
        </div>
      </div>

      {currentPage === 1 && <Page1 onNext={() => setCurrentPage(2)} />}
      {currentPage === 2 && <Page2 onNext={() => setCurrentPage(3)} onBack={() => setCurrentPage(1)} />}
      {currentPage === 3 && (
        <Page3 
          onBack={() => setCurrentPage(2)} 
          coins={coins} setCoins={setCoins}
          inventory={inventory} setInventory={setInventory}
          clickPower={clickPower} setClickPower={setClickPower}
          autoPower={autoPower} setAutoPower={setAutoPower}
          upgrades={upgrades} setUpgrades={setUpgrades}
          activeBuff={activeBuff} setActiveBuff={setActiveBuff}
          bankBalance={bankBalance} setBankBalance={setBankBalance}
          portfolio={portfolio} setPortfolio={setPortfolio}
          inflation={inflation} setInflation={setInflation}
          franchises={franchises} setFranchises={setFranchises}
        />
      )}
    </div>
  );
}

/* ═══════════════════ PAGE 1 ═══════════════════ */
function Page1({ onNext }: { onNext: () => void }) {
  return (
    <div className="page-transition">
      <section className="hero md:col-span-12 lg:col-span-7 lg:row-span-2 min-h-[50vh]">
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

      <section className="section bg-white text-black md:col-span-12 lg:col-span-5 h-full">
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

      <section className="section bg-[#ffe227] md:col-span-6 lg:col-span-12 h-full">
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

      <section className="section bg-[#ff6b6b] text-white md:col-span-6 lg:col-span-12">
        <p className="section-num text-white border-white">03 — notes</p>
        <div className="notes-grid">
          <div className="note-card yellow-card">umur nambah, encok juga nambah <span className="card-star">★</span></div>
          <div className="note-card red-card">take it easy. fr. <span className="card-star">✦</span></div>
          <div className="note-card">enjoy your day <span className="card-star">✶</span></div>
          <div className="note-card blue-card">you deserve good things <span className="card-star">★</span></div>
        </div>
      </section>

      <div className="nav-section md:col-span-12">
        <p className="nav-label">photos await →</p>
        <button className="btn-main" onClick={onNext}><span>see your photos ↗</span></button>
      </div>
    </div>
  );
}

/* ═══════════════════ PAGE 2 ═══════════════════ */
function Page2({ onNext, onBack }: { onNext: () => void, onBack: () => void }) {
  return (
    <div className="page-transition">
      <div className="gallery-hero md:col-span-12 lg:col-span-12">
        <div className="gallery-hero-bg"></div>
        <div className="gallery-title">
          <span className="line-red">YOUR</span><br/>
          PHOTOS.
        </div>
      </div>

      <div className="gallery-section md:col-span-12">
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

      <div className="nav-section md:col-span-12">
        <p className="nav-label">bosen? main game yok →</p>
        <button className="btn-main" onClick={onNext}><span>Play Mini Games 🎮</span></button>
      </div>

      <div className="back-nav md:col-span-12">
        <div className="back-note">still <span>you</span>. always. ✦</div>
        <button className="btn-back" onClick={onBack}>← back</button>
      </div>
    </div>
  );
}

/* ═══════════════════ PAGE 3 (GAMES) ═══════════════════ */

function Page3({ onBack, coins, setCoins, inventory, setInventory, clickPower, setClickPower, autoPower, setAutoPower, upgrades, setUpgrades, activeBuff, setActiveBuff, bankBalance, setBankBalance, portfolio, setPortfolio, inflation, setInflation, franchises, setFranchises }: any) {
  return (
    <div className="page-transition">
      <div className="fixed top-4 right-4 bg-black border-4 border-yellow-400 text-yellow-400 px-4 py-2 md:px-6 md:py-3 rounded-full font-impact text-xl md:text-3xl shadow-[4px_4px_0px_0px_rgba(255,214,0,1)] z-[100] animate-bounce whitespace-nowrap">
        💰 {Math.floor(coins).toLocaleString()} COIN
      </div>

      <div className="gallery-hero md:col-span-12 bg-black text-white !pb-12 relative overflow-hidden">
        <div className="gallery-title z-10 relative drop-shadow-[4px_4px_0px_rgba(232,0,29,1)]">
          <span className="line-red text-yellow-400 drop-shadow-none">ARCADE</span><br />
          <span className="text-white font-impact tracking-wider">EDITION.</span>
        </div>
        <p className="font-mono text-xs opacity-80 mt-6 tracking-widest uppercase z-10 relative">
          Kumpulkan COIN dari mini-game dan gacha sampai lemes!
        </p>
      </div>

      <Game3_Clicker coins={coins} setCoins={setCoins} clickPower={clickPower} setClickPower={setClickPower} autoPower={autoPower} setAutoPower={setAutoPower} upgrades={upgrades} setUpgrades={setUpgrades} activeBuff={activeBuff} inventory={inventory} inflation={inflation} setInflation={setInflation} />
      <Game7_Franchise coins={coins} setCoins={setCoins} franchises={franchises} setFranchises={setFranchises} inflation={inflation} setInflation={setInflation} />
      <Game6_Bank coins={coins} setCoins={setCoins} bankBalance={bankBalance} setBankBalance={setBankBalance} />
      <Game5_Market coins={coins} setCoins={setCoins} portfolio={portfolio} setPortfolio={setPortfolio} inflation={inflation} setInflation={setInflation} />
      <Game1_Overthinking coins={coins} setCoins={setCoins} activeBuff={activeBuff} />
      <Game2_Gacha coins={coins} setCoins={setCoins} inventory={inventory} setInventory={setInventory} inflation={inflation} setInflation={setInflation} />
      <Game4_InventoryShop coins={coins} setCoins={setCoins} inventory={inventory} setInventory={setInventory} activeBuff={activeBuff} setActiveBuff={setActiveBuff} clickPower={clickPower} setClickPower={setClickPower} autoPower={autoPower} setAutoPower={setAutoPower} inflation={inflation} setInflation={setInflation} />

      <div className="back-nav bg-[#f2f2f2] md:col-span-12">
        <div className="back-note text-black">udah capek mainnya? <span>haha</span>.</div>
        <button className="btn-back" onClick={onBack}>← Back to Photos</button>
      </div>
    </div>
  );
}

// -- GAME 3: IDLE CLICKER --
function Game3_Clicker({ coins, setCoins, clickPower, setClickPower, autoPower, setAutoPower, upgrades, setUpgrades, activeBuff, inventory, inflation, setInflation }: any) {
  const [clicks, setClicks] = useState<{id: number, x: number, y: number, text: string}[]>([]);
  const [currentBuff, setCurrentBuff] = useState(1);

  const assetPower = inventory ? inventory.filter((i: any) => i.type === 'asset').reduce((sum: number, item: any) => sum + (item.desc.includes('100k') ? 100000 : 0), 0) : 0;
  const displayAutoPower = autoPower + assetPower;

  // Check buff expiration
  useEffect(() => {
    const timer = setInterval(() => {
      if (activeBuff && activeBuff.expiresAt > Date.now()) {
        setCurrentBuff(activeBuff.multiplier);
      } else {
        setCurrentBuff(1);
      }
    }, 100);
    return () => clearInterval(timer);
  }, [activeBuff]);

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
    
    const power = clickPower * currentBuff;
    setCoins((c: number) => c + power);
    const id = Date.now();
    setClicks((prev: any) => [...prev, { id, x, y, text: `+${power}` }]);
    setTimeout(() => {
      setClicks((prev: any) => prev.filter((c: any) => c.id !== id));
    }, 1000);
    
    const btn = document.getElementById('flame-btn');
    if (btn) {
      btn.style.transform = 'scale(0.9)';
      setTimeout(() => btn.style.transform = 'scale(1)', 100);
    }
  };

  const buyUpgrade = (id: number) => {
    const upg = upgrades.find((u: any) => u.id === id);
    const actualCost = Math.floor(upg.cost * inflation);
    if (!upg || coins < actualCost) return;
    
    setCoins((c: number) => c - actualCost);
    setInflation((i: number) => i + 0.05); // +5% inflation!
    
    if (upg.effect === 'auto') {
      setAutoPower((a: number) => a + upg.value);
    } else {
      setClickPower((c: number) => c + upg.value);
    }
    
    setUpgrades((prev: any) => prev.map((u: any) => {
      if (u.id === id) {
        return { ...u, count: u.count + 1, cost: Math.floor(u.cost * 1.5) };
      }
      return u;
    }));
  };

  return (
    <div className="section md:col-span-12 bg-[#74b9ff] flex flex-col md:flex-row gap-8 items-stretch pt-20">
      <div className="flex-1 flex flex-col items-center border-4 border-black bg-white rounded-3xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
        <h2 className="font-impact text-4xl mb-2 text-center text-blue-600 tracking-wider">PABRIK COIN LILIN</h2>
        <p className="font-mono text-xs opacity-60 mb-6 text-center text-black font-bold uppercase border-b-2 border-black pb-1">Klik secepat mungkin! Upgrade usahamu.</p>
        
        {currentBuff > 1 && (
          <div className="bg-red-500 text-white font-impact border-4 border-black rounded-lg px-4 py-2 mb-4 animate-pulse shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-center">
            🔥 BUFF AKTIF: {activeBuff?.type}<br/>({currentBuff}x Coin & Score Overthinking!) 🔥
          </div>
        )}

        <div className="text-3xl font-impact bg-yellow-400 px-6 py-2 border-4 border-black rounded-full mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2">
          +{(displayAutoPower * currentBuff).toLocaleString()} COIN/dtk
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
        {upgrades.map((u: any) => {
          const actualCost = Math.floor(u.cost * inflation);
          return (
            <button 
              key={u.id}
              onClick={() => buyUpgrade(u.id)}
              disabled={coins < actualCost}
              className={`flex items-center gap-4 p-4 border-4 border-black rounded-2xl text-left transition-all ${coins >= actualCost ? 'bg-white hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer' : 'bg-gray-300 opacity-60 cursor-not-allowed'}`}
            >
              <div className="text-4xl bg-gray-100 w-16 h-16 rounded-xl border-2 border-black flex items-center justify-center flex-shrink-0 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                {u.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-impact text-xl tracking-wide">{u.name} <span className="text-sm bg-black text-white px-2 py-0.5 rounded ml-2 font-mono">Lv.{u.count}</span></h3>
                <p className="font-mono text-xs opacity-70 mt-1 uppercase font-bold text-blue-600">{u.desc}</p>
              </div>
              <div className="font-impact text-xl text-yellow-500 bg-black px-3 py-1 rounded-full border-2 border-yellow-400 shadow-[2px_2px_0px_rgba(255,214,0,1)]">
                💰 {actualCost.toLocaleString()}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// -- GAME 1: SURVIVAL OVERTHINKING --
function Game1_Overthinking({ coins, setCoins, activeBuff }: any) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [coinsGained, setCoinsGained] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [targets, setTargets] = useState<{ id: number, type: 'bad' | 'good', x: number, y: number }[]>([]);
  
  const currentBuff = (activeBuff && activeBuff.expiresAt > Date.now()) ? activeBuff.multiplier : 1;
  
  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setCoinsGained(0);
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
      const added = 5 * currentBuff;
      setScore(s => s + 1);
      setCoinsGained(cg => cg + added);
      setCoins((c: number) => c + added);
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
      setCoinsGained(cg => Math.max(0, cg - 10));
      setCoins((c: number) => Math.max(0, c - 10)); // penalty
      const container = document.getElementById('whack-container');
      if (container) {
        container.classList.add('animate-shake');
        setTimeout(() => container.classList.remove('animate-shake'), 400);
      }
    }
  };

  return (
    <div className="section md:col-span-12 bg-[#ffeea8] flex flex-col items-center">
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
            <p className="font-mono text-xl mb-8 uppercase text-gray-300 font-bold border-b-2 border-white pb-2 inline-block">Score Akhir: {score} | Cuan: {coinsGained} Coin</p>
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
function Game2_Gacha({ coins, setCoins, inventory, setInventory, inflation, setInflation }: any) {
  const [isPulling, setIsPulling] = useState(false);
  const [pulledItem, setPulledItem] = useState<{name: string, rarity: string, emoji: string} | null>(null);

  const pull1 = () => doPull(1);
  const pull10 = () => doPull(10);

  const doPull = (times: number) => {
    const cost = Math.floor(times * 100 * inflation);
    if (coins < cost || isPulling) return;
    setCoins((c: number) => c - cost);
    setInflation((i: number) => i + (0.01 * times)); // +1% inflation per pull
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
      const itemsWithId = pullResults.map(item => ({ ...item, id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) }));
      setInventory((prev: any) => [...prev, ...itemsWithId]);
      
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
    <div className="section md:col-span-12 bg-[#ff6b6b] flex flex-col lg:flex-row gap-8 items-stretch pt-20">
       <div className="flex-1 bg-white border-4 border-black rounded-3xl p-6 lg:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center text-center">
         <h2 className="font-impact text-5xl mb-2 text-black tracking-wider drop-shadow-sm">GACHA AMPAS</h2>
         <p className="font-mono text-xs opacity-80 mb-8 border-b-2 border-black pb-2 inline-block font-bold">Habiskan Coin-mu demi barang fiktif.</p>
         
         <div className="flex flex-col sm:flex-row gap-4 mb-10 w-full justify-center">
           <button 
             onClick={pull1} disabled={coins < Math.floor(100 * inflation) || isPulling}
             className={`w-full sm:w-[160px] py-4 rounded-2xl border-4 border-black font-impact text-xl transition-all ${coins >= Math.floor(100 * inflation) && !isPulling ? 'bg-yellow-400 hover:-translate-y-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer' : 'bg-gray-300 opacity-60 cursor-not-allowed'}`}
           >
             1 PULL<br/><span className="text-sm bg-black text-white px-2 py-1 rounded mt-1 inline-block">{(Math.floor(100 * inflation)).toLocaleString()} Coin</span>
           </button>
           <button 
             onClick={pull10} disabled={coins < Math.floor(1000 * inflation) || isPulling}
             className={`w-full sm:w-[160px] py-4 rounded-2xl border-4 border-black font-impact text-xl transition-all ${coins >= Math.floor(1000 * inflation) && !isPulling ? 'bg-pink-400 text-white hover:-translate-y-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer' : 'bg-gray-300 opacity-60 cursor-not-allowed'}`}
           >
             10 PULL<br/><span className="text-sm bg-black text-white px-2 py-1 rounded mt-1 inline-block">{(Math.floor(1000 * inflation)).toLocaleString()} Coin</span>
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
    </div>
  );
}

// -- GAME 4: INVENTORY & SHOP --
function Game4_InventoryShop({ coins, setCoins, inventory, setInventory, activeBuff, setActiveBuff }: any) {
  const [tab, setTab] = useState<'inventory' | 'shop'>('inventory');
  
  const useItem = (item: any) => {
    if (item.type === 'instant') {
      setCoins((c: number) => c + item.amount);
    } else if (item.type === 'buff') {
      setActiveBuff({ type: item.name, multiplier: item.buffMultiplier, expiresAt: Date.now() + item.buffDuration * 1000 });
    }
    setInventory((prev: any[]) => prev.filter(i => i.id !== item.id));
  };

  const sellItem = (item: any) => {
    setCoins((c: number) => c + (item.sellPrice || 0));
    setInventory((prev: any[]) => prev.filter(i => i.id !== item.id));
  };
  
  const rarityColors = {
    N: 'bg-gray-300 text-gray-800',
    R: 'bg-[#74b9ff] text-white',
    SR: 'bg-purple-500 text-white',
    SSR: 'bg-yellow-400 text-red-600 border-red-500',
    UR: 'bg-black text-yellow-400 border-yellow-400',
  };

  return (
    <div className="section md:col-span-12 bg-[#b8e994] pt-12 items-center flex flex-col gap-6">
      <div className="w-full max-w-4xl flex items-center justify-center gap-4 sm:gap-12 mb-4 border-b-4 border-black pb-4">
        <button onClick={() => setTab('inventory')} className={`font-impact tracking-wider text-3xl sm:text-5xl transition-all ${tab === 'inventory' ? 'text-black drop-shadow-[2px_2px_0px_rgba(255,255,255,1)]' : 'text-black/30 hover:text-black/50'}`}>INVENTORY</button>
        <button onClick={() => setTab('shop')} className={`font-impact tracking-wider text-3xl sm:text-5xl transition-all ${tab === 'shop' ? 'text-black drop-shadow-[2px_2px_0px_rgba(255,255,255,1)]' : 'text-black/30 hover:text-black/50'}`}>PASAR GELAP</button>
      </div>
      
      {tab === 'inventory' && (
        <div className="bg-black border-4 w-full border-black rounded-3xl p-4 sm:p-8 text-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
           <h3 className="font-impact text-2xl sm:text-3xl text-yellow-400 mb-6 flex flex-col sm:flex-row justify-between sm:items-end border-b-2 border-slate-800 pb-2 gap-2">
             YOUR ITEMS <span className="text-sm font-mono text-gray-400 bg-gray-800 px-3 py-1 rounded-full w-fit">Total: {inventory.length} Item</span>
           </h3>
           <div className="overflow-y-auto max-h-[500px] pr-2 custom-scrollbar grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {inventory.length === 0 && <p className="col-span-full text-center font-mono text-gray-500 mt-10">Kosong melompong, gacha dulu bos.</p>}
             {[...inventory].reverse().map((item, i) => (
               <div key={item.id} className={`flex flex-col gap-3 p-4 rounded-xl border-2 border-gray-700 bg-gray-900 ${item.rarity === 'UR' || item.rarity === 'SSR' ? 'border-yellow-400 shadow-[0_0_15px_rgba(255,214,0,0.6)] relative z-10' : ''}`}>
                 <div className="flex items-start justify-between">
                   <div className={`w-14 h-14 rounded-lg flex flex-shrink-0 items-center justify-center text-3xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${rarityColors[item.rarity as keyof typeof rarityColors]}`}>
                     {item.emoji}
                   </div>
                   <div className={`font-impact text-sm px-2 rounded-sm border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] ${rarityColors[item.rarity as keyof typeof rarityColors]}`}>{item.rarity}</div>
                 </div>
                 <div className="flex-1 mt-2">
                   <div className={`font-display font-bold leading-tight line-clamp-1 ${item.rarity === 'UR' ? 'text-yellow-400' : 'text-white'}`}>{item.name}</div>
                   <div className="font-mono text-xs text-green-400 mt-1 whitespace-pre-wrap">{item.desc || 'No effect'}</div>
                 </div>
                 <div className="flex gap-2 w-full mt-2 border-t py-2 border-gray-800">
                   {(item.type === 'instant' || item.type === 'buff') && (
                     <button onClick={() => useItem(item)} className="flex-1 bg-green-500 text-white font-impact px-2 py-2 border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform hover:translate-y-px active:translate-y-1 text-sm uppercase">USE</button>
                   )}
                   <button onClick={() => sellItem(item)} className="flex-1 bg-red-500 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-white font-impact px-2 py-2 rounded transition-transform hover:translate-y-px active:translate-y-1 text-sm uppercase">SELL ({item.sellPrice ? item.sellPrice.toLocaleString() : 0})</button>
                 </div>
               </div>
             ))}
           </div>
        </div>
      )}
      {tab === 'shop' && (
        <div className="bg-white border-4 border-black w-full rounded-3xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center min-h-[400px] flex flex-col items-center justify-center">
          <Store className="w-24 h-24 text-black mb-4 opacity-20" />
          <h3 className="font-impact text-3xl sm:text-5xl mb-2 text-black text-center break-words uppercase">PASAR GELAP</h3>
          <p className="font-mono font-bold opacity-60">Barang langka buat crazy rich doang.</p>
          <div className="w-full max-w-2xl mt-8 grid gap-4 text-left">
             <div className="p-4 border-4 border-black rounded-xl bg-purple-100 flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4">
               <div>
                  <h4 className="font-impact text-2xl tracking-wide uppercase text-purple-600">Sertifikat Tanah PIK</h4>
                  <p className="font-mono text-sm opacity-80 uppercase font-bold">+100,000 Coin / detik SELAMANYA</p>
               </div>
               <button onClick={() => { if(coins >= Math.floor(500000 * inflation)) { setCoins((c:number) => c - Math.floor(500000 * inflation)); setInflation((i: number) => i + 0.1); setInventory((inv: any) => [...inv, {id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2), name: 'Tanah PIK', type: 'asset', rarity: 'UR', emoji: '🏙️', desc: 'Pasif 100k coin/dtk'}]) } }} disabled={coins < Math.floor(500000 * inflation)} className={`whitespace-nowrap px-6 py-3 border-4 border-black font-impact text-xl transition-transform ${coins>=Math.floor(500000 * inflation) ? 'bg-yellow-400 hover:-translate-y-1 cursor-pointer' : 'bg-gray-300 opacity-60 cursor-not-allowed'}`}>{(Math.floor(500000 * inflation)).toLocaleString()} Coin</button>
             </div>
             
             <div className="p-4 border-4 border-black rounded-xl bg-blue-100 flex flex-col sm:flex-row justify-between items-center gap-4">
               <div>
                  <h4 className="font-impact text-2xl tracking-wide uppercase text-blue-600">Auto Gacha 3000</h4>
                  <p className="font-mono text-sm opacity-80 uppercase font-bold">Nge-gacha ampas otomatis</p>
               </div>
               <button onClick={() => { if(coins >= Math.floor(1000000 * inflation)) { setCoins((c:number) => c - Math.floor(1000000 * inflation)); setInflation((i: number) => i + 0.2); setInventory((inv: any) => [...inv, {id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2), name: 'Auto Gacha 3000', type: 'asset', rarity: 'SSR', emoji: '🤖', desc: 'Auto Tarik Gacha'}]) } }} disabled={coins < Math.floor(1000000 * inflation)} className={`whitespace-nowrap px-6 py-3 border-4 border-black font-impact text-xl transition-transform ${coins>=Math.floor(1000000 * inflation) ? 'bg-yellow-400 hover:-translate-y-1 cursor-pointer' : 'bg-gray-300 opacity-60 cursor-not-allowed'}`}>{(Math.floor(1000000 * inflation)).toLocaleString()} Coin</button>
             </div>
             
             <div className="p-4 border-4 border-black rounded-xl bg-red-100 flex flex-col sm:flex-row justify-between items-center gap-4">
               <div>
                  <h4 className="font-impact text-2xl tracking-wide uppercase text-red-600">REINKARNASI (HOLY TOKEN)</h4>
                  <p className="font-mono text-sm opacity-80 uppercase font-bold">Membeli item x10 COIN MULTIPLIER SELAMANYA</p>
               </div>
               <button onClick={() => { if(coins >= Math.floor(10000000 * inflation)) { 
                 setCoins((c: number) => c - Math.floor(10000000 * inflation));
                 setInflation((i: number) => i + 1.0);
                 setInventory((inv: any) => [...inv, {id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2), name: 'Holy Token', type: 'buff', rarity: 'UR', emoji: '🌟', buffDuration: 999999999, buffMultiplier: 10, desc: 'PERMANENT 10x COIN MULTIPLIER! (Equip on Use)'}]);
               }}} disabled={coins < Math.floor(10000000 * inflation)} className={`whitespace-nowrap px-6 py-3 border-4 border-black font-impact text-xl transition-transform ${coins>=Math.floor(10000000 * inflation) ? 'bg-red-500 text-white hover:-translate-y-1 cursor-pointer' : 'bg-gray-300 opacity-60 cursor-not-allowed'}`}>{(Math.floor(10000000 * inflation)).toLocaleString()} Coin</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

// -- GAME 5: MARKET (SAHAM AMPAS) --
function Game5_Market({ coins, setCoins, portfolio, setPortfolio }: any) {
  const [prices, setPrices] = useState({ ANGN: 10, SBLK: 50, OVTK: 200 });
  const [trends, setTrends] = useState({ ANGN: 0, SBLK: 0, OVTK: 0 }); // -1 down, 1 up

  useEffect(() => {
    const timer = setInterval(() => {
      setPrices(prev => {
        const next = { ...prev };
        const newTrends = { ANGN: 0, SBLK: 0, OVTK: 0 };
        
        ['ANGN', 'SBLK', 'OVTK'].forEach((ticker) => {
          const t = ticker as 'ANGN' | 'SBLK' | 'OVTK';
          const maxVol = { ANGN: 5, SBLK: 20, OVTK: 100 }[t];
          const change = Math.floor((Math.random() - 0.5) * maxVol);
          newTrends[t] = change >= 0 ? 1 : -1;
          next[t] = Math.max(1, prev[t] + change);
        });
        
        setTrends(newTrends);
        return next;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const buyStock = (ticker: 'ANGN' | 'SBLK' | 'OVTK', amount: number) => {
    const cost = prices[ticker] * amount;
    if (coins >= cost) {
      setCoins((c: number) => c - cost);
      setPortfolio((p: any) => ({
        ...p,
        [ticker]: {
          shares: p[ticker].shares + amount,
          // Simplified avg price
          avgPrice: ((p[ticker].shares * p[ticker].avgPrice) + cost) / (p[ticker].shares + amount)
        }
      }));
    }
  };

  const sellStock = (ticker: 'ANGN' | 'SBLK' | 'OVTK', amount: number) => {
    if (portfolio[ticker].shares >= amount) {
      const revenue = prices[ticker] * amount;
      setCoins((c: number) => c + revenue);
      setPortfolio((p: any) => ({
        ...p,
        [ticker]: {
          ...p[ticker],
          shares: p[ticker].shares - amount
        }
      }));
    }
  };

  const stocks = [
    { id: 'ANGN', name: 'PT Angin Lewat', desc: 'Sangat volatil', emoji: '💨' },
    { id: 'SBLK', name: 'PT Seblak Mercon', desc: 'Pedas menggiurkan', emoji: '🍜' },
    { id: 'OVTK', name: 'PT Pikiran Kusut', desc: 'Bluechip overthinking', emoji: '🧠' },
  ] as const;

  return (
    <div className="section md:col-span-12 bg-[#2c2c54] text-white flex flex-col items-center">
      <h2 className="font-impact text-4xl sm:text-6xl text-yellow-400 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] uppercase text-center mb-4">BURSA SAHAM AMPAS</h2>
      <p className="font-mono text-sm opacity-80 mb-8 tracking-widest text-center max-w-2xl bg-black/30 p-4 rounded-xl border-2 border-black">Beli saat merah, jual saat hijau. Update secara gaib tiap 5 detik. Ati-ati nyangkut bos.</p>
      
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stocks.map(s => {
          const t = s.id;
          const currentPrice = prices[t];
          const shares = portfolio[t].shares;
          const trend = trends[t];
          
          return (
            <div key={t} className="bg-white text-black border-4 border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col transition-transform hover:-translate-y-1">
              <div className="flex justify-between items-start border-b-4 border-gray-200 pb-4 mb-4">
                <div>
                  <h3 className="font-impact text-3xl">{s.emoji} {s.id}</h3>
                  <p className="font-mono text-xs opacity-60 font-bold uppercase">{s.name}</p>
                </div>
                <div className={`font-impact text-3xl px-4 py-2 rounded-xl border-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] ${trend >= 0 ? 'bg-green-400 border-black' : 'bg-red-400 text-white border-black'}`}>
                  {trend >= 0 ? '▲' : '▼'} {currentPrice.toLocaleString()}
                </div>
              </div>
              
              <div className="bg-gray-100 p-4 rounded-xl border-4 border-black mb-6 font-mono space-y-2 mt-auto">
                <div className="flex justify-between text-sm"><span>Lots Owned:</span> <span className="font-bold text-lg">{shares.toLocaleString()}</span></div>
                <div className="flex justify-between text-sm"><span>Avg Price:</span> <span className="font-bold opacity-70">{Math.floor(portfolio[t].avgPrice).toLocaleString()}</span></div>
                <div className="h-0.5 bg-gray-300 w-full my-2"></div>
                <div className="flex justify-between text-sm items-center"><span>Est. Value:</span> <span className="font-bold text-blue-600 text-xl tracking-tight">{(shares * currentPrice).toLocaleString()}</span></div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-auto">
                <button disabled={coins < currentPrice} onClick={() => buyStock(t, 1)} className="bg-green-400 border-4 border-black font-impact py-3 rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 active:translate-y-0 disabled:opacity-40 disabled:hover:translate-y-0 disabled:shadow-none transition-all text-black hover:bg-green-300 text-xl">BUY 1</button>
                <button disabled={shares < 1} onClick={() => sellStock(t, 1)} className="bg-red-500 text-white border-4 border-black font-impact py-3 rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 active:translate-y-0 disabled:opacity-40 disabled:hover:translate-y-0 disabled:shadow-none transition-all hover:bg-red-400 text-xl">SELL 1</button>
                <button disabled={coins < currentPrice * 10} onClick={() => buyStock(t, 10)} className="bg-green-400 border-4 border-black font-impact py-3 rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 active:translate-y-0 disabled:opacity-40 disabled:hover:translate-y-0 disabled:shadow-none transition-all text-black hover:bg-green-300 text-xl">BUY 10</button>
                <button disabled={shares < 10} onClick={() => sellStock(t, 10)} className="bg-red-500 text-white border-4 border-black font-impact py-3 rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 active:translate-y-0 disabled:opacity-40 disabled:hover:translate-y-0 disabled:shadow-none transition-all hover:bg-red-400 text-xl">SELL 10</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// -- GAME 6: BANK (DEPOSITO) --
function Game6_Bank({ coins, setCoins, bankBalance, setBankBalance }: any) {
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const handleDeposit = () => {
    const amt = parseInt(depositAmount);
    if (!isNaN(amt) && amt > 0 && amt <= coins) {
      setCoins((c: number) => c - amt);
      setBankBalance((b: number) => b + amt);
      setDepositAmount('');
    }
  };

  const handleWithdraw = () => {
    const amt = parseInt(withdrawAmount);
    if (!isNaN(amt) && amt > 0 && amt <= bankBalance) {
      setBankBalance((b: number) => b - amt);
      setCoins((c: number) => c + amt);
      setWithdrawAmount('');
    }
  };

  return (
    <div className="section md:col-span-12 bg-[#fab1a0] items-center flex flex-col gap-6">
      <h2 className="font-impact text-4xl sm:text-6xl text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] uppercase tracking-wider text-center">BANK CENTRAL COIN</h2>
      <p className="font-mono font-bold opacity-80 mb-4 bg-white px-4 py-2 rounded-xl border-4 border-black text-center max-w-2xl text-black shadow-[4px_4px_0px_rgba(0,0,0,1)]">
        Simpan coin di sini. Dapat bunga 5% setiap 30 detik secara otomatis.
      </p>

      <div className="w-full max-w-2xl bg-white border-4 border-black rounded-3xl p-6 sm:p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] mb-8">
        <div className="text-center mb-10 border-b-4 border-dashed border-gray-300 pb-8 text-black">
          <p className="font-mono opacity-60 uppercase font-bold mb-2 tracking-widest">Saldo Deposito</p>
          <div className="bg-gray-100 border-4 border-black rounded-2xl py-6 px-4 shadow-[inset_4px_4px_0px_rgba(0,0,0,0.05)]">
            <p className="font-impact text-5xl sm:text-7xl text-blue-600 break-words drop-shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">💰 {bankBalance.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-green-50 border-4 border-black p-5 rounded-2xl text-black shadow-[4px_4px_0px_rgba(0,0,0,1)] flex flex-col">
            <h4 className="font-impact text-2xl text-green-600 mb-4 border-b-2 border-green-200 pb-2">DEPOSIT IN</h4>
            <div className="flex flex-col gap-3 flex-1">
              <input type="number" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} placeholder="0" className="w-full border-4 border-black rounded-xl p-3 font-mono text-xl text-center shadow-[inset_2px_2px_0px_rgba(0,0,0,0.1)] focus:outline-none focus:border-green-500" />
              <button onClick={handleDeposit} className="w-full bg-green-400 border-4 border-black font-impact py-4 text-2xl rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform whitespace-nowrap active:translate-y-0 hover:bg-green-300">MODALIN</button>
            </div>
            <div className="mt-4 text-sm font-mono opacity-60 bg-white border-2 border-black rounded-lg p-2 text-center">Di Dompet: {Math.floor(coins).toLocaleString()}</div>
            <div className="flex gap-2 mt-2">
               <button onClick={() => setDepositAmount(Math.floor(coins * 0.5).toString())} className="flex-1 text-sm font-bold bg-white border-2 border-black py-2 rounded-lg hover:bg-gray-100 transition-colors shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none">50%</button>
               <button onClick={() => setDepositAmount(Math.floor(coins).toString())} className="flex-1 text-sm font-bold bg-white border-2 border-black py-2 rounded-lg hover:bg-gray-100 transition-colors shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none">MAX</button>
            </div>
          </div>

          <div className="bg-red-50 border-4 border-black p-5 rounded-2xl text-black shadow-[4px_4px_0px_rgba(0,0,0,1)] flex flex-col">
            <h4 className="font-impact text-2xl text-red-600 mb-4 border-b-2 border-red-200 pb-2">WITHDRAW OUT</h4>
            <div className="flex flex-col gap-3 flex-1">
              <input type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} placeholder="0" className="w-full border-4 border-black rounded-xl p-3 font-mono text-xl text-center shadow-[inset_2px_2px_0px_rgba(0,0,0,0.1)] focus:outline-none focus:border-red-500" />
              <button onClick={handleWithdraw} className="w-full bg-red-500 text-white border-4 border-black font-impact py-4 text-2xl rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform whitespace-nowrap active:translate-y-0 hover:bg-red-400">TARIK</button>
            </div>
            <div className="mt-4 text-sm font-mono opacity-60 bg-white border-2 border-black rounded-lg p-2 text-center flex gap-2 invisible h-9"></div>
            <div className="flex gap-2 mt-2">
               <button onClick={() => setWithdrawAmount(Math.floor(bankBalance * 0.5).toString())} className="flex-1 text-sm font-bold bg-white border-2 border-black py-2 rounded-lg hover:bg-gray-100 transition-colors shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none">50%</button>
               <button onClick={() => setWithdrawAmount(Math.floor(bankBalance).toString())} className="flex-1 text-sm font-bold bg-white border-2 border-black py-2 rounded-lg hover:bg-gray-100 transition-colors shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none">MAX</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// -- GAME 7: FRANCHISE --
function Game7_Franchise({ coins, setCoins, franchises, setFranchises, inflation, setInflation }: any) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const franchiseTypes = [
    { typeId: 'seblak', name: 'Franchise Seblak', emoji: '🍜', buyPrice: 50000, revenue: 500, maintCost: 10000 },
    { typeId: 'warkop', name: 'Warkop Estetik', emoji: '☕', buyPrice: 200000, revenue: 2500, maintCost: 50000 },
    { typeId: 'laundry', name: 'Laundry Kiloan', emoji: '🧺', buyPrice: 1000000, revenue: 15000, maintCost: 250000 },
  ];

  const buyFranchise = (type: any) => {
    const actualCost = Math.floor(type.buyPrice * inflation);
    if (coins >= actualCost) {
      setCoins((c: number) => c - actualCost);
      setInflation((i: number) => i + 0.1); // +10% inflation!
      setFranchises((prev: any[]) => [...prev, {
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
        typeId: type.typeId,
        name: type.name,
        emoji: type.emoji,
        revenue: type.revenue,
        maintCost: type.maintCost,
        lastMaintained: Date.now(),
        isBankrupt: false
      }]);
    }
  };

  const maintainFranchise = (f: any) => {
    if (f.isBankrupt) return;
    const actualCost = Math.floor(f.maintCost * inflation);
    if (coins >= actualCost) {
      setCoins((c: number) => c - actualCost);
      setInflation((i: number) => i + 0.01); // +1% inflation
      setFranchises((prev: any[]) => prev.map(item => {
        if (item.id === f.id) {
          return { ...item, lastMaintained: Date.now() };
        }
        return item;
      }));
    }
  };

  return (
    <div className="section md:col-span-12 bg-[#fdcb6e] items-center flex flex-col gap-6">
      <h2 className="font-impact text-4xl sm:text-6xl text-red-600 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] uppercase tracking-wider text-center">JURAGAN FRANCHISE</h2>
      <div className="bg-white border-4 border-black p-4 rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,1)] max-w-2xl text-center font-mono">
        <p className="font-bold opacity-80 mb-2">Beli franchise, dapat pasif income, TAPI AWAS BANGKRUT!</p>
        <p className="opacity-60 text-sm">Kamu harus bayar biaya maintenance sebelum 60 detik. Kalau nggak, usahamu <b>TUTUP SELAMANYA</b>.</p>
        <p className="mt-2 text-red-600 font-bold bg-red-100 p-2 rounded border-2 border-red-500">INFLASI SAAT INI: <b>{Math.floor((inflation - 1) * 100)}%</b> (Makin sering beli, makin mahal!)</p>
      </div>

      <div className="w-full flex-wrap flex gap-6 justify-center">
        {franchiseTypes.map(t => {
          const actualCost = Math.floor(t.buyPrice * inflation);
          return (
            <div key={t.typeId} className="bg-[#ffeaa7] border-4 border-black p-4 inline-flex flex-col rounded-2xl shadow-[4px_4px_0px_rgba(0,0,0,1)] w-full sm:w-64">
              <h3 className="font-impact text-2xl">{t.emoji} {t.name}</h3>
              <p className="font-mono text-sm opacity-60 mb-4">+{(t.revenue).toLocaleString()} coin/sec</p>
              <button 
                onClick={() => buyFranchise(t)} 
                disabled={coins < actualCost}
                className="mt-auto bg-green-400 border-4 border-black font-impact py-2 text-xl rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 active:translate-y-0 disabled:opacity-40 disabled:hover:translate-y-0 transition-all text-black hover:bg-green-300"
              >
                BUKA (💰 {actualCost.toLocaleString()})
              </button>
            </div>
          );
        })}
      </div>

      {franchises.length > 0 && (
        <div className="w-full mt-8 border-t-4 border-black pt-8">
          <h3 className="font-impact text-3xl mb-4 text-center">ASET FRANCHISE KAMU</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {franchises.map((f: any) => {
               const timeAlive = Math.max(0, 60 - Math.floor((Date.now() - f.lastMaintained) / 1000));
               const actualMaintCost = Math.floor(f.maintCost * inflation);
               return (
                 <div key={f.id} className={`p-4 border-4 border-black rounded-2xl shadow-[4px_4px_0px_rgba(0,0,0,1)] flex flex-col ${f.isBankrupt ? 'bg-gray-400 grayscale' : 'bg-white'}`}>
                    <div className="flex justify-between items-start mb-2">
                       <h4 className="font-impact text-xl">{f.emoji} {f.name}</h4>
                       {f.isBankrupt ? (
                         <span className="bg-red-600 text-white font-impact px-2 py-1 border-2 border-black rounded">BANGKRUT</span>
                       ) : (
                         <span className={`font-mono font-bold px-2 py-1 border-2 border-black flex items-center justify-center rounded ${timeAlive < 15 ? 'bg-red-400 text-white animate-pulse' : 'bg-green-300 text-black'}`}>
                           ⏳ {timeAlive}s
                         </span>
                       )}
                    </div>
                    {!f.isBankrupt && (
                      <p className="font-mono text-sm mb-4 bg-gray-100 p-2 border-2 border-black rounded">Revenue: +{(f.revenue).toLocaleString()}/s</p>
                    )}
                    <button 
                      onClick={() => maintainFranchise(f)} 
                      disabled={f.isBankrupt || coins < actualMaintCost}
                      className="mt-auto bg-blue-400 text-white border-4 border-black font-impact py-2 text-xl rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 active:translate-y-0 disabled:opacity-40 disabled:hover:translate-y-0 transition-all hover:bg-blue-300 disabled:shadow-none"
                    >
                      MAINTENANCE (💰 {actualMaintCost.toLocaleString()})
                    </button>
                 </div>
               )
            })}
          </div>
        </div>
      )}
    </div>
  );
}
