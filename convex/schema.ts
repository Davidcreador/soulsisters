import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  products: defineTable({
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
    dateAdded: v.string(),
  })
    .index("by_category", ["category"])
    .index("by_status", ["status"])
    .index("by_name", ["name"]),
});
