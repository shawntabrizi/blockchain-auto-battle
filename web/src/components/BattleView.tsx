import type { CombatUnitInfo } from '../types';

interface BattleViewProps {
  playerUnits: CombatUnitInfo[];
  enemyUnits: CombatUnitInfo[];
}

export function BattleView({ playerUnits, enemyUnits }: BattleViewProps) {
  // In Super Auto Pets, positions are numbered from the back (1) to front (5)
  // But arrays are indexed from 0 (front) to 4 (back)
  // So we need to reverse the display order

  const maxUnits = Math.max(playerUnits.length, enemyUnits.length);

  return (
    <div className="flex items-center justify-center gap-8 p-4">
      {/* Player side (left) */}
      <div className="flex flex-col items-center gap-2">
        <div className="text-sm text-gray-400 mb-2">Player</div>
        <div className="flex gap-2">
          {/* Display positions 5 4 3 2 1 (from front to back) */}
          {Array.from({ length: maxUnits }).map((_, i) => {
            const unitIndex = maxUnits - 1 - i; // Convert to array index (4, 3, 2, 1, 0)
            const unit = playerUnits[unitIndex];
            const position = i + 1; // Display position (1, 2, 3, 4, 5)
            const isDead = unit && unit.health <= 0;

            return (
              <div key={`player-${i}`} className="flex flex-col items-center gap-1">
                <div className="text-xs text-gray-500">{position}</div>
                {unit ? (
                  <div className={`w-16 h-20 rounded border flex flex-col items-center justify-center text-xs p-1 ${
                    isDead ? 'bg-red-900/50 border-red-700 opacity-50' : 'bg-blue-900/50 border-blue-700'
                  }`}>
                    <div className="font-bold text-center leading-tight">{unit.name}</div>
                    <div className="flex gap-1 mt-1">
                      <span className="text-red-400">⚔️{unit.attack}</span>
                      <span className={`text-green-400 ${isDead ? 'line-through' : ''}`}>
                        ❤️{unit.health}/{unit.maxHealth}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="w-16 h-20 rounded border border-gray-600 bg-gray-800/50 flex items-center justify-center">
                    <span className="text-gray-600 text-xs">-</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* VS in the middle */}
      <div className="text-4xl font-bold text-gray-500">VS</div>

      {/* Enemy side (right) */}
      <div className="flex flex-col items-center gap-2">
        <div className="text-sm text-gray-400 mb-2">Enemy</div>
        <div className="flex gap-2">
          {/* Display positions 1 2 3 4 5 (from back to front) */}
          {Array.from({ length: maxUnits }).map((_, i) => {
            const unitIndex = i; // Array index (0, 1, 2, 3, 4)
            const unit = enemyUnits[unitIndex];
            const position = i + 1; // Display position (1, 2, 3, 4, 5)
            const isDead = unit && unit.health <= 0;

            return (
              <div key={`enemy-${i}`} className="flex flex-col items-center gap-1">
                <div className="text-xs text-gray-500">{position}</div>
                {unit ? (
                  <div className={`w-16 h-20 rounded border flex flex-col items-center justify-center text-xs p-1 ${
                    isDead ? 'bg-red-900/50 border-red-700 opacity-50' : 'bg-red-900/50 border-red-700'
                  }`}>
                    <div className="font-bold text-center leading-tight">{unit.name}</div>
                    <div className="flex gap-1 mt-1">
                      <span className="text-red-400">⚔️{unit.attack}</span>
                      <span className={`text-green-400 ${isDead ? 'line-through' : ''}`}>
                        ❤️{unit.health}/{unit.maxHealth}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="w-16 h-20 rounded border border-gray-600 bg-gray-800/50 flex items-center justify-center">
                    <span className="text-gray-600 text-xs">-</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}