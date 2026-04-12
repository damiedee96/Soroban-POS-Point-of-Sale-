/**
 * Receipt Service
 * Generates plain-text and HTML receipts for a completed sale.
 */

function formatCurrency(amount) {
  return `₦${Number(amount).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

function generateTextReceipt(sale) {
  const line = "─".repeat(36);
  const items = sale.items
    .map((i) => {
      const name = (i.product?.name ?? i.name ?? "Item").padEnd(20).slice(0, 20);
      const qty = String(i.quantity).padStart(3);
      const price = formatCurrency(i.subtotal ?? i.unitPrice * i.quantity).padStart(12);
      return `${name} ${qty} ${price}`;
    })
    .join("\n");

  return `
        SOROBAN POS
        Point of Sale
${line}
Date   : ${new Date(sale.createdAt ?? Date.now()).toLocaleString()}
Ref    : ${sale.reference ?? "N/A"}
Cashier: ${sale.user?.name ?? "—"}
${sale.customer ? `Customer: ${sale.customer.name}` : ""}
${line}
${"ITEM".padEnd(20)} QTY         AMOUNT
${line}
${items}
${line}
${"Subtotal".padEnd(24)} ${formatCurrency(sale.total + (sale.discount ?? 0))}
${sale.discount ? `${"Discount".padEnd(24)} -${formatCurrency(sale.discount)}` : ""}
${"TOTAL".padEnd(24)} ${formatCurrency(sale.total)}
${"Paid".padEnd(24)} ${formatCurrency(sale.amountPaid)}
${"Change".padEnd(24)} ${formatCurrency(sale.change ?? 0)}
${line}
Payment: ${sale.paymentMethod}
${sale.blockchainTx ? `TX Hash: ${sale.blockchainTx}` : ""}
${line}
     Thank you for your business!
`.trim();
}

function generateHtmlReceipt(sale) {
  const rows = sale.items
    .map(
      (i) => `
      <tr>
        <td>${i.product?.name ?? i.name ?? "Item"}</td>
        <td style="text-align:center">${i.quantity}</td>
        <td style="text-align:right">${formatCurrency(i.subtotal ?? i.unitPrice * i.quantity)}</td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Receipt - ${sale.reference}</title>
  <style>
    body { font-family: monospace; max-width: 320px; margin: 0 auto; padding: 16px; font-size: 13px; }
    h2 { text-align: center; margin: 0; }
    p.sub { text-align: center; color: #666; margin: 2px 0 12px; }
    table { width: 100%; border-collapse: collapse; }
    th { border-bottom: 1px solid #ccc; padding: 4px 0; text-align: left; }
    td { padding: 3px 0; }
    .total-row td { border-top: 1px solid #ccc; font-weight: bold; padding-top: 6px; }
    .footer { text-align: center; margin-top: 16px; color: #888; font-size: 11px; }
  </style>
</head>
<body>
  <h2>SOROBAN POS</h2>
  <p class="sub">Point of Sale</p>
  <p>Date: ${new Date(sale.createdAt ?? Date.now()).toLocaleString()}</p>
  <p>Ref: ${sale.reference ?? "N/A"}</p>
  ${sale.customer ? `<p>Customer: ${sale.customer.name}</p>` : ""}
  <table>
    <thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Amount</th></tr></thead>
    <tbody>${rows}</tbody>
    <tfoot>
      <tr class="total-row">
        <td colspan="2">TOTAL</td>
        <td style="text-align:right">${formatCurrency(sale.total)}</td>
      </tr>
      <tr><td colspan="2">Paid</td><td style="text-align:right">${formatCurrency(sale.amountPaid)}</td></tr>
      <tr><td colspan="2">Change</td><td style="text-align:right">${formatCurrency(sale.change ?? 0)}</td></tr>
    </tfoot>
  </table>
  <p>Payment: ${sale.paymentMethod}</p>
  ${sale.blockchainTx ? `<p style="font-size:10px;word-break:break-all">TX: ${sale.blockchainTx}</p>` : ""}
  <p class="footer">Thank you for your business!</p>
</body>
</html>`;
}

module.exports = { generateTextReceipt, generateHtmlReceipt };
