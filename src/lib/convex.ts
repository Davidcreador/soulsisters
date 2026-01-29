import { ConvexReactClient } from "convex/react";

const CONVEX_URL = "https://adept-sparrow-663.convex.cloud";

export const convex = new ConvexReactClient(CONVEX_URL);

// Export api object for type-safe queries
export { api } from "../../convex/_generated/api";
