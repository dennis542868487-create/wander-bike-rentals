import { permanentRedirect } from "next/navigation";

export default function LegacyCartPage() {
  permanentRedirect("/bikes");
}
