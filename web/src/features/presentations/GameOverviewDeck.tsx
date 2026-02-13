import {
  Deck,
  Slide,
  Heading,
  Text,
  UnorderedList,
  ListItem,
  CodePane,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  FlexBox,
  Box,
} from 'spectacle';
import { UnitCard } from '../../components/UnitCard';
import { BattleSlideComponent } from './BattleSlideComponent';
import { ShopSlideComponent } from './ShopSlideComponent';
import { CardBreakdownComponent } from './CardBreakdownComponent';
import { CardCreatorSlideComponent } from './CardCreatorSlideComponent';
import { SetCreatorSlideComponent } from './SetCreatorSlideComponent';
import type { CardView } from '../../types';

const theme = {
  colors: {
    primary: '#ffffff',
    secondary: '#d1d5db',
    tertiary: '#111827',
    quaternary: '#9ca3af',
  },
  fonts: {
    header: '"system-ui", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    text: '"system-ui", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    monospace: 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace',
  },
  fontSizes: {
    h1: '48px',
    h2: '36px',
    h3: '28px',
    text: '24px',
    monospace: '18px',
  },
};

const wolfRider: CardView = {
  id: 0,
  name: 'Wolf Rider',
  attack: 3,
  health: 2,
  play_cost: 3,
  pitch_value: 1,
  abilities: [
    {
      trigger: 'OnFaint',
      effect: { type: 'Damage', amount: 2, target: { type: 'Position', data: { scope: 'Enemies', index: 0 } } },
      name: 'Dying Bite',
      description: 'Deal 2 damage to front enemy on death',
      conditions: [],
    },
  ],
};

const manaReaper: CardView = {
  id: 0,
  name: 'Mana Reaper',
  attack: 2,
  health: 2,
  play_cost: 8,
  pitch_value: 2,
  abilities: [
    {
      trigger: 'OnStart',
      effect: { type: 'Destroy', target: { type: 'Standard', data: { scope: 'Enemies', stat: 'Mana', order: 'Descending', count: 1 } } },
      name: 'Harvest the Rich',
      description: 'Destroy the highest mana cost enemy',
      conditions: [],
    },
    {
      trigger: 'OnStart',
      effect: { type: 'Destroy', target: { type: 'Standard', data: { scope: 'Enemies', stat: 'Mana', order: 'Ascending', count: 1 } } },
      name: 'Cull the Weak',
      description: 'Destroy the lowest mana cost enemy',
      conditions: [],
    },
  ],
};

const dragonTyrant: CardView = {
  id: 0,
  name: 'Dragon Tyrant',
  attack: 6,
  health: 5,
  play_cost: 5,
  pitch_value: 3,
  abilities: [],
};

function ScaledUnitCard({ card }: { card: CardView }) {
  return (
    <div style={{ transform: 'scale(1.5)', transformOrigin: 'center', margin: '2rem' }}>
      <UnitCard card={card} showCost showPitch />
    </div>
  );
}

