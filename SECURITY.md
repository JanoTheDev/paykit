# Security Policy

## Reporting a Vulnerability

Paylix handles financial transactions on-chain. We take security seriously.

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, email **security@paylix.dev** with:

- A description of the vulnerability
- Steps to reproduce
- The potential impact
- Any suggested fix (optional)

You should receive an acknowledgment within 48 hours. We will work with you to understand the issue and coordinate a fix before any public disclosure.

## Scope

The following are in scope for security reports:

- **Smart contracts** (`packages/contracts/src/`) — reentrancy, access control, fund redirection, integer overflow, permit/intent bypass
- **Relayer and gasless flows** — intent signature forgery, replay attacks, nonce manipulation
- **API and authentication** — API key leakage, authorization bypass, webhook signature spoofing
- **SDK** — signature construction bugs that could lead to incorrect on-chain behavior
- **Infrastructure** — secrets exposure, insecure defaults in Docker/env configuration

## Out of Scope

- Vulnerabilities in third-party dependencies (report these upstream)
- Issues in the Foundry/OpenZeppelin libraries under `packages/contracts/lib/`
- Social engineering attacks
- Denial of service against public testnets

## Disclosure Policy

- We will acknowledge receipt within 48 hours
- We aim to confirm and triage within 5 business days
- We will coordinate with you on timing for public disclosure
- We credit reporters in release notes (unless you prefer to remain anonymous)

## Supported Versions

| Version | Supported |
|---------|-----------|
| Latest on `master` | Yes |
| Previous releases | Best effort |
