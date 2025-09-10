use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod game_pool {
    use super::*;

    pub fn initialize_game_pool(
        ctx: Context<InitializeGamePool>,
        entry_fee: u64,
        max_players: u8,
    ) -> Result<()> {
        let game_pool = &mut ctx.accounts.game_pool;
        game_pool.authority = ctx.accounts.authority.key();
        game_pool.entry_fee = entry_fee;
        game_pool.max_players = max_players;
        game_pool.current_players = 0;
        game_pool.total_pool = 0;
        game_pool.house_fee_percentage = 20; // 20%
        game_pool.status = GameStatus::Waiting;
        Ok(())
    }

    pub fn join_game(ctx: Context<JoinGame>) -> Result<()> {
        let game_pool = &mut ctx.accounts.game_pool;
        let player = &mut ctx.accounts.player;

        require!(
            game_pool.current_players < game_pool.max_players,
            GameError::GameFull
        );
        require!(
            game_pool.status == GameStatus::Waiting,
            GameError::GameNotWaiting
        );

        // Transfer SOL from player to game pool
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.player.to_account_info(),
                to: ctx.accounts.game_pool.to_account_info(),
            },
        );
        anchor_lang::system_program::transfer(cpi_context, game_pool.entry_fee)?;

        game_pool.current_players += 1;
        game_pool.total_pool += game_pool.entry_fee;

        player.game_pool = game_pool.key();
        player.wallet_address = ctx.accounts.payer.key();
        player.entry_time = Clock::get()?.unix_timestamp;

        Ok(())
    }

    pub fn start_game(ctx: Context<StartGame>) -> Result<()> {
        let game_pool = &mut ctx.accounts.game_pool;
        
        require!(
            ctx.accounts.authority.key() == game_pool.authority,
            GameError::Unauthorized
        );
        require!(
            game_pool.status == GameStatus::Waiting,
            GameError::InvalidGameStatus
        );

        game_pool.status = GameStatus::Active;
        game_pool.start_time = Clock::get()?.unix_timestamp;

        Ok(())
    }

    pub fn end_game_and_distribute(
        ctx: Context<EndGameAndDistribute>,
        winners: Vec<Pubkey>,
    ) -> Result<()> {
        let game_pool = &mut ctx.accounts.game_pool;
        
        require!(
            ctx.accounts.authority.key() == game_pool.authority,
            GameError::Unauthorized
        );
        require!(
            game_pool.status == GameStatus::Active,
            GameError::InvalidGameStatus
        );

        let prize_pool = (game_pool.total_pool * (100 - game_pool.house_fee_percentage)) / 100;
        let house_fee = game_pool.total_pool - prize_pool;

        // Prize distribution: 50%, 30%, 20%
        let prize_percentages = vec![50, 30, 20];
        
        for (i, winner) in winners.iter().enumerate() {
            if i < 3 {
                let prize_amount = (prize_pool * prize_percentages[i]) / 100;
                // Transfer prize to winner (implementation needed)
            }
        }

        // Transfer house fee to authority
        **ctx.accounts.authority.to_account_info().try_borrow_mut_lamports()? += house_fee;
        **game_pool.to_account_info().try_borrow_mut_lamports()? -= house_fee;

        game_pool.status = GameStatus::Finished;
        game_pool.end_time = Clock::get()?.unix_timestamp;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeGamePool<'info> {
    #[account(
        init,
        payer = authority,
        space = GamePoolAccount::LEN
    )]
    pub game_pool: Account<'info, GamePoolAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct JoinGame<'info> {
    #[account(mut)]
    pub game_pool: Account<'info, GamePoolAccount>,
    #[account(
        init,
        payer = payer,
        space = PlayerAccount::LEN
    )]
    pub player: Account<'info, PlayerAccount>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct StartGame<'info> {
    #[account(mut)]
    pub game_pool: Account<'info, GamePoolAccount>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct EndGameAndDistribute<'info> {
    #[account(mut)]
    pub game_pool: Account<'info, GamePoolAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
}

#[account]
pub struct GamePoolAccount {
    pub authority: Pubkey,
    pub entry_fee: u64,
    pub max_players: u8,
    pub current_players: u8,
    pub total_pool: u64,
    pub house_fee_percentage: u8,
    pub status: GameStatus,
    pub start_time: i64,
    pub end_time: i64,
}

impl GamePoolAccount {
    pub const LEN: usize = 32 + 8 + 1 + 1 + 8 + 1 + 1 + 8 + 8;
}

#[account]
pub struct PlayerAccount {
    pub game_pool: Pubkey,
    pub wallet_address: Pubkey,
    pub entry_time: i64,
}

impl PlayerAccount {
    pub const LEN: usize = 32 + 32 + 8;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum GameStatus {
    Waiting,
    Active,
    Finished,
}

#[error_code]
pub enum GameError {
    #[msg("Game is full")]
    GameFull,
    #[msg("Game is not in waiting status")]
    GameNotWaiting,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Invalid game status")]
    InvalidGameStatus,
}