export default function GameOverviewDeck() {
  return (
    <Deck theme={theme} template={() => <></>}>
      {/* Slide 1: Title */}
      <Slide backgroundColor="tertiary">
        <Heading>ManaLimit</Heading>
        <Text color="secondary">A Blockchain-Native Auto-Battler</Text>
      </Slide>

      {/* Slide 2: Section - Introduction */}
      <Slide backgroundColor="tertiary">
        <Heading>Introduction to the Game</Heading>
      </Slide>

      {/* Slide 3: What is ManaLimit? */}
      <Slide backgroundColor="tertiary">
        <Heading fontSize="h2">What is ManaLimit?</Heading>
        <Text>
          A <strong>deck-building auto-battler</strong> that combines the best elements of:
        </Text>
        <UnorderedList>
          <ListItem>
            <strong>Magic: The Gathering</strong> - Resource management, deck building, card
            abilities.
          </ListItem>
          <ListItem>
            <strong>Super Auto Pets</strong> - Auto-battling, ghost opponents, board positioning.
          </ListItem>
          <ListItem>
            <strong>Flesh and Blood</strong> - Pitch system, deck control.
          </ListItem>
        </UnorderedList>
      </Slide>

      {/* Slide 4: Core Game Loop */}
      <Slide backgroundColor="tertiary">
        <Heading fontSize="h2">Core Game Loop</Heading>
        <CodePane language="text">{`  Shop Phase  ───►  Battle Phase
      ▲                  │
      └─── Repeat ───────┘`}</CodePane>
        <UnorderedList>
          <ListItem>
            <strong>Shop</strong>: Build your board, manage resources.
          </ListItem>
          <ListItem>
            <strong>Battle</strong>: Watch your units fight automatically.
          </ListItem>
          <ListItem>
            <strong>Goal</strong>: Win 10 battles before losing 3 lives.
          </ListItem>
        </UnorderedList>
      </Slide>

      {/* Slide 5: Shop Phase */}
      <Slide backgroundColor="tertiary">
        <Heading fontSize="h2">Shop Phase</Heading>
        <ShopSlideComponent />
        <UnorderedList fontSize="20px">
          <ListItem>
            <strong>Pitch</strong> cards to the ash pile → gain mana (red value). Your total mana is
            limited, but grows with each turn.
          </ListItem>
          <ListItem>
            <strong>Play</strong> cards to the board → spend mana (blue cost).
          </ListItem>
          <ListItem>
            Remaining cards are shuffled back into the deck. Choose carefully what cards you pitch
            and what cards you keep!
          </ListItem>
        </UnorderedList>
      </Slide>

      {/* Slide 6: Battle Phase */}
      <Slide backgroundColor="tertiary">
        <Heading fontSize="h2">Battle Phase</Heading>
        <BattleSlideComponent
          playerUnits={['shield_bearer', 'wolf_rider', 'fire_elemental', 'martyr_knight', 'archer']}
          enemyUnits={[
            'raging_orc',
            'spined_urchin',
            'zombie_captain',
            'necromancer',
            'sniper',
          ]}
          seed={42}
        />
        <UnorderedList fontSize="20px">
          <ListItem>Battles happen automatically against the opponent board.</ListItem>
          <ListItem>
            Strategy happens in the shop phase: what to pitch, play, and board order.
          </ListItem>
        </UnorderedList>
      </Slide>

      {/* Slide 7: Anatomy of a Unit Card */}
      <Slide backgroundColor="tertiary">
        <Heading fontSize="h2">Anatomy of a Unit Card</Heading>
        <FlexBox alignItems="center">
          <Box>
            <ScaledUnitCard card={wolfRider} />
          </Box>
          <Box>
            <Table fontSize="18px">
              <TableHeader>
                <TableRow>
                  <TableCell>Stat</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Meaning</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <strong>Mana Cost</strong>
                  </TableCell>
                  <TableCell>Top Left (Blue)</TableCell>
                  <TableCell>Mana required to play</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <strong>Pitch Value</strong>
                  </TableCell>
                  <TableCell>Top Right (Red)</TableCell>
                  <TableCell>Mana gained when pitched</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <strong>Attack</strong>
                  </TableCell>
                  <TableCell>Bottom Left</TableCell>
                  <TableCell>Damage dealt when attacking</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <strong>Health</strong>
                  </TableCell>
                  <TableCell>Bottom Right</TableCell>
                  <TableCell>Damage before dying</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <strong>Abilities</strong>
                  </TableCell>
                  <TableCell>Middle Right</TableCell>
                  <TableCell>Special effects during battle</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        </FlexBox>
      </Slide>

      {/* Slide 8: Card Abilities */}
      <Slide backgroundColor="tertiary">
        <Heading fontSize="h2">Card Abilities</Heading>
        <FlexBox alignItems="center">
          <Box>
            <ScaledUnitCard card={manaReaper} />
          </Box>
          <Box>
            <CardBreakdownComponent card={manaReaper} />
          </Box>
        </FlexBox>
        <UnorderedList fontSize="20px">
          <ListItem>
            <strong>Trigger</strong>: When does it activate? (e.g. OnStart, OnFaint, BeforeAttack)
          </ListItem>
          <ListItem>
            <strong>Effect</strong>: What does it do? (e.g. Damage, Buff, Spawn, Destroy)
          </ListItem>
          <ListItem>
            <strong>Target</strong>: Who does it affect? (e.g. Allies, Enemies, Self)
          </ListItem>
        </UnorderedList>
      </Slide>

      {/* Slide 9: Card Selection */}
      <Slide backgroundColor="tertiary">
        <Heading fontSize="h2">Card Selection</Heading>
        <Text fontSize="20px">
          Every card can be <strong>played</strong> and/or <strong>pitched</strong>:
        </Text>
        <FlexBox alignItems="center">
          <Box>
            <ScaledUnitCard card={dragonTyrant} />
          </Box>
          <Box>
            <UnorderedList fontSize="20px">
              <ListItem>
                <strong>Play it</strong>: Spend mana to put it on the board.
              </ListItem>
              <ListItem>
                <strong>Pitch it</strong>: Discard it to gain mana for other cards. You can also
                pitch cards from your existing board.
              </ListItem>
              <ListItem>
                High-cost cards are powerful but require pitching other cards to afford them!
              </ListItem>
              <ListItem>
                Some cards may not provide a lot of mana but may be powerful on their own.
              </ListItem>
              <ListItem>Cards may synergize with one another using different strategies.</ListItem>
            </UnorderedList>
          </Box>
        </FlexBox>
      </Slide>

      {/* Slide 10: Section - Built for Blockchain */}
      <Slide backgroundColor="tertiary">
        <Heading>Built for Blockchain</Heading>
      </Slide>

      {/* Slide 11: A Game Truly Enhanced by Blockchain */}
      <Slide backgroundColor="tertiary">
        <Heading fontSize="h2">A Game Truly Enhanced by Blockchain</Heading>
        <Text>Manalimit is designed end-to-end for the blockchain:</Text>
        <UnorderedList>
          <ListItem>Technology of the Game</ListItem>
          <ListItem>Mechanics of the Game</ListItem>
          <ListItem>Ecosystem of the Game</ListItem>
          <ListItem>Adoption of the Game</ListItem>
        </UnorderedList>
      </Slide>

      {/* Slide 12: Section - Technology */}
      <Slide backgroundColor="tertiary">
        <Heading>Technology of the Game</Heading>
      </Slide>

      {/* Slide 13: Deterministic WASM Engine */}
      <Slide backgroundColor="tertiary">
        <Heading fontSize="h2">Deterministic WASM Engine</Heading>
        <Text>
          The <strong>same Rust code</strong> runs everywhere:
        </Text>
        <CodePane language="text">{`┌────────────────────────────────────┐
│        manalimit-core (Rust)       │
└──────────┬───────────┬─────────────┘
           │           │
     ┌─────▼─────┐ ┌───▼───────────┐
     │  Browser  │ │  Blockchain   │
     │  (WASM)   │ │  (Substrate)  │
     └───────────┘ └───────────────┘`}</CodePane>
        <Text>Byte-perfect execution in both environments.</Text>
      </Slide>

      {/* Slide 14: On-Chain Randomness */}
      <Slide backgroundColor="tertiary">
        <Heading fontSize="h2">On-Chain Randomness</Heading>
        <Text>Randomness is an important part of making games fun.</Text>
        <UnorderedList>
          <ListItem>Seed-based RNG for "random" effects.</ListItem>
          <ListItem>
            Seed provided by the blockchain, and stored in the game state of the user. Randomness
            cannot be controlled or manipulated by the player.
          </ListItem>
          <ListItem>Every battle is reproducible given the same inputs.</ListItem>
        </UnorderedList>
      </Slide>

      {/* Slide 15: Engine Safety Limits */}
      <Slide backgroundColor="tertiary">
        <Heading fontSize="h2">Engine Safety Limits</Heading>
        <Text>
          The battle engine enforces <strong>hard limits</strong> to prevent abuse:
        </Text>
        <Table fontSize="20px">
          <TableHeader>
            <TableRow>
              <TableCell>Limit</TableCell>
              <TableCell>Value*</TableCell>
              <TableCell>Purpose</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Max Battle Rounds</TableCell>
              <TableCell>100</TableCell>
              <TableCell>Prevents infinite stalemates</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Max Triggers per Phase</TableCell>
              <TableCell>200</TableCell>
              <TableCell>Stops trigger loops</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Max Trigger Depth</TableCell>
              <TableCell>10</TableCell>
              <TableCell>Limits chain reactions</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Max Spawns per Battle</TableCell>
              <TableCell>100</TableCell>
              <TableCell>Prevents spawn floods</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Max Recursion Depth</TableCell>
              <TableCell>50</TableCell>
              <TableCell>Protects against stack overflow</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <Text fontSize="16px" color="quaternary">
          <strong>If a user's board reaches an engine limit, they forfeit that round.</strong>{' '}
          *Values are for example purposes.
        </Text>
      </Slide>

      {/* Slide 16: Section - Mechanics */}
      <Slide backgroundColor="tertiary">
        <Heading>Mechanics of the Game</Heading>
      </Slide>

      {/* Slide 17: Ghost Opponents */}
      <Slide backgroundColor="tertiary">
        <Heading fontSize="h2">Ghost Opponents</Heading>
        <UnorderedList>
          <ListItem>You don't play against live opponents.</ListItem>
          <ListItem>
            You play against snapshots of other players' boards. You are paired with other players
            which have the same <strong>Rounds</strong>, <strong>Lives</strong>, and{' '}
            <strong>Wins</strong> as you.
          </ListItem>
          <ListItem>Blockchain acts as a public matchmaking engine.</ListItem>
          <ListItem>No waiting, no coordination needed.</ListItem>
          <ListItem>The game is always populated with opponents!</ListItem>
          <ListItem>Great for bootstrapping a community.</ListItem>
        </UnorderedList>
      </Slide>

      {/* Slide 18: Automatic Game Balancing */}
      <Slide backgroundColor="tertiary">
        <Heading fontSize="h2">Automatic Game Balancing</Heading>
        <Text>Every game you play will feel balanced because:</Text>
        <UnorderedList>
          <ListItem>
            Pairing users with the same <strong>Rounds</strong> means they have had equal access to
            resources.
          </ListItem>
          <ListItem>
            Pairing users with the same <strong>Lives</strong> and <strong>Wins</strong> means they
            are performing at an equal rate to you.
          </ListItem>
        </UnorderedList>
        <Text>
          If you are playing badly, you will be paired against those playing badly, and vice versa.
        </Text>
        <Text>The game is always challenging, but also always fun.</Text>
      </Slide>

      {/* Slide 19: Asynchronous Turns */}
      <Slide backgroundColor="tertiary">
        <Heading fontSize="h2">Asynchronous Turns</Heading>
        <Text fontSize="20px">
          Battles are entirely automatic. The shop phase is designed to be fully asynchronous,
          requiring only <strong>one</strong> transaction with the blockchain.
        </Text>
        <UnorderedList fontSize="18px">
          <ListItem>
            A single randomness seed is generated by the blockchain and stored in the user's game
            state.
          </ListItem>
          <ListItem>
            This determines the user's hand, which cannot change (no card draw or reshuffling).
          </ListItem>
          <ListItem>
            All actions in the shop are recorded and executed by the browser Wasm engine, with
            effects displayed in real time.
          </ListItem>
          <ListItem>
            When done, the user presses "submit" — the browser engine creates a compact summary and
            sends it to the blockchain.
          </ListItem>
          <ListItem>
            This replicates the final state and is immediately used for battle!
          </ListItem>
        </UnorderedList>
        <Text fontSize="18px">
          Users can literally put down and pick up the game at any time, without worry!
        </Text>
      </Slide>

      {/* Slide 20: Section - Economy */}
      <Slide backgroundColor="tertiary">
        <Heading>Economy of the Game</Heading>
      </Slide>

      {/* Slide 21: Self-Sustaining Economies */}
      <Slide backgroundColor="tertiary">
        <Heading fontSize="h2">Self-Sustaining Economies</Heading>
        <Text>The game creates value loops which keep the game evolving.</Text>
        <CodePane language="text">{`Players ──► Tournaments ──► Rewards
   ▲                           │
   │                           │
   │                           ▼
   └─ Sets ◄── Cards ◄── Creators`}</CodePane>
      </Slide>

      {/* Slide 22: Build-to-Earn */}
      <Slide backgroundColor="tertiary">
        <Heading fontSize="h2">Build-to-Earn</Heading>
        <UnorderedList>
          <ListItem>
            Failed blockchain games focus on "play-to-earn" mechanics, which are just ponzinomics.
          </ListItem>
          <ListItem>
            Real games should extract value from those who enjoy the game, and return value to those
            who make the game enjoyable.
          </ListItem>
          <ListItem>
            The most expensive part of strategy card games is <strong>game design</strong>.
          </ListItem>
          <ListItem>
            Manalimit allows the community to take on the role of game design, and be rewarded for
            doing so!
          </ListItem>
        </UnorderedList>
      </Slide>

      {/* Slide 23: Card Creation */}
      <Slide backgroundColor="tertiary">
        <Heading fontSize="h2">Card Creation</Heading>
        <CardCreatorSlideComponent />
        <UnorderedList fontSize="18px">
          <ListItem>
            Users can design cards: Stats (Attack, Health, Cost, Pitch) and Abilities (fully
            customizable).
          </ListItem>
          <ListItem>
            Cards are stored on-chain, available to everyone. Cards are given permanent unique
            identifiers. Card Hash ensures no duplicates.
          </ListItem>
        </UnorderedList>
      </Slide>

      {/* Slide 24: Set Curation */}
      <Slide backgroundColor="tertiary">
        <Heading fontSize="h2">Set Curation</Heading>
        <SetCreatorSlideComponent />
        <UnorderedList fontSize="18px">
          <ListItem>
            <strong>Sets</strong> are curated collections of cards. <strong>Any</strong> card can be
            fun... when put in the right set.
          </ListItem>
          <ListItem>
            Curators select cards that create interesting strategies and metas.
          </ListItem>
          <ListItem>Players themselves curate sets based on how much fun they have playing.</ListItem>
        </UnorderedList>
      </Slide>

      {/* Slide 25: Tournaments */}
      <Slide backgroundColor="tertiary">
        <Heading fontSize="h2">Tournaments</Heading>
        <Text>Tournaments can be organized by the community!</Text>
        <UnorderedList>
          <ListItem>Select a set for players to play.</ListItem>
          <ListItem>Select an entry cost and prize pool.</ListItem>
          <ListItem>Select a time period for the tournament.</ListItem>
        </UnorderedList>
      </Slide>

      {/* Slide 26: Tournament Economics */}
      <Slide backgroundColor="tertiary">
        <Heading fontSize="h2">Tournament Economics</Heading>
        <Text>Entry fees distributed to:</Text>
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell>Recipient</TableCell>
              <TableCell>Reward For</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>
                <strong>Top Finishers</strong>
              </TableCell>
              <TableCell>Skill and performance</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <strong>Set Curators</strong>
              </TableCell>
              <TableCell>Creating fun metas</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <strong>Card Creators</strong>
              </TableCell>
              <TableCell>Designing used cards</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <Text>
          Players pay to play a game they enjoy. Everyone who contributes value captures value.
        </Text>
      </Slide>

      {/* Slide 27: Section - Design Space */}
      <Slide backgroundColor="tertiary">
        <Heading>(Nearly) Infinite Design Space</Heading>
      </Slide>

      {/* Slide 28: Card Set Speed */}
      <Slide backgroundColor="tertiary">
        <FlexBox alignItems="center">
          <Box>
            <ScaledUnitCard card={manaReaper} />
          </Box>
          <Box>
            <Heading fontSize="h3">Card Set Speed</Heading>
            <Text fontSize="20px">
              The basic stats of a card can already be manipulated to heavily affect the "speed" of
              gameplay of a card set:
            </Text>
            <UnorderedList fontSize="18px">
              <ListItem>Mana: The lower the mana, the sooner people can play a card.</ListItem>
              <ListItem>
                Pitch: The higher the pitch cost, the more resources a user has per turn.
              </ListItem>
              <ListItem>
                Attack: The higher the average attack, the more aggressive the format.
              </ListItem>
              <ListItem>Health: The higher the health, the more defensive the format.</ListItem>
            </UnorderedList>
            <Text fontSize="18px">
              Even tweaking one of these stats by one creates a new card with new dynamics.
            </Text>
          </Box>
        </FlexBox>
      </Slide>

      {/* Slide 29: Card Abilities (Design Space) */}
      <Slide backgroundColor="tertiary">
        <FlexBox alignItems="center">
          <Box>
            <CardBreakdownComponent card={manaReaper} />
          </Box>
          <Box>
            <Heading fontSize="h3">Card Abilities</Heading>
            <Text fontSize="20px">
              The real design space of cards and card sets comes from card abilities.
            </Text>
            <Text fontSize="20px">
              Cards can have one or more abilities, all using composable primitives.
            </Text>
          </Box>
        </FlexBox>
      </Slide>

      {/* Slide 30: The Ability System */}
      <Slide backgroundColor="tertiary">
        <Heading fontSize="h2">The Ability System</Heading>
        <Text fontSize="20px">Card abilities are built from composable primitives:</Text>
        <Box fontSize="0.7em">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Triggers</TableCell>
                <TableCell>Effects</TableCell>
                <TableCell>Targets</TableCell>
                <TableCell>Scopes</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>OnStart</TableCell>
                <TableCell>Damage</TableCell>
                <TableCell>Position</TableCell>
                <TableCell>Self</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>OnFaint</TableCell>
                <TableCell>ModifyStats</TableCell>
                <TableCell>Adjacent</TableCell>
                <TableCell>Allies</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>OnAllyFaint</TableCell>
                <TableCell>SpawnUnit</TableCell>
                <TableCell>Random</TableCell>
                <TableCell>Enemies</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>OnHurt</TableCell>
                <TableCell>Destroy</TableCell>
                <TableCell>Standard</TableCell>
                <TableCell>All</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>OnSpawn</TableCell>
                <TableCell>&nbsp;</TableCell>
                <TableCell>All</TableCell>
                <TableCell>AlliesOther</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>OnAllySpawn</TableCell>
                <TableCell>&nbsp;</TableCell>
                <TableCell>&nbsp;</TableCell>
                <TableCell>TriggerSource</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>OnEnemySpawn</TableCell>
                <TableCell>&nbsp;</TableCell>
                <TableCell>&nbsp;</TableCell>
                <TableCell>Aggressor</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>BeforeUnitAttack</TableCell>
                <TableCell>&nbsp;</TableCell>
                <TableCell>&nbsp;</TableCell>
                <TableCell>&nbsp;</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>AfterUnitAttack</TableCell>
                <TableCell>&nbsp;</TableCell>
                <TableCell>&nbsp;</TableCell>
                <TableCell>&nbsp;</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>BeforeAnyAttack</TableCell>
                <TableCell>&nbsp;</TableCell>
                <TableCell>&nbsp;</TableCell>
                <TableCell>&nbsp;</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>AfterAnyAttack</TableCell>
                <TableCell>&nbsp;</TableCell>
                <TableCell>&nbsp;</TableCell>
                <TableCell>&nbsp;</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>
        <Text fontSize="18px">There is plenty of design space for more abilities!</Text>
      </Slide>

      {/* Slide 31: Combining Primitives */}
      <Slide backgroundColor="tertiary">
        <Heading fontSize="h2">Combining Primitives</Heading>
        <FlexBox alignItems="flex-start">
          <Box fontSize="0.7em" flex={1}>
            <Text fontSize="18px">"Complex" Example:</Text>
            <CodePane language="json">{`[{
  "trigger": "BeforeUnitAttack",
  "conditions": [{
    "Is": { "StatValueCompare": {
      "scope": "SelfUnit",
      "stat": "Health",
      "op": "LessThan",
      "value": 3
    }}
  }],
  "effect": {"ModifyStats": {
    "attack": 2, "health": 0,
    "target": { "All": "SelfUnit" }
  }}
}, {
  "trigger": "BeforeUnitAttack",
  "conditions": ["...same"],
  "effect": { "SpawnUnit": {
    "template_id": "1_1_token"
  }}
}]`}</CodePane>
          </Box>
          <Box flex={1}>
            <UnorderedList fontSize="20px">
              <ListItem>
                <strong>Simple</strong>: "OnFaint: Deal 2 damage to a random enemy"
              </ListItem>
              <ListItem>
                <strong>Complex</strong>: "BeforeAttack: If this unit has less than 3 health, gain
                +2 attack and spawn a 1/1 token"
              </ListItem>
              <ListItem>
                <strong>Synergistic</strong>: "OnAllyFaint: All allies gain +1/+1"
              </ListItem>
            </UnorderedList>
            <Text fontSize="20px">
              The system enables emergent complexity from simple rules.
            </Text>
          </Box>
        </FlexBox>
      </Slide>

      {/* Slide 32: Chain Reactions */}
      <Slide backgroundColor="tertiary">
        <Heading fontSize="h2">Example: Chain Reactions</Heading>
        <CodePane language="text">{`Unit A: OnFaint → Spawn Unit B
Unit B: OnSpawn → Deal 1 damage to all enemies
Enemy: OnHurt → Gain +1 attack`}</CodePane>
        <Text>
          One faint triggers a cascade of effects - all deterministic, all verifiable.
        </Text>
      </Slide>

      {/* Slide 33: Themes, Synergies, and Strategies */}
      <Slide backgroundColor="tertiary">
        <Heading fontSize="h2">Themes, Synergies, and Strategies</Heading>
        <Text>
          It is common to create "rock paper scissors" strategies to prevent a stale metagame.
        </Text>
        <Text>For example:</Text>
        <UnorderedList>
          <ListItem>
            <strong>Spawners</strong>: Cards that spawn other cards, and cards that buff spawned
            cards.
          </ListItem>
          <ListItem>
            <strong>Brute Force</strong>: Cards that are big, angry, and efficiently costed.
          </ListItem>
          <ListItem>
            <strong>Snipers</strong>: Cards that deal damage through abilities, while having weak
            basic stats.
          </ListItem>
        </UnorderedList>
        <Text>
          Spawners lose to brutes. Brutes lose to snipers. Snipers lose to spawners.
        </Text>
      </Slide>

      {/* Slide 34: All Cards are Valid */}
      <Slide backgroundColor="tertiary">
        <Heading fontSize="h2">All Cards are Valid</Heading>
        <UnorderedList>
          <ListItem>
            The game intentionally does not limit the creativity of users designing cards, besides
            the encoded size and encoding depth.
          </ListItem>
          <ListItem>
            Cards can be submitted that lead to infinite complexity, but the engine will limit it —
            and players triggering those limits will forfeit the round.
          </ListItem>
          <ListItem>
            Cards which are super powerful or super weak can be fun in sets which are super powerful
            or super weak too.
          </ListItem>
        </UnorderedList>
      </Slide>

      {/* Slide 35: Engine Development */}
      <Slide backgroundColor="tertiary">
        <Heading fontSize="h2">Engine Development</Heading>
        <Text>At some point, we might see the community design and implement:</Text>
        <UnorderedList>
          <ListItem>New abilities.</ListItem>
          <ListItem>New game modes.</ListItem>
          <ListItem>New game rules.</ListItem>
        </UnorderedList>
        <Text>
          This will now allow governance to take the game even beyond what we can imagine here.
        </Text>
      </Slide>

      {/* Slide 36: Section - Adoption */}
      <Slide backgroundColor="tertiary">
        <Heading>Adoption of the Game</Heading>
      </Slide>

      {/* Slide 37: Gradual Onboarding */}
      <Slide backgroundColor="tertiary">
        <Heading fontSize="h2">Gradual Onboarding</Heading>
        <CodePane language="text">{`Free Player ──► Creates Wallet ──► Enters Tournament
     │                                    │
     │         Zero friction              │
     └────────────────────────────────────┘`}</CodePane>
        <Text>Players can engage at their comfort level.</Text>
      </Slide>

      {/* Slide 38: Free to Play */}
      <Slide backgroundColor="tertiary">
        <Heading fontSize="h2">Free to Play</Heading>
        <Text>The blockchain is truly a public database that can power the game.</Text>
        <FlexBox>
          <Box flex={1}>
            <UnorderedList fontSize="20px">
              <ListItem>
                <strong>Local Mode</strong>
              </ListItem>
              <ListItem>Full game experience.</ListItem>
              <ListItem>No wallet needed.</ListItem>
              <ListItem>No transactions required.</ListItem>
            </UnorderedList>
          </Box>
          <Box flex={1}>
            <UnorderedList fontSize="20px">
              <ListItem>
                <strong>Versus Mode</strong>
              </ListItem>
              <ListItem>Play against friends.</ListItem>
              <ListItem>Peer-to-peer connections.</ListItem>
              <ListItem>Still completely free.</ListItem>
            </UnorderedList>
          </Box>
        </FlexBox>
        <Text fontSize="20px">Even without transactions, users benefit from the blockchain:</Text>
        <UnorderedList fontSize="18px">
          <ListItem>
            <strong>Card and Sets</strong>: Access community-created content.
          </ListItem>
          <ListItem>
            <strong>Ghost Opponents</strong>: Play against real player boards.
          </ListItem>
        </UnorderedList>
      </Slide>

      {/* Slide 39: Treasury Subsidies */}
      <Slide backgroundColor="tertiary">
        <Heading fontSize="h2">Treasury Subsidies</Heading>
        <Text>The treasury (or other incentivized entity) can bootstrap the game.</Text>
        <Heading fontSize="h3">Tournaments</Heading>
        <Text fontSize="20px">
          To bootstrap initial tournaments, treasury can provide minimum prize support, ensuring
          players and creators are rewarded early.
        </Text>
        <Heading fontSize="h3">Achievements</Heading>
        <Text fontSize="20px">
          Players can be incentivized to early adopt the game via rewards (limited play-to-earn):
        </Text>
        <UnorderedList fontSize="18px">
          <ListItem>Leaderboards</ListItem>
          <ListItem>Card usage goals</ListItem>
          <ListItem>Set usage goals</ListItem>
          <ListItem>Win streaks</ListItem>
        </UnorderedList>
      </Slide>

      {/* Slide 40: Section - Future Growth */}
      <Slide backgroundColor="tertiary">
        <Heading>Future Growth</Heading>
      </Slide>

      {/* Slide 41: Expanding the System */}
      <Slide backgroundColor="tertiary">
        <Heading fontSize="h2">Expanding the System</Heading>
        <Text>
          <strong>More Abilities</strong>
        </Text>
        <UnorderedList>
          <ListItem>New triggers, conditions, effects.</ListItem>
          <ListItem>More complex interactions.</ListItem>
          <ListItem>Deeper strategic possibilities.</ListItem>
        </UnorderedList>
        <Text>For example:</Text>
        <UnorderedList>
          <ListItem>Shop effects.</ListItem>
          <ListItem>Long term battle effects.</ListItem>
          <ListItem>Long term modifications (stats, abilities, etc...)</ListItem>
        </UnorderedList>
      </Slide>

      {/* Slide 42: NFT Integration */}
      <Slide backgroundColor="tertiary">
        <Heading fontSize="h2">NFT Integration</Heading>
        <Text>NFTs can enhance the experience:</Text>
        <UnorderedList>
          <ListItem>
            <strong>Card Art</strong>: Custom images for cards.
          </ListItem>
          <ListItem>
            <strong>Themes</strong>: Player backgrounds and UI skins. Could introduce modifiers to
            the battle board.
          </ListItem>
          <ListItem>
            <strong>Trophies</strong>: Tournament wins and achievements.
          </ListItem>
          <ListItem>
            <strong>Cosmetics</strong>: Board effects, animations.
          </ListItem>
        </UnorderedList>
      </Slide>

      {/* Slide 43: ZK-Powered Verification */}
      <Slide backgroundColor="tertiary">
        <Heading fontSize="h2">ZK-Powered Verification</Heading>
        <Text>
          <strong>Current approach</strong>: Re-execute battles on-chain when disputed
        </Text>
        <Text>
          <strong>Future approach</strong>: Zero-knowledge proof verification
        </Text>
        <CodePane language="text">{`┌─────────────────┐     ┌─────────────┐     ┌────────────┐
│  Battle Engine  │ ──► │   ZK VM     │ ──► │   Proof    │
│     (Rust)      │     │   (SP1)     │     │            │
└─────────────────┘     └─────────────┘     └─────┬──────┘
                                                  │
                                            ┌─────▼──────┐
                                            │ On-chain   │
                                            │ Verifier   │
                                            └────────────┘`}</CodePane>
        <Text fontSize="20px">
          Proof verification is O(1) regardless of battle complexity.
        </Text>
      </Slide>

      {/* Slide 44: The Vision */}
      <Slide backgroundColor="tertiary">
        <Heading fontSize="h2">The Vision</Heading>
        <Text>A game that is:</Text>
        <UnorderedList>
          <ListItem>
            <strong>Built</strong> by its community
          </ListItem>
          <ListItem>
            <strong>Owned</strong> by its players
          </ListItem>
          <ListItem>
            <strong>Sustained</strong> by its economy
          </ListItem>
        </UnorderedList>
        <Text>
          Not just playing a game — <strong>building</strong> one together.
        </Text>
      </Slide>

      {/* Slide 45: Questions */}
      <Slide backgroundColor="tertiary">
        <Heading>Questions?</Heading>
      </Slide>
    </Deck>
  );
}
