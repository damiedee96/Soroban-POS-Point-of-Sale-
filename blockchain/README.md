# Soroban Smart Contracts

## Prerequisites
- Rust + `wasm32-unknown-unknown` target
- Soroban CLI: `cargo install --locked soroban-cli`

## Build
```bash
cd blockchain
cargo build --target wasm32-unknown-unknown --release
```

## Test
```bash
cargo test
```

## Deploy to Testnet
```bash
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/pos_payment.wasm \
  --source <YOUR_SECRET_KEY> \
  --network testnet
```

## Contract: `pos_payment`
| Function | Description |
|---|---|
| `record_payment(reference, payer, amount)` | Records a sale on-chain |
| `get_payment(reference)` | Retrieves a payment record |
| `mark_refunded(reference, admin)` | Marks a payment as refunded |
