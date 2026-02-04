import React, { useState, useEffect } from "react";

const PricelistManager = () => {
  // Inject Tailwind CSS for the professional "Studio" look
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.tailwindcss.com";
    document.head.appendChild(script);
  }, []);

  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [pricelist, setPricelist] = useState([]);
  const [paymentLink, setPaymentLink] = useState("");
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editedPricelist, setEditedPricelist] = useState([]);
  const [editedPaymentLink, setEditedPaymentLink] = useState("");

  const ADMIN_USERS = { admin: "studio2024" };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const data = params.get("d");
    if (data) {
      try {
        const decoded = JSON.parse(atob(data));
        setPricelist(decoded.p.map((item) => ({ ...item, qty: 0 })));
        setPaymentLink(decoded.l);
      } catch (e) {
        loadDefaults();
      }
    } else {
      loadDefaults();
    }
    setLoading(false);
  }, []);

  const loadDefaults = () => {
    setPricelist([
      { id: 1, item: "Cinematic Video Edit", price: 450, qty: 0 },
      { id: 2, item: "Color Grading Pro", price: 150, qty: 0 },
    ]);
    setPaymentLink("https://stripe.com");
  };

  const updateQuantity = (id, delta) => {
    setPricelist((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i
      )
    );
  };

  const addItem = () => {
    const newId = Date.now();
    setEditedPricelist([
      ...editedPricelist,
      { id: newId, item: "New Service", price: 0, qty: 0 },
    ]);
  };

  const deleteItem = (id) => {
    setEditedPricelist(editedPricelist.filter((i) => i.id !== id));
  };

  const updateEditedItem = (id, field, value) => {
    setEditedPricelist(
      editedPricelist.map((i) => (i.id === id ? { ...i, [field]: value } : i))
    );
  };

  const generateLink = () => {
    const encoded = btoa(
      JSON.stringify({
        p: pricelist.map(({ id, item, price }) => ({ id, item, price })),
        l: paymentLink,
      })
    );
    const url = `${window.location.origin}${window.location.pathname}?d=${encoded}`;
    navigator.clipboard.writeText(url);
    alert("🚀 Pro Link Copied!");
  };

  const total = pricelist.reduce(
    (sum, item) => sum + Number(item.price) * item.qty,
    0
  );

  if (loading)
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white italic tracking-widest uppercase">
        Initializing Studio...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans p-4 md:p-8">
      {isAdmin && (
        <div className="fixed top-0 left-0 w-full z-50 bg-indigo-600 p-3 flex justify-between items-center px-6 shadow-2xl border-b border-indigo-400">
          <span className="text-[10px] font-black uppercase tracking-widest text-white">
            Inventory Editor
          </span>
          <div className="flex gap-3">
            {!editMode && (
              <button
                onClick={generateLink}
                className="text-[10px] font-bold bg-white text-indigo-600 px-4 py-1.5 rounded-full shadow-lg"
              >
                GENERATE LINK
              </button>
            )}
            <button
              onClick={() => {
                setEditedPricelist([...pricelist]);
                setEditedPaymentLink(paymentLink);
                setEditMode(!editMode);
              }}
              className="text-[10px] font-bold border border-white px-4 py-1.5 rounded-full hover:bg-white/10 transition"
            >
              {editMode ? "CANCEL" : "MANAGE PRODUCTS"}
            </button>
            <button
              onClick={() => setIsAdmin(false)}
              className="text-[10px] opacity-60 text-white hover:opacity-100 transition"
            >
              LOGOUT
            </button>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto mt-12">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-white tracking-tighter mb-2 italic">
            Service Menu.
          </h1>
          <p className="text-slate-400 font-medium italic">
            Adjust quantities to customize your project quote.
          </p>
        </header>

        <div className="bg-slate-900/80 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-md">
          {editMode ? (
            <div className="space-y-4">
              {editedPricelist.map((item) => (
                <div key={item.id} className="flex gap-2 items-center">
                  <input
                    className="bg-slate-800 border border-slate-700 p-4 flex-1 rounded-2xl text-white outline-none focus:border-indigo-500 transition"
                    value={item.item}
                    onChange={(e) =>
                      updateEditedItem(item.id, "item", e.target.value)
                    }
                  />
                  <input
                    type="number"
                    className="bg-slate-800 border border-slate-700 p-4 w-28 rounded-2xl text-white outline-none focus:border-indigo-500 transition"
                    value={item.price}
                    onChange={(e) =>
                      updateEditedItem(item.id, "price", e.target.value)
                    }
                  />
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="w-12 h-12 flex items-center justify-center bg-red-500/20 text-red-500 rounded-2xl hover:bg-red-500 transition"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={addItem}
                className="w-full border-2 border-dashed border-slate-700 p-4 rounded-2xl text-slate-500 font-bold hover:border-indigo-500 hover:text-indigo-400 transition"
              >
                + Add New Product
              </button>
              <div className="pt-6 border-t border-slate-800 mt-6">
                <input
                  className="bg-slate-800 border border-slate-700 p-4 w-full rounded-2xl text-white outline-none focus:border-indigo-500 transition"
                  placeholder="Payment URL"
                  value={editedPaymentLink}
                  onChange={(e) => setEditedPaymentLink(e.target.value)}
                />
              </div>
              <button
                onClick={() => {
                  setPricelist(editedPricelist);
                  setPaymentLink(editedPaymentLink);
                  setEditMode(false);
                }}
                className="w-full bg-indigo-500 text-white py-5 rounded-2xl font-black text-xs tracking-widest mt-4 hover:bg-indigo-400 transition shadow-lg shadow-indigo-500/10"
              >
                SAVE INVENTORY
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {pricelist.map((item) => (
                  <div
                    key={item.id}
                    className={`flex justify-between items-center p-6 rounded-[1.8rem] border-2 transition-all duration-500 ${
                      item.qty > 0
                        ? "border-indigo-500 bg-indigo-500/10 shadow-[0_0_25px_rgba(99,102,241,0.1)]"
                        : "border-slate-800 bg-slate-800/20 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <div className="text-left">
                      <h3
                        className={`font-bold text-lg transition-colors ${
                          item.qty > 0 ? "text-white" : "text-slate-400"
                        }`}
                      >
                        {item.item}
                      </h3>
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">
                        ${item.price} per unit
                      </p>
                    </div>
                    <div className="flex items-center gap-4 bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center font-bold text-slate-300 transition-colors"
                      >
                        -
                      </button>
                      <span
                        className={`w-6 text-center font-black text-lg ${
                          item.qty > 0 ? "text-indigo-400" : "text-slate-600"
                        }`}
                      >
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-10 h-10 rounded-lg bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center font-bold text-white transition-all shadow-lg shadow-indigo-500/20"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-12 pt-10 border-t border-slate-800 flex justify-between items-end">
                <div>
                  <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] block mb-2">
                    Investment Total
                  </span>
                  <span className="text-6xl font-black text-white tracking-tighter">
                    ${total}
                  </span>
                </div>
                <a
                  href={paymentLink}
                  target="_blank"
                  className={`px-12 py-5 rounded-2xl font-black text-[10px] tracking-[0.2em] transition-all duration-700 shadow-2xl ${
                    total > 0
                      ? "bg-white text-black hover:bg-indigo-500 hover:text-white"
                      : "bg-slate-800 text-slate-600 pointer-events-none opacity-40 uppercase translate-y-2"
                  }`}
                >
                  CHECKOUT
                </a>
              </div>
            </>
          )}
        </div>
      </div>

      {/* --- SECRET ADMIN DOOR IN BOTTOM LEFT --- */}
      {!isAdmin && (
        <button
          onClick={() => setShowLogin(true)}
          className="fixed bottom-8 left-8 w-2 h-2 rounded-full bg-slate-800 hover:bg-indigo-500 transition-all duration-500"
        />
      )}

      {/* Auth Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0f172a]/98 backdrop-blur-xl p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (ADMIN_USERS[username] === password) {
                setIsAdmin(true);
                setShowLogin(false);
              } else {
                setLoginError("AUTH_FAILED");
              }
            }}
            className="w-full max-w-sm bg-slate-900 p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl"
          >
            <h2 className="text-4xl font-black text-white mb-10 tracking-tighter text-center italic">
              Studio Auth.
            </h2>
            <input
              className="w-full bg-slate-800 border border-slate-700 p-5 rounded-2xl mb-3 text-white outline-none focus:border-indigo-500 transition-all font-mono"
              placeholder="Identity"
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              className="w-full bg-slate-900 border border-slate-800 p-5 rounded-2xl mb-8 text-white outline-none focus:border-indigo-500 transition-all"
              type="password"
              placeholder="Passphrase"
              onChange={(e) => setPassword(e.target.value)}
            />
            {loginError && (
              <p className="text-red-400 text-center text-[10px] font-black mb-6 uppercase tracking-widest">
                {loginError}
              </p>
            )}
            <button className="w-full bg-white text-black py-5 rounded-2xl font-black tracking-widest text-xs hover:bg-indigo-500 hover:text-white transition-all uppercase">
              Verify
            </button>
            <button
              type="button"
              onClick={() => setShowLogin(false)}
              className="w-full mt-8 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:text-slate-400 transition text-center"
            >
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

// CRITICAL: This line allows CodeSandbox to see and run your code!
export default PricelistManager;
