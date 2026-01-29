//! Logging utilities
//!
//! Provides implementations using the `log` crate, which can be hooked into
//! by the environment (e.g., browser console, terminal, blockchain node).

#![allow(unused)]

/// Log an info message
#[inline(always)]
pub fn info(msg: &str) {
    log::info!("{}", msg);
}

/// Log a warning message
#[inline(always)]
pub fn warn(msg: &str) {
    log::warn!("{}", msg);
}

/// Log an error message
#[inline(always)]
pub fn error(msg: &str) {
    log::error!("{}", msg);
}

/// Log a debug message with a label
#[inline(always)]
pub fn debug(label: &str, msg: &str) {
    log::debug!("[{}] {}", label, msg);
}

/// Log game state summary
#[inline(always)]
pub fn state_summary(
    phase: &str,
    round: i32,
    mana: i32,
    mana_limit: i32,
    lives: i32,
    wins: i32,
    bag_count: usize,
    board_count: usize,
) {
    log::info!(
        "STATE [{}]: Round {}, Mana {}/{}, Lives {}, Wins {}, Bag {}, Board {}",
        phase, round, mana, mana_limit, lives, wins, bag_count, board_count
    );
}

/// Log an action being performed
#[inline(always)]
pub fn action(name: &str, details: &str) {
    log::info!("ACTION [{}]: {}", name, details);
}

/// Log action result
#[inline(always)]
pub fn result(success: bool, msg: &str) {
    if success {
        log::info!("RESULT [SUCCESS]: {}", msg);
    } else {
        log::warn!("RESULT [FAILURE]: {}", msg);
    }
}