import type { Category } from "./types";

// Generic luxury menswear taxonomy. The admin can rename labels at any time
// via site settings — this only dictates the URL slugs used in the catalogue.
export const CATEGORIES: Category[] = [
  {
    slug: "vetements",
    label: "Vêtements",
    subcategories: [
      { slug: "vestes", label: "Vestes & Manteaux" },
      { slug: "pulls", label: "Pulls & Sweats" },
      { slug: "chemises", label: "Chemises" },
      { slug: "tshirts", label: "T-shirts & Polos" },
      { slug: "pantalons", label: "Pantalons" },
      { slug: "costumes", label: "Costumes" },
    ],
  },
  {
    slug: "chaussures",
    label: "Chaussures",
    subcategories: [
      { slug: "sneakers", label: "Sneakers" },
      { slug: "derbies", label: "Derbies & Richelieus" },
      { slug: "mocassins", label: "Mocassins" },
      { slug: "bottes", label: "Bottes" },
    ],
  },
  {
    slug: "accessoires",
    label: "Accessoires",
    subcategories: [
      { slug: "sacs", label: "Sacs" },
      { slug: "ceintures", label: "Ceintures" },
      { slug: "lunettes", label: "Lunettes" },
      { slug: "bijoux", label: "Bijoux" },
      { slug: "casquettes", label: "Casquettes & Bonnets" },
    ],
  },
  {
    slug: "nouveautes",
    label: "Nouveautés",
    subcategories: [],
  },
];
