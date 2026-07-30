import { CalendarCheck } from "lucide-react";
import { RequestCard } from "@/components/account/request-card";
import { getOperationsRequests } from "@/lib/marketplace/server-data";
import { getCurrentStaff } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function OperationsPickupsPage() {
  const staff = await getCurrentStaff();
  if (!staff) return null;
  const requests = await getOperationsRequests({
    status: "accepted",
    intent: "rent",
  });
  const pickups = requests.sort((left, right) =>
    (left.startsAt ?? "").localeCompare(right.startsAt ?? ""),
  );

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-slate-950">
        Wander Pickups
      </h1>
      <p className="mt-2 text-slate-600">
        Accepted Wander rentals, ordered by pickup time.
      </p>
      {pickups.length > 0 ? (
        <div className="mt-7 space-y-5">
          {pickups.map((request) => (
            <RequestCard key={request.id} request={request} viewer="admin" />
          ))}
        </div>
      ) : (
        <div className="mt-7 rounded-[0.9rem] border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <CalendarCheck
            className="mx-auto h-8 w-8 text-teal-700"
            aria-hidden="true"
          />
          <h2 className="mt-4 text-lg font-bold text-slate-950">
            No accepted Wander pickups
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Accepted rental requests will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
