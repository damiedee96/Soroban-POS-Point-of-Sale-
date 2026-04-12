#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Symbol, symbol_short};

#[contracttype]
#[derive(Clone)]
pub struct Payment {
    pub reference: String,
    pub payer: Address,
    pub amount: i128,
    pub timestamp: u64,
    pub status: Symbol,
}

#[contract]
pub struct POSPaymentContract;

#[contractimpl]
impl POSPaymentContract {
    /// Record a payment on-chain. Called by the POS backend after a successful transaction.
    pub fn record_payment(
        env: Env,
        reference: String,
        payer: Address,
        amount: i128,
    ) -> Symbol {
        payer.require_auth();

        let payment = Payment {
            reference: reference.clone(),
            payer,
            amount,
            timestamp: env.ledger().timestamp(),
            status: symbol_short!("PAID"),
        };

        env.storage().persistent().set(&reference, &payment);
        symbol_short!("PAID")
    }

    /// Retrieve a payment record by reference.
    pub fn get_payment(env: Env, reference: String) -> Option<Payment> {
        env.storage().persistent().get(&reference)
    }

    /// Refund — marks a payment as refunded (does not move funds; handled off-chain).
    pub fn mark_refunded(env: Env, reference: String, admin: Address) -> Symbol {
        admin.require_auth();
        let mut payment: Payment = env
            .storage()
            .persistent()
            .get(&reference)
            .expect("Payment not found");
        payment.status = symbol_short!("REFUNDED");
        env.storage().persistent().set(&reference, &payment);
        symbol_short!("REFUNDED")
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env, String};

    #[test]
    fn test_record_and_get() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, POSPaymentContract);
        let client = POSPaymentContractClient::new(&env, &contract_id);

        let payer = Address::generate(&env);
        let reference = String::from_str(&env, "REF-001");

        let status = client.record_payment(&reference, &payer, &5000);
        assert_eq!(status, symbol_short!("PAID"));

        let payment = client.get_payment(&reference).unwrap();
        assert_eq!(payment.amount, 5000);
    }
}
