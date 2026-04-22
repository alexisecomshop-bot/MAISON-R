// Minimal RFC 4180 CSV parser. Handles quoted fields, escaped quotes ("")
// and CRLF line endings. Zero deps.

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      continue;
    }
    if (c === ",") {
      row.push(field);
      field = "";
      continue;
    }
    if (c === "\r") continue;
    if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }
    field += c;
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

export type ProductRow = {
  sku: string;
  name: string;
  description: string;
  brand: string;
  category: string;
  subcategory: string;
  size: string;
  color: string;
  daily_price: number;
  deposit: number;
  images: string[];
  available: boolean;
};

const REQUIRED = ["sku", "name", "category", "daily_price"] as const;

function normHeader(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, "_");
}

function toBool(v: string): boolean {
  const s = v.trim().toLowerCase();
  return s === "true" || s === "1" || s === "yes" || s === "oui" || s === "";
}

function toNumber(v: string): number {
  const n = Number(String(v).replace(",", ".").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export function parseProductsCsv(text: string): ProductRow[] {
  const rows = parseCsv(text);
  if (rows.length < 2) return [];
  const headers = rows[0].map(normHeader);
  const idx = (name: string) => headers.indexOf(name);

  for (const req of REQUIRED) {
    if (idx(req) === -1) {
      throw new Error(`Column "${req}" missing in sheet`);
    }
  }

  const products: ProductRow[] = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const sku = (row[idx("sku")] || "").trim();
    if (!sku) continue;

    const images = ["image1", "image2", "image3", "image4", "image5"]
      .map((k) => (idx(k) >= 0 ? (row[idx(k)] || "").trim() : ""))
      .filter((u) => u.length > 0);

    products.push({
      sku,
      name: (row[idx("name")] || "").trim(),
      description: (row[idx("description")] || "").trim(),
      brand: (row[idx("brand")] || "").trim(),
      category: (row[idx("category")] || "").trim().toLowerCase(),
      subcategory: (row[idx("subcategory")] || "").trim().toLowerCase(),
      size: (row[idx("size")] || "").trim(),
      color: (row[idx("color")] || "").trim(),
      daily_price: toNumber(row[idx("daily_price")] || "0"),
      deposit: toNumber(row[idx("deposit")] || "0"),
      images,
      available: idx("available") >= 0 ? toBool(row[idx("available")]) : true,
    });
  }
  return products;
}
