import { ClipboardList } from "lucide-react";
import { redirect } from "next/navigation";
import { RequestCard } from "@/components/account/request-card";
import { getRequestsForOwner } from "@/lib/marketplace/server-data";
import { getCurrentUser } from "@/lib/supabase/auth";

export default async function BookingRequestsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/account/requests");
  const requests = await getRequestsForOwner(user.id);

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-slate-950">
        Booking Requests
      </h1>
      <p className="mt-2 text-slate-600">
        Requests other people sent for bikes you listed.
      </p>
      {requests.length > 0 ? (
        <div className="mt-7 space-y-5">
          {requests.map((request) => (
            <RequestCard key={request.id} request={request} viewer="owner" />
          ))}
        </div>
      ) : (
        <div className="mt-7 rounded-[0.9rem] border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <ClipboardList className="mx-auto h-8 w-8 text-teal-700" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-bold text-slate-950">
            No incoming requests
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            New requests will appear here after one of your listings is live.
          </p>
        </div>
      )}
    </div>
  );
}
