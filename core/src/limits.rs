/// Battle limits to prevent infinite loops and stack overflows

pub const MAX_RECURSION_DEPTH: u32 = 50;
pub const MAX_SPAWNS_PER_BATTLE: u32 = 100;
pub const MAX_TRIGGERS_PER_PHASE: u32 = 200;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum Team {
    Player,
    Enemy,
}

impl Team {
    pub fn to_string(&self) -> String {
        match self {
            Team::Player => "PLAYER".to_string(),
            Team::Enemy => "ENEMY".to_string(),
        }
    }
}

/// Tracks execution limits to prevent infinite loops and stack overflows
#[derive(Debug, Clone)]
pub struct BattleLimits {
    pub recursion_depth: u32,
    pub total_spawns: u32,
    pub phase_triggers: u32,
    pub current_executing_team: Option<Team>,
    pub limit_exceeded_by: Option<Team>,
    pub limit_exceeded_reason: Option<String>,
}

impl BattleLimits {
    pub fn new() -> Self {
        Self {
            recursion_depth: 0,
            total_spawns: 0,
            phase_triggers: 0,
            current_executing_team: None,
            limit_exceeded_by: None,
            limit_exceeded_reason: None,
        }
    }

    pub fn reset_phase_counters(&mut self) {
        self.phase_triggers = 0;
    }

    pub fn is_exceeded(&self) -> bool {
        self.limit_exceeded_by.is_some()
    }

    pub fn enter_recursion(&mut self, team: Team) -> Result<(), ()> {
        self.current_executing_team = Some(team);
        self.recursion_depth += 1;
        if self.recursion_depth > MAX_RECURSION_DEPTH {
            self.limit_exceeded_by = Some(team);
            self.limit_exceeded_reason = Some(format!(
                "Recursion depth exceeded (max {})",
                MAX_RECURSION_DEPTH
            ));
            return Err(());
        }
        Ok(())
    }

    pub fn exit_recursion(&mut self) {
        if self.recursion_depth > 0 {
            self.recursion_depth -= 1;
        }
    }

    pub fn record_spawn(&mut self, team: Team) -> Result<(), ()> {
        self.current_executing_team = Some(team);
        self.total_spawns += 1;
        if self.total_spawns > MAX_SPAWNS_PER_BATTLE {
            self.limit_exceeded_by = Some(team);
            self.limit_exceeded_reason = Some(format!(
                "Spawn limit exceeded (max {})",
                MAX_SPAWNS_PER_BATTLE
            ));
            return Err(());
        }
        Ok(())
    }

    pub fn record_trigger(&mut self, team: Team) -> Result<(), ()> {
        self.current_executing_team = Some(team);
        self.phase_triggers += 1;
        if self.phase_triggers > MAX_TRIGGERS_PER_PHASE {
            self.limit_exceeded_by = Some(team);
            self.limit_exceeded_reason = Some(format!(
                "Trigger limit exceeded (max {} per phase)",
                MAX_TRIGGERS_PER_PHASE
            ));
            return Err(());
        }
        Ok(())
    }
}
