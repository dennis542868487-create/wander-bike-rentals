import { permanentRedirect } from "next/navigation";

export default function LegacyShopPage() {
  permanentRedirect("/bikes");
}
