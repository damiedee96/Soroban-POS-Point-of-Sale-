const StellarSdk = require("stellar-sdk");

class StellarService {
  constructor() {
    const isTestnet = process.env.STELLAR_NETWORK !== "mainnet";
    this.server = new StellarSdk.Horizon.Server(
      isTestnet ? "https://horizon-testnet.stellar.org" : "https://horizon.stellar.org"
    );
    this.networkPassphrase = isTestnet
      ? StellarSdk.Networks.TESTNET
      : StellarSdk.Networks.PUBLIC;
    this.sourceKeypair = StellarSdk.Keypair.fromSecret(process.env.STELLAR_SECRET_KEY);
  }

  async sendPayment({ destinationAddress, amount, asset = "XLM", memo }) {
    const sourceAccount = await this.server.loadAccount(this.sourceKeypair.publicKey());

    const stellarAsset = asset === "XLM"
      ? StellarSdk.Asset.native()
      : new StellarSdk.Asset(asset, process.env.STELLAR_ISSUER);

    let builder = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: await this.server.fetchBaseFee(),
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(StellarSdk.Operation.payment({
        destination: destinationAddress,
        asset: stellarAsset,
        amount: String(amount),
      }))
      .setTimeout(30);

    if (memo) builder = builder.addMemo(StellarSdk.Memo.text(memo));

    const tx = builder.build();
    tx.sign(this.sourceKeypair);

    const result = await this.server.submitTransaction(tx);
    return { hash: result.hash, ledger: result.ledger };
  }
}

module.exports = { StellarService };
