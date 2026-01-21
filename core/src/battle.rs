use crate::types::*;
use serde::{Deserialize, Serialize};

/// Which side a unit belongs to
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub enum Side {
    Player,
    Enemy,
}

/// Target reference for combat events
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CombatTarget {
    pub side: Side,
    pub index: usize,
    pub name: String,
}

/// Events generated during combat for UI playback
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum CombatEvent {
    BattleStart {
        #[serde(rename = "playerUnits")]
        player_units: Vec<CombatUnitInfo>,
        #[serde(rename = "enemyUnits")]
        enemy_units: Vec<CombatUnitInfo>,
    },
    UnitsClash {
        player: CombatTarget,
        enemy: CombatTarget,
    },
    DamageDealt {
        target: CombatTarget,
        amount: i32,
        #[serde(rename = "newHealth")]
        new_health: i32,
    },
    UnitDied {
        target: CombatTarget,
    },
    UnitsSlide {
        side: Side,
    },
    BattleEnd {
        result: String,
    },
}

/// The result of a battle
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum BattleResult {
    Victory { remaining: usize },
    Defeat { remaining: usize },
    Draw,
}

/// A combat unit (simplified for battle simulation)
#[derive(Debug, Clone)]
pub struct CombatUnit {
    pub name: String,
    pub attack: i32,
    pub health: i32,
    pub max_health: i32,
}

impl CombatUnit {
    pub fn from_board_unit(unit: &BoardUnit) -> Self {
        Self {
            name: unit.card.name.clone(),
            attack: unit.card.stats.attack,
            health: unit.current_health,
            max_health: unit.card.stats.health,
        }
    }

    pub fn is_alive(&self) -> bool {
        self.health > 0
    }

    pub fn take_damage(&mut self, amount: i32) {
        self.health -= amount;
    }
}

/// The battle simulator
pub struct BattleSimulator {
    player_units: Vec<CombatUnit>,
    enemy_units: Vec<CombatUnit>,
    events: Vec<CombatEvent>,
}

impl BattleSimulator {
    pub fn new(player_units: Vec<CombatUnit>, enemy_units: Vec<CombatUnit>) -> Self {
        Self {
            player_units,
            enemy_units,
            events: Vec::new(),
        }
    }

    /// Run the full battle simulation
    pub fn simulate(mut self) -> (BattleResult, Vec<CombatEvent>, Vec<CombatUnit>) {
        // Record battle start
        self.events.push(CombatEvent::BattleStart {
            player_units: self.player_units.iter().map(|u| CombatUnitInfo {
                name: u.name.clone(),
                attack: u.attack,
                health: u.health,
                max_health: u.max_health,
            }).collect(),
            enemy_units: self.enemy_units.iter().map(|u| CombatUnitInfo {
                name: u.name.clone(),
                attack: u.attack,
                health: u.health,
                max_health: u.max_health,
            }).collect(),
        });

        // Main combat loop - continue until all units on one side are dead
        loop {
            self.resolve_clash();
            self.check_dead_units();

            // Check if battle should end (all units on one side are dead)
            let player_alive_count = self.player_units.iter().filter(|u| u.is_alive()).count();
            let enemy_alive_count = self.enemy_units.iter().filter(|u| u.is_alive()).count();

            if player_alive_count == 0 || enemy_alive_count == 0 {
                break;
            }
        }

        // Determine result
        let player_alive_count = self.player_units.iter().filter(|u| u.is_alive()).count();
        let enemy_alive_count = self.enemy_units.iter().filter(|u| u.is_alive()).count();

        let result = if player_alive_count > 0 && enemy_alive_count == 0 {
            BattleResult::Victory {
                remaining: player_alive_count,
            }
        } else if player_alive_count == 0 && enemy_alive_count > 0 {
            BattleResult::Defeat {
                remaining: enemy_alive_count,
            }
        } else {
            BattleResult::Draw
        };

        self.events.push(CombatEvent::BattleEnd {
            result: match &result {
                BattleResult::Victory { .. } => "victory".to_string(),
                BattleResult::Defeat { .. } => "defeat".to_string(),
                BattleResult::Draw => "draw".to_string(),
            },
        });

        (result, self.events, self.player_units)
    }

    /// Resolve clashes between all corresponding positions simultaneously
    fn resolve_clash(&mut self) {
        let max_positions = self.player_units.len().max(self.enemy_units.len());

        // Record simultaneous clashes for all positions
        for position in 0..max_positions {
            if let (Some(player_unit), Some(enemy_unit)) = (
                self.player_units.get(position),
                self.enemy_units.get(position)
            ) {
                self.events.push(CombatEvent::UnitsClash {
                    player: CombatTarget {
                        side: Side::Player,
                        index: position,
                        name: player_unit.name.clone(),
                    },
                    enemy: CombatTarget {
                        side: Side::Enemy,
                        index: position,
                        name: enemy_unit.name.clone(),
                    },
                });
            }
        }

        // Apply damage for all positions
        for position in 0..max_positions {
            // Player attacks enemy
            if let (Some(player_unit), Some(enemy_unit)) = (
                self.player_units.get(position),
                self.enemy_units.get_mut(position)
            ) {
                let damage = player_unit.attack;
                enemy_unit.take_damage(damage);
                self.events.push(CombatEvent::DamageDealt {
                    target: CombatTarget {
                        side: Side::Enemy,
                        index: position,
                        name: enemy_unit.name.clone(),
                    },
                    amount: damage,
                    new_health: enemy_unit.health,
                });
            }

            // Enemy attacks player
            if let (Some(enemy_unit), Some(player_unit)) = (
                self.enemy_units.get(position),
                self.player_units.get_mut(position)
            ) {
                let damage = enemy_unit.attack;
                player_unit.take_damage(damage);
                self.events.push(CombatEvent::DamageDealt {
                    target: CombatTarget {
                        side: Side::Player,
                        index: position,
                        name: player_unit.name.clone(),
                    },
                    amount: damage,
                    new_health: player_unit.health,
                });
            }
        }
    }

    /// Check for dead units at all positions - keep them on board with 0 health
    fn check_dead_units(&mut self) {
        // Check all player units for deaths
        for (index, unit) in self.player_units.iter().enumerate() {
            if !unit.is_alive() {
                self.events.push(CombatEvent::UnitDied {
                    target: CombatTarget {
                        side: Side::Player,
                        index,
                        name: unit.name.clone(),
                    },
                });
                // Don't remove the unit - keep it on board with 0 health
            }
        }

        // Check all enemy units for deaths
        for (index, unit) in self.enemy_units.iter().enumerate() {
            if !unit.is_alive() {
                self.events.push(CombatEvent::UnitDied {
                    target: CombatTarget {
                        side: Side::Enemy,
                        index,
                        name: unit.name.clone(),
                    },
                });
                // Don't remove the unit
            }
        }
    }
}
