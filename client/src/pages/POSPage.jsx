import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../lib/api";
import Modal from "../components/Modal";
import Badge from "../components/Badge";

function ReceiptModal({ sale, onClose }) {
  return (
    <Modal title="Receipt" onClose={onClose}>
      <div className="text-center space-y-1 mb-4">
        <p className="font-bold text-lg">Soroban POS</p>
        <p className="text-xs text-gray-400">{new Date().toLocaleString()}</p>
        <p className="text-xs text-gray-400">Ref: {sale.reference?.slice(0, 12)}</p>
      </div>
      <div className="divide-y text-sm">
        {sale.items?.map((item, i) => (
          <div key={i} className="flex justify-between py-1.5">
            <span>{item.name} × {item.quantity}</span>
            <span>₦{(item.price * item.quantity).toLocaleString()}</span>
          </div>
        ))}
      </div>
      <div className="border-t mt-3 pt-3 space-y-1 text-sm">
        <div className="flex justify-between font-bold text-base">
          <span>Total</span><span>₦{sale.total?.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>Paid</span><span>₦{sale.amountPaid?.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>Change</span><span>₦{sale.change?.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>Method</span><span>{sale.paymentMethod}</span>
        </div>
      </div>
      <button
        onClick={() => window.print()}
        className="mt-5 w-full border rounded-lg py-2 text-sm hover:bg-gray-50"
      >
        Print Receipt
      </button>
    </Modal>
  );
}

export default function POSPage() {
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [amountPaid, setAmountPaid] = useState("");
  const [discount, setDiscount] = useState(0);
  const [customerId, setCustomerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState(null);

  const { data: products = [] } = useQuery({
    queryKey: ["products", search],
    queryFn: () => api.get(`/products?search=${search}`).then((r) => r.data),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: () => api.get("/customers").then((r) => r.data),
  });

  function addToCart(product) {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) return prev.map((i) => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
  }

  function updateQty(productId, qty) {
    if (qty < 1) return removeFromCart(productId);
    setCart((prev) => prev.map((i) => i.productId === productId ? { ...i, quantity: qty } : i));
  }

  function removeFromCart(productId) {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  }

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = Math.max(0, subtotal - Number(discount));
  const change = parseFloat(amountPaid || 0) - total;

  async function checkout() {
    if (!cart.length) return toast.error("Cart is empty");
    if (paymentMethod === "CASH" && parseFloat(amountPaid) < total) return toast.error("Insufficient amount paid");
    setLoading(true);
    try {
      const { data } = await api.post("/sales", {
        items: cart.map(({ productId, quantity }) => ({ productId, quantity })),
        paymentMethod,
        amountPaid: parseFloat(amountPaid) || total,
        discount: Number(discount),
        ...(customerId && { customerId }),
      });
      toast.success("Sale completed!");
      setReceipt({
        ...data,
        items: cart,
        total,
        amountPaid: parseFloat(amountPaid) || total,
        change: Math.max(0, change),
      });
      setCart([]);
      setAmountPaid("");
      setDiscount(0);
      setCustomerId("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Sale failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-6rem)]">
      {/* Product Grid */}
      <div className="flex-1 flex flex-col gap-3 overflow-hidden">
        <input
          className="border rounded-lg px-3 py-2 text-sm w-full"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 overflow-y-auto pr-1">
          {products.map((p) => {
            const stock = p.inventory?.[0]?.quantity ?? 0;
            return (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                disabled={stock === 0}
                className="bg-white rounded-xl shadow p-4 text-left hover:ring-2 hover:ring-primary transition disabled:opacity-40"
              >
                <p className="font-medium text-sm truncate">{p.name}</p>
                <p className="text-primary font-bold mt-1">₦{p.price.toLocaleString()}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-400">{p.sku}</p>
                  <Badge label={stock > 0 ? `${stock} left` : "Out"} color={stock > 5 ? "green" : stock > 0 ? "yellow" : "red"} />
                </div>
              </button>
            );
          })}
          {products.length === 0 && (
            <p className="col-span-4 text-center text-gray-400 py-12 text-sm">No products found</p>
          )}
        </div>
      </div>

      {/* Cart Panel */}
      <div className="w-80 bg-white rounded-xl shadow flex flex-col">
        <div className="px-4 py-3 border-b font-bold text-base">Cart ({cart.length})</div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {cart.length === 0 && <p className="text-gray-400 text-sm text-center mt-10">Add products to start a sale</p>}
          {cart.map((item) => (
            <div key={item.productId} className="flex items-center gap-2 text-sm">
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium">{item.name}</p>
                <p className="text-xs text-gray-400">₦{item.price.toLocaleString()} each</p>
              </div>
              <input
                type="number" min={1} value={item.quantity}
                onChange={(e) => updateQty(item.productId, parseInt(e.target.value))}
                className="w-12 border rounded px-1 py-0.5 text-center text-xs"
              />
              <span className="w-16 text-right text-xs font-medium">₦{(item.price * item.quantity).toLocaleString()}</span>
              <button onClick={() => removeFromCart(item.productId)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
            </div>
          ))}
        </div>

        <div className="border-t px-4 py-4 space-y-3">
          {/* Customer */}
          <select
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
          >
            <option value="">Walk-in Customer</option>
            {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          {/* Payment method */}
          <select
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="CASH">Cash</option>
            <option value="CARD">Card</option>
            <option value="MOBILE_MONEY">Mobile Money</option>
            <option value="CRYPTO">Crypto (Soroban)</option>
          </select>

          {/* Discount */}
          <input
            type="number" min={0} placeholder="Discount (₦)"
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
          />

          {/* Amount paid */}
          <input
            type="number" placeholder="Amount paid (₦)"
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={amountPaid}
            onChange={(e) => setAmountPaid(e.target.value)}
          />

          {/* Totals */}
          <div className="text-sm space-y-1">
            <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>₦{subtotal.toLocaleString()}</span></div>
            {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₦{Number(discount).toLocaleString()}</span></div>}
            <div className="flex justify-between font-bold text-base"><span>Total</span><span>₦{total.toLocaleString()}</span></div>
            {amountPaid && change >= 0 && <div className="flex justify-between text-gray-500"><span>Change</span><span>₦{change.toLocaleString()}</span></div>}
          </div>

          <button
            onClick={checkout} disabled={loading || cart.length === 0}
            className="w-full bg-primary text-white py-2.5 rounded-lg font-semibold hover:bg-primary-dark disabled:opacity-50 transition"
          >
            {loading ? "Processing…" : `Charge ₦${total.toLocaleString()}`}
          </button>
        </div>
      </div>

      {receipt && <ReceiptModal sale={receipt} onClose={() => setReceipt(null)} />}
    </div>
  );
}
