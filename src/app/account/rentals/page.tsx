import { Bike } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { RequestCard } from "@/components/account/request-card";
import { getRequestsForRenter } from "@/lib/marketplace/server-data";
import { getCurrentUser } from "@/lib/supabase/auth";

export default async function MyRentalsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/account/rentals");
  const requests = await getRequestsForRenter(user.id);

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-slate-950">
        My Rentals
      </h1>
      <p className="mt-2 text-slate-600">
        Rental requests and buying inquiries you have sent.
      </p>
      {requests.length > 0 ? (
        <div className="mt-7 space-y-5">
          {requests.map((request) => (
            <RequestCard key={request.id} request={request} viewer="renter" />
          ))}
        </div>
      ) : (
        <div className="mt-7 rounded-[0.9rem] border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <Bike className="mx-auto h-8 w-8 text-teal-700" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-bold text-slate-950">
            No bike requests yet
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Find a bike and send your first request.
          </p>
          <Link href="/bikes" className="btn-primary mt-5">
            Find a Bike
          </Link>
        </div>
      )}
    </div>
  );
}
