use bounded_collections::{BoundedVec, Get};
use parity_scale_codec::{Decode, DecodeWithMemTracking, Encode};
use scale_info::TypeInfo;
use crate::{GameState, UnitCard, BoardUnit, GamePhase, CommitTurnAction};
use core::fmt::Debug;

/// A bounded version of GameState for on-chain storage.
/// Uses BoundedVec to limit the number of items.
///
/// `MaxBagSize`: Logic limit for the bag size.
/// `MaxBoardSize`: Logic limit for the board size.
#[derive(Encode, Decode, DecodeWithMemTracking, TypeInfo, Debug, Clone, PartialEq, Eq)]
#[scale_info(skip_type_params(MaxBagSize, MaxBoardSize))]
pub struct BoundedGameState<MaxBagSize, MaxBoardSize>
where
    MaxBagSize: Get<u32>,
    MaxBoardSize: Get<u32>,
{
    pub bag: BoundedVec<UnitCard, MaxBagSize>,
    pub board: BoundedVec<Option<BoardUnit>, MaxBoardSize>,
    pub mana_limit: i32,
    pub round: i32,
    pub lives: i32,
    pub wins: i32,
    pub phase: GamePhase,
    pub next_card_id: u32,
    pub game_seed: u64,
}

impl<MaxBagSize, MaxBoardSize> From<GameState> for BoundedGameState<MaxBagSize, MaxBoardSize>
where
    MaxBagSize: Get<u32>,
    MaxBoardSize: Get<u32>,
{
    fn from(state: GameState) -> Self {
        let bag = BoundedVec::truncate_from(state.bag);
        let board = BoundedVec::truncate_from(state.board);

        Self {
            bag,
            board,
            mana_limit: state.mana_limit,
            round: state.round,
            lives: state.lives,
            wins: state.wins,
            phase: state.phase,
            next_card_id: state.next_card_id,
            game_seed: state.game_seed,
        }
    }
}

impl<MaxBagSize, MaxBoardSize> From<BoundedGameState<MaxBagSize, MaxBoardSize>> for GameState
where
    MaxBagSize: Get<u32>,
    MaxBoardSize: Get<u32>,
{
    fn from(bounded: BoundedGameState<MaxBagSize, MaxBoardSize>) -> Self {
        GameState {
            bag: bounded.bag.into_inner(),
            board: bounded.board.into_inner(),
            mana_limit: bounded.mana_limit,
            round: bounded.round,
            lives: bounded.lives,
            wins: bounded.wins,
            phase: bounded.phase,
            next_card_id: bounded.next_card_id,
            game_seed: bounded.game_seed,
        }
    }
}

/// A bounded version of CommitTurnAction for on-chain submission.
///
/// `MaxBoardSize`: Max units on board.
/// `MaxHandActions`: Max cards that can be played/pitched from hand in one turn.
#[derive(Encode, Decode, DecodeWithMemTracking, TypeInfo, Clone, PartialEq, Eq)]
#[scale_info(skip_type_params(MaxBoardSize, MaxHandActions))]
pub struct BoundedCommitTurnAction<MaxBoardSize, MaxHandActions>
where
    MaxBoardSize: Get<u32>,
    MaxHandActions: Get<u32>,
{
    /// Final board state after the turn
    pub new_board: BoundedVec<Option<BoardUnit>, MaxBoardSize>,
    /// Hand indices pitched for mana
    pub pitched_from_hand: BoundedVec<u32, MaxHandActions>,
    /// Hand indices played to board
    pub played_from_hand: BoundedVec<u32, MaxHandActions>,
    /// Board slots removed for mana
    pub pitched_from_board: BoundedVec<u32, MaxBoardSize>,
}

impl<MaxBoardSize, MaxHandActions> From<CommitTurnAction>
    for BoundedCommitTurnAction<MaxBoardSize, MaxHandActions>
where
    MaxBoardSize: Get<u32>,
    MaxHandActions: Get<u32>,
{
    fn from(action: CommitTurnAction) -> Self {
        Self {
            new_board: BoundedVec::truncate_from(action.new_board),
            pitched_from_hand: BoundedVec::truncate_from(action.pitched_from_hand),
            played_from_hand: BoundedVec::truncate_from(action.played_from_hand),
            pitched_from_board: BoundedVec::truncate_from(action.pitched_from_board),
        }
    }
}

impl<MaxBoardSize, MaxHandActions> From<BoundedCommitTurnAction<MaxBoardSize, MaxHandActions>>
    for CommitTurnAction
where
    MaxBoardSize: Get<u32>,
    MaxHandActions: Get<u32>,
{
    fn from(bounded: BoundedCommitTurnAction<MaxBoardSize, MaxHandActions>) -> Self {
        Self {
            new_board: bounded.new_board.into_inner(),
            pitched_from_hand: bounded.pitched_from_hand.into_inner(),
            played_from_hand: bounded.played_from_hand.into_inner(),
            pitched_from_board: bounded.pitched_from_board.into_inner(),
        }
    }
}
