import React from 'react';
import { X, ShieldAlert, Sparkles, Eye, Keyboard, HelpCircle } from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl select-none font-sans overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#1e2030] border border-white/20 rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col gap-6 text-white my-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-amber-400" />
            <h2 className="text-2xl font-black font-['Fredoka']">HOW TO PLAY</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Roles explanation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Hiders Card */}
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-base">
              <Sparkles className="w-5 h-5" />
              <span>THE HIDERS</span>
            </div>
            <ul className="text-xs text-white/80 space-y-2 leading-relaxed">
              <li>
                &bull; <strong>Preparation Phase:</strong> You have 20s while the Seeker is blinded. Run to a natural location.
              </li>
              <li>
                &bull; <strong>Transform [E]:</strong> Cycle through objects with <strong>[Q / E]</strong> and press <strong>[E]</strong> to transform into a Box, Plant, Chair, Basket, Books, etc.
              </li>
              <li>
                &bull; <strong>Blend In:</strong> Stay still to avoid suspicion. You can rotate with <strong>[R]</strong> or move slowly.
              </li>
              <li>
                &bull; <strong>Taunt [T]:</strong> Whistle to mock the seeker for extra fun and score!
              </li>
              <li>
                &bull; <strong>Win Condition:</strong> Survive until the round timer expires.
              </li>
            </ul>
          </div>

          {/* Seeker Card */}
          <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-red-400 font-extrabold text-base">
              <ShieldAlert className="w-5 h-5" />
              <span>THE SEEKER (3 CHANCES)</span>
            </div>
            <ul className="text-xs text-white/80 space-y-2 leading-relaxed">
              <li>
                &bull; <strong>Waiting Phase:</strong> Wait out the preparation countdown.
              </li>
              <li>
                &bull; <strong>Explore Large Rooms:</strong> Search the spacious room filled with props and furniture.
              </li>
              <li>
                &bull; <strong>3 Accusation Chances [Click or E]:</strong> Choose an object and accuse: <em>&quot;This is a hider!&quot;</em>. You have only <strong>3 total chances</strong> to find ALL hiders!
              </li>
              <li>
                &bull; <strong>Wrong Guesses Cost a Chance:</strong> Guessing an ordinary prop deducts 1 chance. Lose all 3 chances and the Hiders instantly win!
              </li>
              <li>
                &bull; <strong>Rotation Rule:</strong> If you find all hiders in 3 chances, the <strong>first hider caught</strong> becomes next round&apos;s Seeker. If you fail, you <strong>stay as Seeker</strong> next round!
              </li>
            </ul>
          </div>
        </div>

        {/* Controls Reference */}
        <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-sm mb-1">
            <Keyboard className="w-4 h-4" />
            <span>KEYBOARD &amp; MOUSE CONTROLS</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div className="p-2 rounded-xl bg-black/40 flex flex-col">
              <kbd className="font-mono text-amber-300 font-bold">W / A / S / D</kbd>
              <span className="text-white/70">Move Character / Prop</span>
            </div>
            <div className="p-2 rounded-xl bg-black/40 flex flex-col">
              <kbd className="font-mono text-amber-300 font-bold">Mouse Drag</kbd>
              <span className="text-white/70">Orbit 3rd-Person Camera</span>
            </div>
            <div className="p-2 rounded-xl bg-black/40 flex flex-col">
              <kbd className="font-mono text-amber-300 font-bold">Left Click / E</kbd>
              <span className="text-white/70">Seeker: Inspect &bull; Hider: Transform</span>
            </div>
            <div className="p-2 rounded-xl bg-black/40 flex flex-col">
              <kbd className="font-mono text-amber-300 font-bold">Q / E</kbd>
              <span className="text-white/70">Cycle Prop Carousel</span>
            </div>
            <div className="p-2 rounded-xl bg-black/40 flex flex-col">
              <kbd className="font-mono text-amber-300 font-bold">R</kbd>
              <span className="text-white/70">Hider: Reset to Human Form</span>
            </div>
            <div className="p-2 rounded-xl bg-black/40 flex flex-col">
              <kbd className="font-mono text-amber-300 font-bold">T</kbd>
              <span className="text-white/70">Hider: Whistle Taunt</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-white font-black text-base font-['Fredoka'] cursor-pointer"
        >
          GOT IT, LET'S PLAY!
        </button>
      </div>
    </div>
  );
};
