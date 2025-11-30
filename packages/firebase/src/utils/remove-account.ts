import { AppError } from "@templetto/app-error";
import { getAuth, getFirestore } from "../admin-init";
import { getBucket } from "./storage";
import {
  getArtifactsCollectionRef,
  getBillableApiCallLogsCollectionRef,
  getOrgApiTokensCollectionRef,
  getOrgCollectionRef,
  getPluginSessionTokensCollectionRef,
  getTemplatesCollectionRef,
  getUserOrgJoinTableCollectionRef,
  getUsersCollectionRef,
} from "./collection-refs";

export async function removeUserAccount(uid: string) {
  const orgId = await getFirestore().runTransaction(async (t) => {
    const userDoc = (await t.get(getUsersCollectionRef().doc(uid))).data();

    if (!userDoc) {
      throw new AppError("user_not_found", { uid });
    }

    const orgId = userDoc.defaultOrgId;
    const [
      userOrgJoinTableRefs,
      templatesRefs,
      artifactsRefs,
      apiTokensRefs,
      billableApiCallLogsRefs,
      pluginSessionTokensRefs,
    ] = await Promise.all([
      t.get(getUserOrgJoinTableCollectionRef().where("uid", "==", uid)),
      t.get(getTemplatesCollectionRef({ orgId })),
      t.get(getArtifactsCollectionRef({ orgId })),
      t.get(getOrgApiTokensCollectionRef().where("orgId", "==", orgId)),
      t.get(getBillableApiCallLogsCollectionRef({ orgId })),
      t.get(getPluginSessionTokensCollectionRef().where("uid", "==", uid)),
    ]);

    const refsToDelete = [
      getUsersCollectionRef().doc(uid),
      getOrgCollectionRef().doc(orgId),
      ...userOrgJoinTableRefs.docs.map((doc) => doc.ref),
      ...templatesRefs.docs.map((doc) => doc.ref),
      ...artifactsRefs.docs.map((doc) => doc.ref),
      ...apiTokensRefs.docs.map((doc) => doc.ref),
      ...billableApiCallLogsRefs.docs.map((doc) => doc.ref),
      ...pluginSessionTokensRefs.docs.map((doc) => doc.ref),
    ];

    refsToDelete.forEach((ref) => {
      t.delete(ref);
    });

    return orgId;
  });

  await Promise.all([
    getAuth().deleteUser(uid),
    getBucket().deleteFiles({
      prefix: `organizations/${orgId}`,
    }),
  ]);
}
