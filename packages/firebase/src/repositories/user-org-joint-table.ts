import { getUserOrgJoinTableCollectionRef } from "../utils/collection-refs";
import type { UserOrgJoinTable_FsDoc } from "../utils/collections";

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
}): FirebaseFirestore.DocumentReference<UserOrgJoinTable_FsDoc> {
  return getUserOrgJoinTableCollectionRef().doc(
    getUserOrgJoinTableId({ uid, orgId })
  );
}
