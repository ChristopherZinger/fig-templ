import { getUserOrgJoinTableCollectionRef } from "../utils/collection-refs";

export function getUserOrgJoinTableId({
  uid,
  orgId,
}: {
  uid: string;
  orgId: string;
}) {
  return `${uid}:${orgId}`;
}

export function getUserOrgJoinTableDocRef({
  uid,
  orgId,
}: {
  uid: string;
  orgId: string;
}) {
  return getUserOrgJoinTableCollectionRef().doc(
    getUserOrgJoinTableId({ uid, orgId })
  );
}
