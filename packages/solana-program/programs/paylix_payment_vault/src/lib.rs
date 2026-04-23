// SPDX-License-Identifier: AGPL-3.0
//
// Paylix PaymentVault — Solana edition.
//
// Status: skeleton. Tracked in issue #57. The instruction signatures,
// account layouts, and PDA seeds below are the stable contract between
// the program and the off-chain SDK / indexer. The actual logic for
// intent-binding, fee split, and token transfers is deferred to the
// first implementation PR referenced in the spec at
// docs/superpowers/specs/2026-04-23-solana-integration.md.

use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{Mint, TokenAccount, TokenInterface},
};

declare_id!("PLXPayVau1t1111111111111111111111111111111");

#[program]
pub mod paylix_payment_vault {
    use super::*;

    /// Initialize the global vault config PDA. Called once per deployment
    /// by the Paylix platform operator.
    pub fn initialize(
        _ctx: Context<Initialize>,
        _platform_fee_bps: u16,
    ) -> Result<()> {
        // Impl pending — #57.
        Ok(())
    }

    /// One-time payment: the buyer has pre-approved this program's PDA as a
    /// delegated authority for `amount` on their associated token account
    /// (the Solana equivalent of EIP-2612's permit). This instruction
    /// verifies the off-chain PaymentIntent (signed with ed25519 over the
    /// canonical Paylix layout), splits out the platform fee, and transfers
    /// the merchant share via SPL Token transfer_checked.
    pub fn create_payment(
        _ctx: Context<CreatePayment>,
        _amount: u64,
        _product_id: [u8; 32],
        _customer_id: [u8; 32],
        _intent_signature: [u8; 64],
        _deadline: i64,
    ) -> Result<()> {
        // Impl pending — #57.
        Ok(())
    }

    pub fn set_accepted_token(_ctx: Context<SetAcceptedToken>, _accepted: bool) -> Result<()> {
        Ok(())
    }

    pub fn pause(_ctx: Context<AdminConfig>) -> Result<()> {
        Ok(())
    }

    pub fn unpause(_ctx: Context<AdminConfig>) -> Result<()> {
        Ok(())
    }
}

// ── Accounts ───────────────────────────────────────────────────────

#[account]
pub struct VaultConfig {
    pub owner: Pubkey,
    pub platform_wallet: Pubkey,
    pub platform_fee_bps: u16,
    pub paused: bool,
    pub bump: u8,
}

#[account]
pub struct AcceptedToken {
    pub mint: Pubkey,
    pub accepted: bool,
    pub bump: u8,
}

#[account]
pub struct BuyerNonce {
    pub buyer: Pubkey,
    pub nonce: u64,
}

// ── Contexts ───────────────────────────────────────────────────────

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = payer, space = 8 + 32 + 32 + 2 + 1 + 1, seeds = [b"vault"], bump)]
    pub config: Account<'info, VaultConfig>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreatePayment<'info> {
    #[account(mut, seeds = [b"vault"], bump = config.bump)]
    pub config: Account<'info, VaultConfig>,
    pub mint: InterfaceAccount<'info, Mint>,
    #[account(mut)]
    pub buyer_ata: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)]
    pub merchant_ata: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)]
    pub platform_ata: InterfaceAccount<'info, TokenAccount>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SetAcceptedToken<'info> {
    #[account(has_one = owner)]
    pub config: Account<'info, VaultConfig>,
    pub owner: Signer<'info>,
    pub mint: InterfaceAccount<'info, Mint>,
}

#[derive(Accounts)]
pub struct AdminConfig<'info> {
    #[account(mut, has_one = owner)]
    pub config: Account<'info, VaultConfig>,
    pub owner: Signer<'info>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Payment intent expired")]
    IntentExpired,
    #[msg("Invalid intent signature")]
    InvalidIntent,
    #[msg("Token not accepted")]
    TokenNotAccepted,
    #[msg("Vault is paused")]
    Paused,
}
