# Substrate Pallet Implementation Plan

## Overview

Build a Substrate pallet (`pallet-auto-battle`) that acts as a decentralized server for the auto-battler. The pallet verifies all game state transitions on-chain, provides deterministic RNG, and coordinates PvP matchmaking via saved "ghost boards."

## Architecture

```
manalimit-core (no_std library)
    |
    v
pallet-auto-battle (Substrate pallet)
    |-- uses manalimit-core for battle resolution (only during disputes)
    |-- stores game state, cards, sets, decks on-chain
    |-- provides RNG from block hash + nonce
    |-- matches players against ghost boards
    |-- manages prize pools and token economics
    |-- OPTIMISTIC: players report results, chain verifies only on dispute
```

## Terminology

- **Card**: A unique game-mechanic definition (stats + abilities), identified by its content hash.
- **Card Metadata**: Human-readable info (name, image URL, creator) stored separately from game logic.
- **Set**: A curated collection of card hashes, used to generate decks. Permissionless to create (requires deposit).
- **Deck**: A shuffled list of card instances generated from a set for a specific game run.
- **Ghost Board**: A snapshot of a player's board at end-of-turn, saved on-chain for asynchronous PvP.
- **Prize Pool**: Tokens collected from `start_game` entries, distributed to players who reach 10 wins.
- **Optimistic Verification**: Players compute battles off-chain and report results. The chain accepts them tentatively.
- **Dispute**: Any user can challenge a reported result. The chain runs the battle logic to verify the truth and slashes liars.

---

## Feature Breakdown

### Phase 1: Optimistic Game Loop

The minimum viable pallet: a single-player run where the chain verifies actions optimistically.

#### Storage

```rust
/// Active game session per player (one at a time)
#[pallet::storage]
ActiveGame<T> = StorageMap<_, Blake2_128Concat, T::AccountId, GameSession<T>>;

/// RNG nonce per player (incremented each time RNG is consumed)
#[pallet::storage]
RngNonce<T> = StorageMap<_, Blake2_128Concat, T::AccountId, u64, ValueQuery>;

/// Prize pool balance (accumulated from start_game entry fees)
#[pallet::storage]
PrizePool<T> = StorageValue<_, BalanceOf<T>, ValueQuery>;

/// Data required to verify the last reported battle for a player
#[pallet::storage]
LastBattleProof<T> = StorageMap<_, Blake2_128Concat, T::AccountId, BattleProof<T>>;
```

```rust
/// A game session stored on-chain
#[derive(Encode, Decode, TypeInfo, MaxEncodedLen)]
pub struct GameSession<T: Config> {
    pub state: GameState,          // from manalimit-core
    pub set_hash: H256,            // which set this run uses
    pub seed: u64,                 // base RNG seed for this run
    pub entry_fee: BalanceOf<T>,   // tokens locked for this run
    pub started_at: BlockNumberFor<T>,
}

/// Snapshot of battle inputs to allow verification
#[derive(Encode, Decode, TypeInfo, MaxEncodedLen)]
pub struct BattleProof<T: Config> {
    pub round: u32,
    pub player_board: BoundedVec<BoardUnit, ConstU32<5>>,
    pub opponent_board: BoundedVec<BoardUnit, ConstU32<5>>,
    pub seed: u64,
    pub claimed_result: BattleResult,
}
```

#### Extrinsics

| Extrinsic | Description |
|-----------|-------------|
| `start_game(set_hash)` | Lock entry fee, create deck from set, shuffle with on-chain RNG, fill shop |
| `pitch_shop_card(index)` | Pitch a card from shop for mana |
| `buy_card(shop_index)` | Buy a card from shop onto board |
| `toggle_freeze(shop_index)` | Freeze/unfreeze a shop slot |
| `swap_board(a, b)` | Reorder board positions |
| `pitch_board_unit(slot)` | Pitch a board unit for mana |
| `end_turn()` | End shop phase, lock board, select opponent/seed. Transitions to "Battle Pending". |
| `report_outcome(result)` | Player reports "Win/Loss/Draw". Updates state optimistically. Stores `LastBattleProof`. |
| `dispute_battle(target_player)` | Challenger claims `target_player` lied. Chain runs `resolve_battle`. Slashes liar. |
| `forfeit()` | Abandon current run (entry fee is NOT refunded) |

