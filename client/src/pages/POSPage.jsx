import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../lib/api";

export default function POSPage() {
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [amountPaid, setAmountPaid] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: products = [] } = useQuery({
    queryKey: ["products", search],
    queryFn: () => api.get(`/products?search=${search}`).then((r) => r.data),
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

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const change = parseFloat(amountPaid || 0) - total;

  async function checkout() {
    if (!cart.length) return toast.error("Cart is empty");
    if (parseFloat(amountPaid) < total) return toast.error("Insufficient amount paid");
    setLoading(true);
    try {
      await api.post("/sales", {
        items: cart.map(({ productId, quantity }) => ({ productId, quantity })),
        paymentMethod,
        amountPaid: parseFloat(amountPaid),
      });
      toast.success("Sale completed!");
      setCart([]);
      setAmountPaid("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Sale failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-4 h-full">
      {/* Product Grid */}
      <div className="flex-1 space-y-4">
        <input
          className="w-full border rounded-lg px-3 py-2 text-sm"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {products.map((p) => (
            <button
              key={p.id}
              onClick={() => addToCart(p)}
              className="bg-white rounded-xl shadow p-4 text-left hover:ring-2 hover:ring-primary transition"
            >
              <p className="font-medium text-sm truncate">{p.name}</p>
              <p className="text-primary font-bold mt-1">₦{p.price.toLocaleString()}</p>
              <p className="text-xs text-gray-400">{p.sku}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Cart */}
      <div className="w-80 bg-white rounded-xl shadow p-4 flex flex-col">
        <h2 className="font-bold text-lg mb-3">Cart</h2>
        <div className="flex-1 overflow-y-auto space-y-2">
          {cart.length === 0 && <p className="text-gray-400 text-sm text-center mt-8">No items</p>}
          {cart.map((item) => (
            <div key={item.productId} className="flex items-center gap-2 text-sm">
              <div className="flex-1 truncate">{item.name}</div>
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => updateQty(item.productId, parseInt(e.target.value))}
                className="w-12 border rounded px-1 py-0.5 text-center"
              />
              <span className="w-20 text-right">₦{(item.price * item.quantity).toLocaleString()}</span>
              <button onClick={() => removeFromCart(item.productId)} className="text-red-400 hover:text-red-600">✕</button>
            </div>
          ))}
        </div>

        <div className="border-t pt-3 mt-3 space-y-3">
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>₦{total.toLocaleString()}</span>
          </div>
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
          <input
            type="number"
            placeholder="Amount paid"
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={amountPaid}
            onChange={(e) => setAmountPaid(e.target.value)}
          />
          {amountPaid && <p className="text-sm text-gray-500">Change: ₦{change.toLocaleString()}</p>}
          <button
            onClick={checkout}
            disabled={loading}
            className="w-full bg-primary text-white py-2 rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50"
          >
            {loading ? "Processing…" : "Charge"}
          </button>
        </div>
      </div>
    </div>
  );
}
