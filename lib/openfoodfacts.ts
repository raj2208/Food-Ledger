// Turns an Open Food Facts product into values for the add food form.
// No network or database imports, so it is easy to test.

// Open Food Facts is mostly per 100 g, but a food here is per serving.
export type ProductPrefill = {
  name: string;
  servingLabel: string;
  calories: number | null; // null when the product has no energy data
  proteinG: number;
  carbsG: number;
  fatG: number;
  barcode: string;
};

export type ParsedProduct = { prefill: ProductPrefill; missing: string[] };

// Digits only, 8 to 14 long (EAN-8, UPC-A, EAN-13, GTIN-14). Spaces and dashes are ignored.
export function normalizeBarcode(raw: string): { ok: true; barcode: string } | { ok: false; error: string } {
  const cleaned = raw.replace(/[\s-]/g, "");
  if (cleaned === "") return { ok: false, error: "Enter a barcode first" };
  if (!/^\d+$/.test(cleaned)) return { ok: false, error: "A barcode has digits only" };
  if (cleaned.length < 8 || cleaned.length > 14) return { ok: false, error: "A barcode has 8 to 14 digits" };
  return { ok: true, barcode: cleaned };
}

const KJ_PER_KCAL = 4.184;

function num(v: unknown): number | null {
  if (typeof v === "number") return Number.isFinite(v) && v >= 0 ? v : null;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? n : null;
  }
  return null;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

function firstBrand(brands: unknown): string {
  return typeof brands === "string" ? (brands.split(",")[0] ?? "").trim() : "";
}

function text(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

// `product` is the "product" object from the API. Anything may be missing or oddly typed.
export function parseProduct(product: unknown, barcode: string): ParsedProduct {
  const p = (product && typeof product === "object" ? product : {}) as Record<string, unknown>;
  const n = (p.nutriments && typeof p.nutriments === "object" ? p.nutriments : {}) as Record<string, unknown>;

  const productName = text(p.product_name) || text(p.product_name_en) || text(p.generic_name);
  const brand = firstBrand(p.brands);
  const name = productName && brand && !productName.toLowerCase().includes(brand.toLowerCase())
    ? `${productName} (${brand})`
    : productName;

  // Serving: use the product's own serving size when it is given in grams, else 100 g.
  const servingGrams = num(p.serving_quantity);
  const useServing = servingGrams !== null && servingGrams > 0;
  const factor = useServing ? servingGrams / 100 : 1;
  const servingLabel = useServing ? text(p.serving_size) || `${round1(servingGrams)} g` : "100 g";

  // A nutrient per serving: from the per 100 g value, else the product's own per serving value.
  const perServing = (key: string): number | null => {
    const per100 = num(n[`${key}_100g`]);
    if (per100 !== null) return per100 * factor;
    const direct = num(n[`${key}_serving`]);
    return direct;
  };

  let calories = perServing("energy-kcal");
  if (calories === null) {
    const kj = perServing("energy-kj") ?? perServing("energy");
    if (kj !== null) calories = kj / KJ_PER_KCAL;
  }

  const missing: string[] = [];
  if (!productName) missing.push("name");
  if (calories === null) missing.push("calories");

  const protein = perServing("proteins");
  const carbs = perServing("carbohydrates");
  const fat = perServing("fat");
  if (protein === null || carbs === null || fat === null) missing.push("macros");

  return {
    prefill: {
      name,
      servingLabel,
      calories: calories === null ? null : Math.round(calories),
      proteinG: round1(protein ?? 0),
      carbsG: round1(carbs ?? 0),
      fatG: round1(fat ?? 0),
      barcode,
    },
    missing,
  };
}
