import { getBillableApiCallLogsCollectionRef } from "../utils/collection-refs";

export async function getBillableApiCallCountForMonth({
  orgId,
  date,
}: {
  orgId: string;
  date: Date;
}): Promise<number> {
  const fullYear = date.getFullYear();
  const month = date.getMonth();
  const firstDayOfMonth = new Date(fullYear, month, 1);
  const firstDayOfNextMonth = new Date(fullYear, month + 1, 1);

  const snapshot = await getBillableApiCallLogsCollectionRef({ orgId })
    .where("createdAt", ">=", firstDayOfMonth)
    .where("createdAt", "<", firstDayOfNextMonth)
    .count()
    .get();

  return snapshot.data().count;
}
