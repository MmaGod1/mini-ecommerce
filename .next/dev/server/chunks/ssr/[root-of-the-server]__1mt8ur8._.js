module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/dynamic-access-async-storage.external.js [external] (next/dist/server/app-render/dynamic-access-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/dynamic-access-async-storage.external.js", () => require("next/dist/server/app-render/dynamic-access-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/runtime-reacts.external.js [external] (next/dist/server/runtime-reacts.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/runtime-reacts.external.js", () => require("next/dist/server/runtime-reacts.external.js"));

module.exports = mod;
}),
"[project]/components/Header.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Header
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$context$2f$ShopContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/context/ShopContext.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
function Header() {
    const { cart } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$context$2f$ShopContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useShop"])();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])();
    const cartCount = cart.reduce((sum, c)=>sum + c.quantity, 0);
    const isShop = pathname === "/";
    const isCart = pathname === "/checkout";
    const isOrders = pathname === "/orders";
    const isAdmin = pathname.startsWith("/admin");
    function tabClass(active) {
        return `relative pb-1 hover:text-gold-100 transition-colors ${active ? "text-white after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-[3px] after:h-[3px] after:rounded-full after:bg-white" : "text-gold-100"}`;
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
        className: "bg-gold-500 text-white",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "max-w-6xl mx-auto px-4 py-3 flex items-center justify-between",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    href: "/",
                    className: "text-lg font-bold tracking-wide",
                    children: "YourShop"
                }, void 0, false, {
                    fileName: "[project]/components/Header.tsx",
                    lineNumber: 28,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                    className: "flex items-center gap-6 text-sm font-semibold",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                            href: "/",
                            className: tabClass(isShop),
                            children: "Shop"
                        }, void 0, false, {
                            fileName: "[project]/components/Header.tsx",
                            lineNumber: 32,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                            href: "/checkout",
                            className: tabClass(isCart),
                            children: [
                                "Cart",
                                cartCount > 0 ? ` (${cartCount})` : ""
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/Header.tsx",
                            lineNumber: 35,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                            href: "/orders",
                            className: tabClass(isOrders),
                            children: "My Orders"
                        }, void 0, false, {
                            fileName: "[project]/components/Header.tsx",
                            lineNumber: 38,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                            href: "/admin",
                            className: tabClass(isAdmin),
                            children: "Admin"
                        }, void 0, false, {
                            fileName: "[project]/components/Header.tsx",
                            lineNumber: 41,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/Header.tsx",
                    lineNumber: 31,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/Header.tsx",
            lineNumber: 27,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/Header.tsx",
        lineNumber: 26,
        columnNumber: 5
    }, this);
}
}),
"[project]/context/ShopContext.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ShopProvider",
    ()=>ShopProvider,
    "useShop",
    ()=>useShop
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/data.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$pricing$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/pricing.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
const ShopContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(null);
const DEFAULT_CATEGORIES = [
    "Clothing",
    "Footwear",
    "Bags"
];
function ShopProvider({ children }) {
    const [products, setProducts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["initialProducts"]);
    const [categories, setCategories] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(DEFAULT_CATEGORIES);
    const [cart, setCart] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [orders, setOrders] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    function addCategory(name) {
        const trimmed = name.trim();
        if (!trimmed) return;
        setCategories((prev)=>prev.some((c)=>c.toLowerCase() === trimmed.toLowerCase()) ? prev : [
                ...prev,
                trimmed
            ]);
    }
    function addProduct(p) {
        setProducts((prev)=>[
                ...prev,
                p
            ]);
        addCategory(p.category);
    }
    function updateProduct(updated) {
        setProducts((prev)=>prev.map((p)=>p.id === updated.id ? updated : p));
        addCategory(updated.category);
    }
    function deleteProduct(productId) {
        setProducts((prev)=>prev.filter((p)=>p.id !== productId));
    }
    function updateVariantStock(productId, variantId, newStock) {
        setProducts((prev)=>prev.map((p)=>p.id !== productId ? p : {
                    ...p,
                    variants: p.variants.map((v)=>v.id === variantId ? {
                            ...v,
                            stock: Math.max(0, newStock)
                        } : v)
                }));
    }
    function addToCart(line) {
        setCart((prev)=>{
            const product = products.find((p)=>p.id === line.productId);
            const variant = product?.variants.find((v)=>v.id === line.variantId);
            const stockLimit = variant?.stock ?? Infinity;
            const existing = prev.find((c)=>c.variantId === line.variantId);
            if (existing) {
                const cappedQty = Math.min(existing.quantity + line.quantity, stockLimit);
                return prev.map((c)=>c.variantId === line.variantId ? {
                        ...c,
                        quantity: cappedQty
                    } : c);
            }
            const cappedQty = Math.min(line.quantity, stockLimit);
            return [
                ...prev,
                {
                    ...line,
                    quantity: cappedQty
                }
            ];
        });
    }
    function removeFromCart(variantId) {
        setCart((prev)=>prev.filter((c)=>c.variantId !== variantId));
    }
    function clearCart() {
        setCart([]);
    }
    function placeOrder(details) {
        // Build order line items with their discount applied.
        const items = cart.map((line)=>{
            const product = products.find((p)=>p.id === line.productId);
            const { total, discountPercent } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$pricing$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateLineTotal"])(line.unitPrice, line.quantity, product?.discountTiers);
            return {
                ...line,
                discountPercent,
                lineTotal: total
            };
        });
        // Decrement stock per variant, this is the "sold out at zero" logic.
        setProducts((prev)=>prev.map((product)=>({
                    ...product,
                    variants: product.variants.map((v)=>{
                        const match = cart.find((c)=>c.variantId === v.id);
                        if (match) {
                            return {
                                ...v,
                                stock: Math.max(0, v.stock - match.quantity)
                            };
                        }
                        return v;
                    })
                })));
        const total = items.reduce((sum, i)=>sum + i.lineTotal, 0);
        const order = {
            id: `#${Math.floor(10000 + Math.random() * 90000)}`,
            items,
            total,
            location: details.location,
            phone: details.phone,
            comments: details.comments,
            createdAt: new Date().toISOString(),
            status: "Paid"
        };
        setOrders((prev)=>[
                order,
                ...prev
            ]);
        clearCart();
        return order;
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ShopContext.Provider, {
        value: {
            products,
            categories,
            cart,
            orders,
            addProduct,
            updateProduct,
            deleteProduct,
            updateVariantStock,
            addCategory,
            addToCart,
            removeFromCart,
            clearCart,
            placeOrder
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/context/ShopContext.tsx",
        lineNumber: 166,
        columnNumber: 5
    }, this);
}
function useShop() {
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(ShopContext);
    if (!ctx) throw new Error("useShop must be used within a ShopProvider");
    return ctx;
}
}),
"[project]/lib/data.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "initialProducts",
    ()=>initialProducts
]);
const initialProducts = [
    {
        id: "p1",
        slug: "denim-jacket",
        name: "Denim Jacket",
        category: "Clothing",
        description: "Classic unisex denim jacket. Durable stitching, relaxed fit, works for everyday wear or layering.",
        variants: [
            {
                id: "p1-blue",
                color: "Blue",
                price: 12500,
                stock: 12
            },
            {
                id: "p1-black",
                color: "Black",
                price: 12500,
                stock: 0
            },
            {
                id: "p1-lightwash",
                color: "Light Wash",
                price: 13000,
                stock: 5
            }
        ],
        discountTiers: [
            {
                minQty: 5,
                discountPercent: 8
            },
            {
                minQty: 10,
                discountPercent: 15
            }
        ]
    },
    {
        id: "p2",
        slug: "ankara-sneakers",
        name: "Ankara Print Sneakers",
        category: "Footwear",
        description: "Canvas sneakers with bold Ankara print panels. Comfortable everyday wear with a standout look.",
        variants: [
            {
                id: "p2-redprint",
                color: "Red Print",
                price: 9500,
                stock: 8
            },
            {
                id: "p2-blueprint",
                color: "Blue Print",
                price: 9500,
                stock: 3
            }
        ],
        discountTiers: [
            {
                minQty: 10,
                discountPercent: 12
            }
        ]
    },
    {
        id: "p3",
        slug: "leather-weekend-bag",
        name: "Leather Weekend Bag",
        category: "Bags",
        description: "Spacious weekend bag in genuine leather. Fits airline carry-on sizing, with a detachable shoulder strap.",
        variants: [
            {
                id: "p3-brown",
                color: "Brown",
                price: 22000,
                stock: 4
            },
            {
                id: "p3-black",
                color: "Black",
                price: 22000,
                stock: 2
            }
        ]
    },
    {
        id: "p4",
        slug: "canvas-sneakers",
        name: "Canvas Sneakers",
        category: "Footwear",
        description: "Everyday canvas sneakers. Lightweight, breathable, easy to pair with anything.",
        variants: [
            {
                id: "p4-white",
                color: "White",
                price: 8000,
                stock: 20
            },
            {
                id: "p4-navy",
                color: "Navy",
                price: 8000,
                stock: 15
            },
            {
                id: "p4-black",
                color: "Black",
                price: 8000,
                stock: 0
            }
        ],
        discountTiers: [
            {
                minQty: 3,
                discountPercent: 5
            },
            {
                minQty: 10,
                discountPercent: 10
            }
        ]
    }
];
}),
"[project]/lib/pricing.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calculateLineTotal",
    ()=>calculateLineTotal,
    "formatNaira",
    ()=>formatNaira,
    "getApplicableDiscount",
    ()=>getApplicableDiscount
]);
function getApplicableDiscount(qty, tiers) {
    if (!tiers || tiers.length === 0) return null;
    const qualifying = tiers.filter((t)=>qty >= t.minQty).sort((a, b)=>b.minQty - a.minQty);
    return qualifying[0] ?? null;
}
function calculateLineTotal(unitPrice, qty, tiers) {
    const discount = getApplicableDiscount(qty, tiers);
    const discountPercent = discount?.discountPercent ?? 0;
    const subtotal = unitPrice * qty;
    const total = Math.round(subtotal * (1 - discountPercent / 100));
    return {
        subtotal,
        total,
        discountPercent
    };
}
function formatNaira(amount) {
    return `\u20A6${amount.toLocaleString("en-NG")}`;
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1mt8ur8._.js.map