#### RNG Design

```rust
fn generate_seed(who: &T::AccountId, nonce: u64) -> u64 {
    let block_hash = <frame_system::Pallet<T>>::block_hash(
        <frame_system::Pallet<T>>::block_number()
    );
    let payload = (block_hash, who, nonce).encode();
    let hash = sp_io::hashing::blake2_256(&payload);
    u64::from_le_bytes(hash[0..8].try_into().unwrap())
}
```

- Each player gets a seed derived from `(block_hash, account, nonce)`.
- Nonce increments per RNG consumption (deck shuffle, battle, ghost selection).
- Deterministic: same inputs always produce same output.
- Separate seeds for: initial deck shuffle, each battle, ghost board selection.

#### Optimistic Battle & Dispute Resolution

**1. Preparation (`end_turn`)**
- Player calls `end_turn()`.
- Chain locks current board.
- Chain selects opponent (Ghost or Fallback) and generates Battle Seed.
- Stores these inputs temporarily (or regenerates them) but does NOT run battle.
- Returns `BattleReady { seed, opponent }` event.

**2. Reporting (`report_outcome`)**
- Player runs battle locally.
- Player calls `report_outcome(Win/Loss)`.
- Chain:
    - Creates `BattleProof` { board, opponent, seed, claimed_result }.
    - Writes `LastBattleProof`.
    - Updates `GameState` (wins++, lives--) based on claim.
    - Checks for Game Over / Victory.
    - If Game Over: Payout/Cleanup is pending (maybe delayed? or optimistic?).
    - If Continue: Resets mana/shop for next round.

**3. Dispute (`dispute_battle`)**
- Anyone calls `dispute_battle(target)`.
- Chain loads `LastBattleProof`.
- Chain runs `manalimit_core::resolve_battle(proof.board, proof.opponent, proof.seed)`.
- **If Chain Result != Claimed Result:**
    - Target is slashed (Entry Fee -> Challenger).
    - Target's game is terminated.
- **If Chain Result == Claimed Result:**
    - Challenger is slashed (if we implement a challenge bond) or just pays gas.

**Security Model:**
- The Entry Fee acts as the "Bond".
- Since `LastBattleProof` is overwritten on the *next* `report_outcome`, a result is disputable for the entire duration of the subsequent Shop Phase.
- 10 Wins Payout: Should ideally have a small delay or "Challenge Period" before withdrawal to prevent "Report Win -> Withdraw -> Run" attacks.

#### Prize Pool Economics

```rust
#[pallet::config]
pub trait Config: frame_system::Config {
    /// Entry fee to start a game run
    type EntryFee: Get<BalanceOf<Self>>;
    /// Prize amount for reaching 10 wins
    type WinPrize: Get<BalanceOf<Self>>;
    /// Treasury account for fees
    type TreasuryAccount: Get<Self::AccountId>;
    /// Initial deck size for the game
    type DeckSize: Get<u32>;
}
```

- `start_game`: Transfers `EntryFee` from player to `PrizePool`.
- `continue_after_battle` (10 wins): Transfers `WinPrize` from `PrizePool` to player.
- If prize pool is insufficient, pays out what's available.
- Forfeits and losses leave the entry fee in the pool.

#### Events

