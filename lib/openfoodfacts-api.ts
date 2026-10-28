import { normalizeBarcode, parseProduct, type ParsedProduct } from "./openfoodfacts";

// Open Food Facts asks every client to identify itself (and allows 15 product reads a minute).
const USER_AGENT = "FoodLedger/0.1 (personal project; https://github.com/raj2208/Food-Ledger)";
const FIELDS = "product_name,product_name_en,generic_name,brands,serving_size,serving_quantity,nutriments";
const TIMEOUT_MS = 8000;

export type FetchProductResult =
  | { status: "found"; parsed: ParsedProduct }
  | { status: "not_found" }
  | { status: "rate_limited" }
  | { status: "unavailable" };

// `fetchImpl` is only swapped out in tests.
export async function fetchProduct(
  rawBarcode: string,
  fetchImpl: typeof fetch = fetch,
): Promise<FetchProductResult> {
  const code = normalizeBarcode(rawBarcode);
  if (!code.ok) return { status: "not_found" };

  let res: Response;
  try {
    res = await fetchImpl(
      `https://world.openfoodfacts.org/api/v2/product/${code.barcode}.json?fields=${FIELDS}`,
      {
        headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
        signal: AbortSignal.timeout(TIMEOUT_MS),
        cache: "no-store",
      },
    );
  } catch {
    return { status: "unavailable" }; // offline, DNS failure or timed out
  }

  if (res.status === 429) return { status: "rate_limited" };
  if (res.status === 404) return { status: "not_found" };
  if (!res.ok) return { status: "unavailable" };

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    return { status: "unavailable" };
  }
  const b = (body && typeof body === "object" ? body : {}) as { status?: unknown; product?: unknown };
  if (b.status !== 1 || !b.product || typeof b.product !== "object") return { status: "not_found" };

  return { status: "found", parsed: parseProduct(b.product, code.barcode) };
}
