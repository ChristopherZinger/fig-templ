import { getBackendConfigFlagsCollectionRef } from "../utils/collection-refs";

export enum BackendConfigFlag {
  isForcedShoutDown = "isForcedShoutDown",
  isComingSoon = "isComingSoon",
}

export async function getBackendConfigFlag(
  flagName: string
): Promise<boolean | null> {
  const backendConfigFlags = await getBackendConfigFlagsCollectionRef()
    .doc(flagName)
    .get();
  return backendConfigFlags.data()?.value ?? null;
}