```rust
#[pallet::event]
pub enum Event<T: Config> {
    GameStarted { who: T::AccountId, set_hash: H256, entry_fee: BalanceOf<T> },
    ShopAction { who: T::AccountId, action: ShopActionType },
    /// Battle is ready to be fought off-chain
    BattleReady { who: T::AccountId, round: u32, opponent_seed: u64 },
    /// Player reported a result
    BattleReported { who: T::AccountId, round: u32, claimed_result: BattleResult },
    /// A dispute was raised
    BattleDisputed { challenger: T::AccountId, target: T::AccountId, round: u32, success: bool },
    GameWon { who: T::AccountId, prize: BalanceOf<T> },
    GameLost { who: T::AccountId, round: u32 },
    GameForfeited { who: T::AccountId },
}
```

---

### Phase 2: Card Registry

Anyone can register cards for a non-refundable fee. Cards are identified by content hash for deduplication.

#### Card Identity

Cards are identified by the **blake2_256 hash of their game-mechanic data** (stats + abilities). This means:
- Two cards with identical stats and abilities are the same card regardless of who uploaded them or what name they gave it.
- Metadata (name, image, description) is stored separately and does not affect identity.
- Deduplication is automatic: registering an existing card is a no-op (or refunds).

```rust
/// Compute card identity hash from game mechanics only
fn card_hash(card: &CardOnChain) -> H256 {
    let payload = (card.attack, card.health, card.play_cost, card.pitch_value, &card.abilities).encode();
    H256(sp_io::hashing::blake2_256(&payload))
}
```

#### Storage

```rust
/// Card game data, keyed by content hash (H256)
#[pallet::storage]
Cards<T> = StorageMap<_, Blake2_128Concat, H256, CardOnChain>;

/// Card metadata (human-readable, not used in game logic)
#[pallet::storage]
CardMetadata<T> = StorageMap<_, Blake2_128Concat, H256, CardMeta<T>>;

/// Count of registered cards (for stats/UI)
#[pallet::storage]
CardCount<T> = StorageValue<_, u32, ValueQuery>;
```

```rust
/// On-chain card game data (what matters for gameplay)
#[derive(Encode, Decode, TypeInfo, MaxEncodedLen)]
pub struct CardOnChain {
    pub attack: i32,
    pub health: i32,
    pub play_cost: i32,
    pub pitch_value: i32,
    pub abilities: BoundedVec<AbilityOnChain, ConstU32<4>>,
}

/// Card metadata (human-readable, stored separately)
#[derive(Encode, Decode, TypeInfo, MaxEncodedLen)]
pub struct CardMeta<T: Config> {
    pub name: BoundedVec<u8, ConstU32<64>>,
    pub description: BoundedVec<u8, ConstU32<256>>,
    pub image_url: BoundedVec<u8, ConstU32<256>>,
    pub creator: T::AccountId,
    pub created_at: BlockNumberFor<T>,
}
```

#### Extrinsics

| Extrinsic | Description | Fee |
|-----------|-------------|-----|
| `register_card(card_data, metadata)` | Register a new card, hash is computed on-chain. Non-refundable fee goes to treasury. If card hash already exists, no-op. | Non-refundable fee |
| `update_card_metadata(card_hash, metadata)` | Update metadata for a card you created. Does not change the hash. | Free (only creator) |

---

### Phase 3: Sets & Deck Generation

Sets are curated collections of cards used to generate decks. Permissionless, requires a deposit.

#### Storage

```rust
/// Sets: named collections of card hashes
#[pallet::storage]
Sets<T> = StorageMap<_, Blake2_128Concat, H256, SetInfo<T>>;

/// Set metadata (name, description)
#[pallet::storage]
SetMetadata<T> = StorageMap<_, Blake2_128Concat, H256, SetMeta<T>>;

/// Deposit held for each set (returned on removal)
#[pallet::storage]
SetDeposits<T> = StorageMap<_, Blake2_128Concat, H256, (T::AccountId, BalanceOf<T>)>;
```

