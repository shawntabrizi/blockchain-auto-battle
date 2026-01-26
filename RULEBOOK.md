# MANALIMIT: Official Game Rules (v1.1)

## 1. Introduction

**Manalimit** is a strategy auto-battler where your Bag is your lifeblood. There is no automatic mana regeneration. To summon a powerful army, you must be willing to destroy your own resources.

**Objective:** Win **10 Rounds** to claim victory.
**Failure:** If you lose **3 Lives**, your run ends.

---

## 2. Setup (The Bag)

Before starting a run, your **Bag** is populated with a starting set of cards.

* **Unordered Pool:** Your Bag is a chaotic collection of resources. Unlike a traditional deck, it has no specific order.
* **Resource Pool:** Your Bag is finite. It serves as both your potential recruits and your mana source.

---

## 3. Card Anatomy

Every Unit Card has four key stats. Two are for economy, two are for combat.

### Economic Stats

* **Play Cost (Blue Gem):** The Mana required to place this unit on the Board.
* **Pitch Value (Red Flame):** The Mana generated if you burn (Pitch) this unit.

### Combat Stats

* **Attack (Sword):** Damage dealt to enemies. Also determines **Priority** (who reacts first).
* **Health (Heart):** Damage sustained before the unit is defeated.

---

## 4. The Economy

You start every turn with **0 Mana**. You must generate it manually.

### Generating Mana (The Pitch)

To gain Mana, you must **Pitch** a card from your Hand or Board into the **Ash Pile**.

* **Effect:** The card is removed from the game permanently.
* **Gain:** You gain Mana equal to the card's **Pitch Value**.

### The Manalimit (Capacity)

You cannot hoard infinite Mana. Your **Manalimit** determines the maximum Mana you can hold at any one moment. 

* **Round 1:** Limit = 3 Mana.
* **Round 2+:** Limit increases by +1 per Round (Max 10).
* **Hard Limit:** Any Mana generated beyond this limit is evaporated (lost).
* **Refilling:** You can pitch, spend, and pitch again in a single turn.

> *Strategy Tip: Pitching a high-value card when your tank is full is a waste. Spend your Mana before generating more.*

---

## 5. The Game Loop

The game is played in a series of rounds. Each round has a **Planning Phase** and a **Battle Phase**.

### Phase A: The Planning Phase (Your Hand)

Every round, you derive a fresh **Hand of 7 cards** from your Bag. 

* **Deterministic:** The cards in your hand are chosen randomly but deterministically based on your game seed and the current round.
* **Persistence:** Unused hand cards return to your Bag at the end of the phase.

**Available Actions:**

1. **PITCH:** Drag a card from Hand or Board to the Ash Pile to generate Mana.
2. **PLAY:** Drag a card from Hand to an empty slot on your Board. This costs Mana.
3. **MOVE:** Drag a unit on your board to another slot to swap their positions.
4. **BATTLE:** Submit your board to start the combat.

### Phase B: The Battle (Automated)

Combat resolves automatically against a "Ghost" of a real opponent.

**1. The Priority System (Who goes first?)**
When multiple units share a trigger (e.g., "Battle Start" or "Before Any Attack"), the game uses a **Priority Queue** to decide the resolution order:

1.  **Highest Attack:** The unit with the most Attack power goes first.
2.  **Highest Health:** If Attack is tied, the unit with the most current Health goes first.
3.  **Player Priority:** If stats are tied, the Player's unit triggers before the Enemy's unit.
4.  **Front-Most:** If on the same team, the unit closer to the front (Index 0) triggers first.
5.  **Ability Order:** If a unit has multiple triggers, they resolve in the order they appear on the card.

**2. Recursive State Logic**
The game state is **Live**. If an ability kills a unit or spawns a new one, that unit's "On Death" or "On Spawn" triggers happen **immediately**, potentially interrupting the existing priority queue.

**3. The Clash (Simultaneous Damage)**

* Units attack from **Front to Back**.
* The front-most units of both teams strike each other **simultaneously**.
* If a unit dies, the next unit behind it steps forward.

**4. Outcome**

* **Victory (+1 Star):** You have at least 1 unit alive.
* **Defeat (-1 Life):** Your team is wiped out.
* **Draw (No Change):** Both teams die simultaneously. You do not gain a Star, and you do not lose a Life.

---

## 6. Progression Strategy

Scale your army by efficient **Liquidation**.

* **Early Game:** Your Manalimit is low. Focus on cheap units that provide early board presence.
* **Mid Game:** As your Manalimit grows, look for synergies.
* **The Pivot:** You can **Pitch** units from your board to generate the large amounts of Mana required to play massive **Legendary Units** (Cost 8-10).

---

## 7. Glossary

| Term | Definition |
| --- | --- |
| **Bag** | Your unordered resource pool of unit cards. |
| **Hand** | The 7 cards selected for you to play with this round. |
| **Ash Pile** | The graveyard. Pitched cards are removed from the run permanently. |
| **Pitch** | Sacrificing a card or board unit to generate Mana. |
| **Manalimit** | Your maximum Mana capacity. |
| **Priority** | The strict hierarchy used to resolve simultaneous triggers. |
| **Ghost** | A snapshot of a real player's board from a previous run. |
