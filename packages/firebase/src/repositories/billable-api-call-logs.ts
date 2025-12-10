import { RATE_LIMIT_SETTINGS } from "@templetto/settings";
import { BillableApiCallLog } from "../utils/collection-parsers";
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

export async function recordBillableApiCall({
  orgId,
}: {
  orgId: string;
}): Promise<void> {
  const billableApiCallLogDocRef = getBillableApiCallLogsCollectionRef({
    orgId,
  }).doc();
  await billableApiCallLogDocRef.set({
    id: billableApiCallLogDocRef.id,
    orgId,
    type: BillableApiCallLog.createPdf,
    createdAt: new Date(),
  });
}

export async function hasReachedMonthlyApiCallRateLimit({
  orgId,
}: {
  orgId: string;
}): Promise<boolean> {
  const count = await getBillableApiCallCountForMonth({
    orgId,
    date: new Date(),
  });
  return count >= RATE_LIMIT_SETTINGS.numPdfsGeneratedPerMonthPerOrg;
}