```rust
/// Set identity is hash of sorted cards (hash + rarity)
fn set_hash(cards: &[SetCard]) -> H256 {
    let mut sorted = cards.to_vec();
    sorted.sort_by(|a, b| a.card_hash.cmp(&b.card_hash));
    let payload = sorted.encode();
    H256(sp_io::hashing::blake2_256(&payload))
}

#[derive(Encode, Decode, TypeInfo, MaxEncodedLen, Clone, PartialEq, Eq, PartialOrd, Ord)]
pub struct SetCard {
    pub card_hash: H256,
    pub rarity: u8, // Probability weight (percentage out of 100)
}

/// A set: collection of cards with rarities for deck generation
#[derive(Encode, Decode, TypeInfo, MaxEncodedLen)]
pub struct SetInfo<T: Config> {
    pub cards: BoundedVec<SetCard, ConstU32<64>>,
    pub creator: T::AccountId,
    pub created_at: BlockNumberFor<T>,
}

/// Set metadata
#[derive(Encode, Decode, TypeInfo, MaxEncodedLen)]
pub struct SetMeta<T: Config> {
    pub name: BoundedVec<u8, ConstU32<64>>,
    pub description: BoundedVec<u8, ConstU32<256>>,
}
```

#### Extrinsics

| Extrinsic | Description | Fee |
|-----------|-------------|-----|
| `create_set(cards, metadata)` | Create a set from registered cards with rarities. Deposit required. | Non-refundable creation fee + refundable deposit |
| `remove_set(set_hash)` | Remove a set you created. Deposit returned. | Free (creator only) |
| `update_set_metadata(set_hash, metadata)` | Update set name/description. | Free (creator only) |

#### Changes to `start_game`

```rust
fn start_game(origin, set_hash: H256) -> DispatchResult {
    let who = ensure_signed(origin)?;
    ensure!(!ActiveGame::<T>::contains_key(&who), Error::<T>::AlreadyInGame);

    let set = Sets::<T>::get(&set_hash).ok_or(Error::<T>::SetNotFound)?;

    // Lock entry fee
    T::Currency::transfer(&who, &Self::prize_pool_account(), T::EntryFee::get(), ...)?;

    // Initialize RNG
    let nonce = RngNonce::<T>::mutate(&who, |n| { *n += 1; *n });
    let seed = Self::generate_seed(&who, nonce);
    let mut rng = XorShiftRng::seed_from_u64(seed);

    // Build deck by sampling from set based on rarity
    // Deck size defined in Config (e.g. 30)
    let mut deck = Vec::new();
    let mut next_id = 1u32;
    for _ in 0..T::DeckSize::get() {
        // Weighted sampling: Select card based on cumulative rarity
        // Assumes rarities sum to 100 or logic handles range
        let roll = rng.gen_range(0, 100); 
        let card_hash = select_card_by_rarity(&set.cards, roll);
        
        let card = Cards::<T>::get(card_hash).ok_or(Error::<T>::CardNotFound)?;
        deck.push(card.to_unit_card(next_id, card_hash));
        next_id += 1;
    }

    // Initialize game state with this deck, fill shop
    let mut state = GameState::new();
    state.deck = deck;
    Self::fill_shop(&mut state);

    ActiveGame::<T>::insert(&who, GameSession {
        state,
        set_hash,
        seed,
        entry_fee: T::EntryFee::get(),
        started_at: frame_system::Pallet::<T>::block_number(),
    });

    Ok(())
}
```

---

### Phase 4: Ghost Boards & PvP Matchmaking

Replace static opponents with real player boards saved on-chain.

#### Storage

```rust
/// Ghost boards indexed by (set_hash, round, wins, losses)
#[pallet::storage]
GhostBoards<T> = StorageMap<
    _,
    Blake2_128Concat,
    GhostBoardKey,
    BoundedVec<GhostBoard<T>, ConstU32<100>>,
>;
```

