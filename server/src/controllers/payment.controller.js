const { StellarService } = require("../services/stellar.service");

/**
 * Initialize a payment via Paystack / Flutterwave.
 * Actual gateway calls are stubbed — replace with real SDK calls.
 */
async function initialize(req, res, next) {
  try {
    const { gateway, amount, email, reference } = req.body;
    // TODO: integrate Paystack / Flutterwave SDK
    res.json({ gateway, amount, email, reference, status: "initialized", authorizationUrl: null });
  } catch (err) { next(err); }
}

async function verify(req, res, next) {
  try {
    const { gateway, reference } = req.body;
    // TODO: verify with gateway SDK
    res.json({ gateway, reference, status: "success" });
  } catch (err) { next(err); }
}

async function blockchainPay(req, res, next) {
  try {
    const { destinationAddress, amount, asset = "XLM", memo } = req.body;
    const stellar = new StellarService();
    const result = await stellar.sendPayment({ destinationAddress, amount, asset, memo });
    res.json(result);
  } catch (err) { next(err); }
}

module.exports = { initialize, verify, blockchainPay };
