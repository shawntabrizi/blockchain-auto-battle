### Context 4: The "State Bridge" (The WASM Hook)

*Feed this when Claude starts writing the `App.tsx` or `store.ts` file. This solves the "How do I update the UI?" problem.*

```markdown
## State Management Pattern (Rust -> React)
We strictly follow the "Unidirectional Data Flow" pattern using `zustand` and the Rust `GameEngine`.

### 1. The Rust View Struct
In Rust, define a `GameView` struct that contains *everything* the UI needs to render.
- `player_board`: Vec<UnitView>
- `shop_cards`: Vec<CardView>
- `mana`: i32
- `mana_limit`: i32
- `ash_pile_hover_value`: i32 (Optional, for UI feedback)

### 2. The React Store (Zustand)
Create a store that holds the `WasmEngine` instance and the current `GameView`.

```typescript
interface GameStore {
  // The Raw WASM Instance (Hidden from UI components)
  engine: GameEngine | null;

  // The Renderable Data (Used by UI)
  view: GameView | null;

  // Actions
  init: () => Promise<void>;
  burnCard: (index: number) => void;
  buyCard: (index: number) => void;
  endTurn: () => void;
}

// The Action Pattern
burnCard: (index) => {
  const { engine } = get();
  if (!engine) return;

  // 1. Mutate Rust State
  engine.burn_card(index);

  // 2. Sync View
  // Rust returns the ENTIRE new state tree. We simply replace it.
  set({ view: engine.get_view() });
}

```

**Crucial Rule:** React components never modify state locally. They call an action, which calls Rust, which returns the new Truth.

---

### Context 5: The Battle Engine (Simulation Loop)
*Feed this when asking Claude to implement `engine.rs`. This ensures the specific "Manalimit" rules (Initiative, Simultaneous Damage) are respected.*

```markdown
## Combat Simulation Spec (Rust)
The combat engine must be **Deterministic**. It takes two `BoardState` structs (Player and Enemy) and returns a `BattleOutput` (containing a list of events for React to replay).

### The Priority System (Strict Hierarchy)
When multiple units share a trigger, the resolution order is:
1.  **Highest Attack:** The unit with the most Attack power goes first.
2.  **Highest Health:** If Attack is tied, the unit with the most current Health goes first.
3.  **Player Priority:** If stats are tied, the Player's unit triggers before the Enemy's unit.
4.  **Front-Most:** If on the same team, the unit closer to the front (Index 0) triggers first.
5.  **Ability Order:** If a unit has multiple abilities, they resolve in the order defined on the card.

### Composable Ability System
Abilities are constructed from:
- **Trigger**: `onStart`, `onFaint`, `onHurt`, `onAllySpawn`, etc.
- **Target**: `Position`, `Standard` (stat-based), `Random`, `All`, `Adjacent`.
- **Effect**: `Damage`, `ModifyStats`, `SpawnUnit`, `Destroy`.
- **Condition**: Optional logic gates (`StatValueCompare`, `UnitCount`, `And/Or/Not`).

### The Loop Logic
While both teams have units > 0:

1.  **Phase: Start of Battle**
    - Collect all "On Start" triggers. Resolve via Priority Queue.

2.  **Phase: Attack Loop**
    - **Before Attack**: Resolve `BeforeAnyAttack` and `BeforeUnitAttack` (front units only).
    - **The Clash**: Front units strike simultaneously.
    - **Hurt & Faint Loop**: Resolve `OnHurt`, `OnFaint`, `OnAllyFaint` triggers recursively.
    - **After Attack**: Resolve `AfterAnyAttack` and `AfterUnitAttack`.

3.  **Slide Logic**: When a unit dies, survivors slide forward to fill the gap.

### Output Format
Return a `Vec<CombatEvent>` for UI playback.
```rust
pub enum CombatEvent {
    Clash { p_dmg: i32, e_dmg: i32 },
    AbilityTrigger { source_instance_id: UnitInstanceId, ability_name: String },
    AbilityDamage { source_instance_id: UnitInstanceId, target_instance_id: UnitInstanceId, damage: i32, remaining_hp: i32 },
    UnitDeath { team: Team, new_board_state: Vec<UnitView> },
    UnitSpawn { team: Team, spawned_unit: UnitView, new_board_state: Vec<UnitView> },
    // ... other events
}
```