```rust
/// Composite key for ghost board lookup
#[derive(Encode, Decode, TypeInfo, Clone, PartialEq, Eq, MaxEncodedLen)]
pub struct GhostBoardKey {
    pub set_hash: H256,
    pub round: u32,
    pub wins: u32,
    pub losses: u32,
}

/// A saved ghost board
#[derive(Encode, Decode, TypeInfo, Clone, MaxEncodedLen)]
pub struct GhostBoard<T: Config> {
    pub owner: T::AccountId,
    pub board: BoundedVec<BoardUnit, ConstU32<5>>,
    pub saved_at: BlockNumberFor<T>,
}
```

#### Flow

1. When a player calls `end_turn()`, their board is saved as a ghost before battle.
2. The pallet looks up ghosts matching `(set_hash, round, wins, losses)`.
3. RNG selects which ghost board to fight.
4. If no matching ghost exists, fall back to the built-in opponent table (`get_opponent_for_round`).
5. Ghost boards persist indefinitely unless explicitly cleaned up.

#### Ghost Board Management

- **Cap**: Max 100 ghost boards per key. FIFO eviction when full.
- **Persistence**: Ghosts are never auto-expired. They include `saved_at` block number for UI sorting/filtering.
- **Cleanup**: Anyone can call `clean_ghost_boards(key, max_age)` to remove ghosts older than `max_age` blocks and reclaim storage weight, but this is optional.
- **Self-exclusion**: A player never fights their own ghost board.

#### Extrinsics

| Extrinsic | Description |
|-----------|-------------|
| `end_turn()` | (Modified) Save ghost board, select opponent. Emit `BattleReady`. |
| `clean_ghost_boards(key, older_than)` | Optional: remove stale ghost boards to reclaim storage |

---

## Implementation Order

| Step | Phase | What | Depends On |
|------|-------|------|-----------|
| 1 | Setup | Create `pallets/auto-battle/` scaffold with Cargo.toml, lib.rs | -- |
| 2 | P1 | Storage types: `GameSession`, `ActiveGame`, `RngNonce`, `PrizePool` | Step 1 |
| 3 | P1 | RNG: `generate_seed()` using block hash + account + nonce | Step 2 |
| 4 | P1 | `start_game()` extrinsic: init deck from hardcoded templates, shuffle, fill shop, lock entry fee | Step 3 |
| 5 | P1 | Shop extrinsics: `buy_card`, `pitch_shop_card`, `toggle_freeze`, `swap_board`, `pitch_board_unit` | Step 4 |
| 6 | P1 | `end_turn()` extrinsic: lock board, select opponent, emit `BattleReady` | Step 5 |
| 7 | P1 | `report_outcome()` extrinsic: verify sig, update wins, store proof | Step 6 |
| 8 | P1 | `dispute_battle()` extrinsic: run on-chain verification | Step 7 |
| 9 | P1 | `forfeit()` extrinsic: abandon run without refund | Step 4 |
| 10 | P1 | Events for all state transitions | Step 9 |
| 11 | P1 | Tests: full game loop in mock runtime | Step 10 |
| 12 | P2 | Storage: `Cards`, `CardMetadata`, `CardCount` | Step 11 |
| 13 | P2 | `register_card()` extrinsic with hash dedup + fee | Step 12 |
| 14 | P2 | `update_card_metadata()` extrinsic | Step 13 |
| 15 | P2 | Genesis config to bootstrap starter cards | Step 13 |
| 16 | P3 | Storage: `Sets`, `SetMetadata`, `SetDeposits` | Step 15 |
| 17 | P3 | `create_set()`, `remove_set()` extrinsics with deposit logic | Step 16 |
| 18 | P3 | Modify `start_game()` to accept `set_hash` and build deck from on-chain cards | Step 17 |
| 19 | P3 | Genesis config to bootstrap starter set | Step 18 |
| 20 | P4 | Storage: `GhostBoards`, `GhostBoardKey` | Step 19 |
| 21 | P4 | Modify `end_turn()` to save ghost and match against ghosts | Step 20 |
| 22 | P4 | Ghost fallback to built-in opponents | Step 21 |
| 23 | P4 | `clean_ghost_boards()` extrinsic | Step 22 |

