import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ========== QUERIES ==========

// Get all products
export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("products").order("desc").collect();
  },
});

// Get product by ID
export const getById = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get products by category
export const getByCategory = query({
  args: { category: v.union(
    v.literal("necklaces"),
    v.literal("earrings"),
    v.literal("bracelets"),
    v.literal("rings"),
    v.literal("sets"),
    v.literal("other")
  )},
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();
  },
});

// Search products by name
export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const products = await ctx.db.query("products").collect();
    const searchTerm = args.query.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm) ||
        (p.notes && p.notes.toLowerCase().includes(searchTerm))
    );
  },
});

// Get dashboard statistics
export const getStats = query({
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();

    const totalProducts = products.length;
    const totalSold = products.filter((p) => p.status === "sold").length;
    const totalAvailable = products.filter((p) => p.status === "available").length;
    const lowStockCount = products.filter((p) => p.status === "low-stock").length;

    const totalInventoryValue = products
      .filter((p) => p.status !== "sold")
      .reduce((sum, p) => sum + p.storePrice * p.quantity, 0);

    const totalRevenue = products
      .filter((p) => p.status === "sold")
      .reduce((sum, p) => sum + p.suggestedPrice, 0);

    const totalProfit = products
      .filter((p) => p.status === "sold")
      .reduce((sum, p) => sum + (p.suggestedPrice - p.storePrice), 0);

    return {
      totalProducts,
      totalSold,
      totalAvailable,
      totalInventoryValue,
      totalRevenue,
      totalProfit,
      lowStockCount,
    };
  },
});

// Export all products (for backup)
export const exportAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("products").collect();
  },
});

// ========== MUTATIONS ==========

// Add new product
export const add = mutation({
  args: {
    name: v.string(),
    quantity: v.number(),
    storePrice: v.number(),
    suggestedPrice: v.number(),
    profitPercentage: v.number(),
    category: v.union(
      v.literal("necklaces"),
      v.literal("earrings"),
      v.literal("bracelets"),
      v.literal("rings"),
      v.literal("sets"),
      v.literal("other")
    ),
    status: v.union(
      v.literal("available"),
      v.literal("sold"),
      v.literal("low-stock")
    ),
    notes: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.insert("products", {
      ...args,
      dateAdded: new Date().toISOString().split("T")[0],
    });
    return product;
  },
});

// Seed batch of products (for import)
export const seedBatch = mutation({
  args: {
    products: v.array(
      v.object({
        name: v.string(),
        quantity: v.number(),
        storePrice: v.number(),
        suggestedPrice: v.number(),
        profitPercentage: v.number(),
        category: v.union(
          v.literal("necklaces"),
          v.literal("earrings"),
          v.literal("bracelets"),
          v.literal("rings"),
          v.literal("sets"),
          v.literal("other")
        ),
        status: v.union(
          v.literal("available"),
          v.literal("sold"),
          v.literal("low-stock")
        ),
        notes: v.optional(v.string()),
        image: v.optional(v.string()),
        dateAdded: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const results = [];
    for (const product of args.products) {
      try {
        const id = await ctx.db.insert("products", product);
        results.push({ success: true, id, name: product.name });
      } catch (error: any) {
        results.push({ success: false, name: product.name, error: error.message });
      }
    }
    return results;
  },
});

// Update product
export const update = mutation({
  args: {
    id: v.id("products"),
    name: v.optional(v.string()),
    quantity: v.optional(v.number()),
    storePrice: v.optional(v.number()),
    suggestedPrice: v.optional(v.number()),
    profitPercentage: v.optional(v.number()),
    category: v.optional(
      v.union(
        v.literal("necklaces"),
        v.literal("earrings"),
        v.literal("bracelets"),
        v.literal("rings"),
        v.literal("sets"),
        v.literal("other")
      )
    ),
    status: v.optional(
      v.union(
        v.literal("available"),
        v.literal("sold"),
        v.literal("low-stock")
      )
    ),
    notes: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});

// Remove product
export const remove = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Sell product (reduce quantity)
export const sell = mutation({
  args: {
    id: v.id("products"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) throw new Error("Product not found");

    const newQuantity = Math.max(0, product.quantity - args.quantity);
    const status =
      newQuantity === 0
        ? "sold"
        : newQuantity <= 2
        ? "low-stock"
        : "available";

    await ctx.db.patch(args.id, {
      quantity: newQuantity,
      status,
    });

    return await ctx.db.get(args.id);
  },
});
