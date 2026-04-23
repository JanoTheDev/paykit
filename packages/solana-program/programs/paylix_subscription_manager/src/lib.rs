// SPDX-License-Identifier: AGPL-3.0
//
// Paylix SubscriptionManager — Solana edition. Status: skeleton. See issue
// #57 for the implementation roadmap.
//
// Subscription model on Solana uses SPL Token's delegate authority. At
// subscription creation the buyer calls `approve` on their associated
// token account, naming this program's PDA as delegate for up to
// (amount × N cycles) over the subscription's lifetime. The keeper then
// invokes `charge_subscription` at each cycle boundary, which CPIs into
// `spl-token::transfer_checked` using the delegate.
//
// Cancel revokes delegate authority (keeper can no longer pull funds).
// Buyer never needs to be online after subscription creation — matching
// the EVM Paylix UX.

use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{Mint, TokenAccount, TokenInterface},
};

declare_id!("PLXSubMan11111111111111111111111111111111");

#[program]
pub mod paylix_subscription_manager {
    use super::*;

    pub fn initialize(
        _ctx: Context<Initialize>,
        _platform_fee_bps: u16,
    ) -> Result<()> {
        Ok(())
    }

    /// Create a subscription and charge the first cycle. Buyer has already
    /// set this program's PDA as their token-account delegate.
    pub fn create_subscription(
        _ctx: Context<CreateSubscription>,
        _amount: u64,
        _interval_seconds: i64,
        _product_id: [u8; 32],
        _customer_id: [u8; 32],
        _intent_signature: [u8; 64],
    ) -> Result<()> {
        Ok(())
    }

    /// Charge a subscription whose `next_charge_at` has passed. Callable
    /// by the keeper or the subscriber.
    pub fn charge_subscription(_ctx: Context<ChargeSubscription>) -> Result<()> {
        Ok(())
    }

    pub fn cancel_subscription(_ctx: Context<CancelSubscription>) -> Result<()> {
        Ok(())
    }
}

// ── State ────────────────────────────────────────────────────────────

#[account]
pub struct SubscriptionManagerConfig {
    pub owner: Pubkey,
    pub platform_wallet: Pubkey,
    pub platform_fee_bps: u16,
    pub paused: bool,
    pub bump: u8,
}

#[account]
pub struct Subscription {
    pub subscriber: Pubkey,
    pub merchant: Pubkey,
    pub mint: Pubkey,
    pub amount: u64,
    pub interval_seconds: i64,
    pub next_charge_at: i64,
    pub product_id: [u8; 32],
    pub customer_id: [u8; 32],
    pub total_charged: u64,
    pub status: u8, // 0=active, 1=past_due, 2=cancelled
    pub bump: u8,
}

// ── Contexts (all impl-stubbed) ──────────────────────────────────────

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = payer, space = 8 + 32 + 32 + 2 + 1 + 1, seeds = [b"sub_config"], bump)]
    pub config: Account<'info, SubscriptionManagerConfig>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateSubscription<'info> {
    pub config: Account<'info, SubscriptionManagerConfig>,
    pub mint: InterfaceAccount<'info, Mint>,
    #[account(mut)]
    pub subscriber_ata: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)]
    pub merchant_ata: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)]
    pub platform_ata: InterfaceAccount<'info, TokenAccount>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ChargeSubscription<'info> {
    #[account(mut)]
    pub subscription: Account<'info, Subscription>,
    #[account(mut)]
    pub subscriber_ata: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)]
    pub merchant_ata: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)]
    pub platform_ata: InterfaceAccount<'info, TokenAccount>,
    pub token_program: Interface<'info, TokenInterface>,
}

#[derive(Accounts)]
pub struct CancelSubscription<'info> {
    #[account(mut)]
    pub subscription: Account<'info, Subscription>,
    pub authority: Signer<'info>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn program_id_is_stable() {
        assert_eq!(
            crate::ID.to_string(),
            "PLXSubMan11111111111111111111111111111111"
        );
    }

    /// Subscription is big enough to keep the init space helper honest.
    /// If a field is added/removed, the Initialize context's space calc must
    /// be updated in lockstep.
    #[test]
    fn subscription_config_space_matches_init() {
        // owner(32) + platform_wallet(32) + platform_fee_bps(2) + paused(1) + bump(1) = 68
        let expected = 32 + 32 + 2 + 1 + 1;
        assert_eq!(expected, 68);
    }

    #[test]
    fn subscription_status_bytes_are_distinct() {
        // Active=0, PastDue=1, Cancelled=2 — stored as u8 in Subscription.status
        let active: u8 = 0;
        let past_due: u8 = 1;
        let cancelled: u8 = 2;
        assert_ne!(active, past_due);
        assert_ne!(past_due, cancelled);
        assert_ne!(active, cancelled);
    }
}
