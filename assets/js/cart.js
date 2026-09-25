/* ============================================================
   cart.js — Nahl Al Thahab lightweight order cart
   ------------------------------------------------------------
   No backend, no checkout page, no state library.
   Add → on-page drawer → WhatsApp handoff. That's the whole flow.

   ┌─ CONFIG ────────────────────────────────────────────────┐
   │  Merchant WhatsApp number in INTERNATIONAL format,       │
   │  digits only, no "+", spaces or dashes.                  │
   └──────────────────────────────────────────────────────────┘ */
const WHATSAPP_NUMBER = "201557758131";
const CURRENCY = "ج.م";

/* Cart state — [{ name, price, qty }] */
const cart = [];

/* ── DOM ────────────────────────────────────────────────── */
const els = {
  drawer:  document.getElementById("cartDrawer"),
  scrim:   document.getElementById("cartScrim"),
  list:    document.getElementById("cartList"),
  empty:   document.getElementById("cartEmpty"),
  total:   document.getElementById("cartTotal"),
  count:   document.getElementById("cartCount"),
  confirm: document.getElementById("cartConfirm"),
  close:   document.getElementById("cartClose"),
  navCart: document.getElementById("navCart"),
};

let lastFocus = null;

/* ── Helpers ───────────────────────────────────────────── */
const money = (n) => `${n} ${CURRENCY}`;

function total() {
  return cart.reduce((sum, it) => sum + it.price * it.qty, 0);
}

/* Find an equal line (same name + same price) so repeat clicks
   stack into one row instead of duplicating lines. */
function findLine(name, price) {
  return cart.find((it) => it.name === name && it.price === price);
}

/* ── Render ────────────────────────────────────────────── */
function render() {
  /* items */
  els.list.innerHTML = "";
  cart.forEach((item, i) => {
    const row = document.createElement("div");
    row.className = "cart-item";
    row.setAttribute("role", "listitem");

    const name = document.createElement("span");
    name.className = "cart-item__name";
    name.textContent = item.qty > 1
      ? `${item.name} × ${item.qty}`
      : item.name;

    const price = document.createElement("span");
    price.className = "cart-item__price";
    price.textContent = money(item.price * item.qty);

    const remove = document.createElement("button");
    remove.className = "cart-item__remove";
    remove.type = "button";
    remove.setAttribute("aria-label", `إزالة ${item.name}`);
    remove.textContent = "×";
    remove.addEventListener("click", () => removeItem(i));

    row.append(name, price, remove);
    els.list.append(row);
  });

  /* empty state + scroll affordance */
  const isEmpty = cart.length === 0;
  /* `hidden` must be TRUE when we are NOT empty — the empty-state
     message is the thing that gets hidden once items exist. */
  els.empty.hidden = !isEmpty;
  els.list.hidden = isEmpty;
  els.confirm.disabled = isEmpty;
  els.confirm.style.opacity = isEmpty ? "0.45" : "";

  /* totals + badge */
  els.total.textContent = money(total());
  const count = cart.reduce((s, it) => s + it.qty, 0);
  els.count.hidden = count === 0;
  els.count.textContent = count;
}

/* ── Actions ───────────────────────────────────────────── */
function addItem(name, price) {
  const existing = findLine(name, price);
  if (existing) existing.qty += 1;
  else cart.push({ name, price, qty: 1 });
  render();
  if (!els.drawer.classList.contains("cart--open")) openCart();
}

function removeItem(index) {
  cart.splice(index, 1);
  render();
}

function openCart() {
  lastFocus = document.activeElement;
  els.scrim.hidden = false;
  els.drawer.hidden = false;
  requestAnimationFrame(() => {
    els.drawer.classList.add("cart--open");
    els.scrim.classList.add("cart-scrim--on");
  });
  els.navCart.setAttribute("aria-expanded", "true");
  document.body.style.overflow = "hidden";
  els.close.focus();
}

function closeCart() {
  els.drawer.classList.remove("cart--open");
  els.scrim.classList.remove("cart-scrim--on");
  els.navCart.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
  const finish = () => {
    els.drawer.hidden = true;
    els.scrim.hidden = true;
  };
  els.drawer.addEventListener("transitionend", finish, { once: true });
  setTimeout(finish, 320); /* fallback if transitionend never fires */
  if (lastFocus) lastFocus.focus();
}

/* ── WhatsApp handoff ──────────────────────────────────── */
function buildOrderMessage() {
  const lines = cart.map((it) =>
    `- ${it.name}${it.qty > 1 ? ` (×${it.qty})` : ""} — ${money(it.price * it.qty)}`
  );

  return [
    "السلام عليكم",
    "أرغب في طلب:",
    "",
    ...lines,
    "",
    `الإجمالي: ${money(total())}`,
    "",
    "أرغب في تأكيد الطلب.",
  ].join("\n");
}

function confirmOrder() {
  if (!cart.length) return;

  window.open(
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildOrderMessage())}`,
    "_blank",
    "noopener"
  );
}

/* ── Wiring ────────────────────────────────────────────── */
/* Product data comes from the card itself — no duplicate list. */
document.querySelectorAll(".js-add-cart").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const card = btn.closest(".prod-card");
    const name = card.dataset.name;
    const price = Number(card.dataset.price);
    if (!name || !Number.isFinite(price)) return;
    addItem(name, price);
  });
});

els.navCart.addEventListener("click", () =>
  els.drawer.classList.contains("cart--open") ? closeCart() : openCart()
);
els.close.addEventListener("click", closeCart);
els.scrim.addEventListener("click", closeCart);
els.confirm.addEventListener("click", confirmOrder);

/* Close on Escape, keep page underneath intact. */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && els.drawer.classList.contains("cart--open")) closeCart();
});

render();