---

## Key Design Decisions

### Content-Hash Card Identity

Cards are identified by `blake2_256(attack, health, play_cost, pitch_value, abilities)`. This means:
- **Automatic deduplication**: Two people uploading the same stats get the same card hash.
- **Metadata is separate**: Name, image, description don't affect gameplay identity.
- **Immutable game data**: Once a card hash exists, its stats can never change (hash would change).
- **Mutable metadata**: Creator can update name/image/description without affecting the hash.

### Separate Game Data vs Metadata Storage

Splitting `CardOnChain` (game mechanics) from `CardMeta` (human-readable) means:
- Game logic never reads metadata storage (cheaper extrinsics).
- Metadata can be updated without touching gameplay.
- Off-chain indexers can aggregate metadata for rich UIs.

### Deck Storage: Store Full Deck On-Chain

Store the full deck in `GameState` rather than regenerating from `set_hash + seed` each extrinsic. Rationale:
- Deck mutates during play (cards are drawn, pitched, returned).
- Regenerating + replaying all mutations would be more expensive than reading stored state.
- Benchmarks can validate this; if storage proves too expensive, we can switch to replay.

### Optimistic Verification

The pallet minimizes computational weight by not verifying battles by default.
1. **Optimism**: Players report their own results. The chain accepts them and updates state.
2. **Accountability**: The chain stores a `BattleProof` for the latest round.
3. **Disputes**: If a player lies, anyone can call `dispute_battle()`. The chain runs the expensive `resolve_battle()` logic.
    - If the player lied: They lose their entry fee and game progress.
    - If the reporter lied: They pay the transaction fees (and potentially a bond).
4. **UX**: This allows the game to be "fast" (no heavy computation per block) while remaining trustless.

### Ghost Board Lifecycle

- **Created**: Automatically when a player calls `end_turn()`.
- **Persisted**: Indefinitely, with `saved_at` block number recorded.
- **Evicted**: FIFO when a key exceeds 100 entries.
- **Cleaned**: Optionally via `clean_ghost_boards()` for storage reclamation.
- **Never auto-expired**: Old ghosts are fine -- they represent valid boards for that game state.

### Token Economics

| Action | Cost | Where It Goes |
|--------|------|---------------|
| `register_card` | Non-refundable fee | Treasury |
| `create_set` | Non-refundable fee + refundable deposit | Fee -> Treasury, Deposit -> reserved |
| `remove_set` | Free | Deposit -> unreserved back to creator |
| `start_game` | Entry fee | Prize pool |
| Win 10 games | -- | Prize pool -> winner |
| Lose/forfeit | -- | Entry fee stays in prize pool |

### Weight Estimation

- `end_turn`: Moderate. (Save ghost + select opponent + write storage).
- `report_outcome`: Cheap. (Read/Write storage + verify signature).
- `dispute_battle`: **Very Heavy**. Runs `resolve_battle` on-chain.
    - Must be bounded by max units/rounds/triggers.
    - Slashed funds should cover the gas + reward for the challenger.

---

## Directory Structure

```
auto-battle/
  core/                          # manalimit-core (existing, no_std library)
  pallets/
    auto-battle/
      Cargo.toml
      src/
        lib.rs                   # pallet definition, config, storage, errors, events
        types.rs                 # on-chain types (GameSession, CardOnChain, SetInfo, etc.)
        cards.rs                 # card registry extrinsics & hash logic
        sets.rs                  # set management extrinsics & deposit logic
        game.rs                  # core game loop extrinsics (start, shop, battle)
        ghosts.rs                # ghost board storage & matchmaking
        rng.rs                   # on-chain RNG seed generation
        economics.rs             # prize pool & fee logic
        tests.rs                 # mock runtime tests
        mock.rs                  # mock runtime setup
        benchmarking.rs          # weight benchmarks
        weights.rs               # auto-generated weights
  runtime/                       # (future) example runtime integrating the pallet
```
