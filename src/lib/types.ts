export type Category = {
  slug: string;
  label: string;
  subcategories: { slug: string; label: string }[];
};

export type Product = {
  id: string;
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
  created_at: string;
};

export type Reservation = {
  id: string;
  product_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  start_date: string;
  end_date: string;
  total_price: number;
  deposit: number;
  status: "pending" | "accepted" | "refused" | "returned" | "cancelled";
  action_token: string;
  created_at: string;
};

export type SiteSettings = {
  id: string;
  site_name: string;
  logo_url: string;
  primary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  owner_whatsapp: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  contact_instagram: string;
  hero_title: string;
  hero_subtitle: string;
  updated_at: string;
};
