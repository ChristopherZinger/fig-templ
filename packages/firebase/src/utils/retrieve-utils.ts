import { log } from "@templetto/logging";
import type { DocumentReference } from "firebase-admin/firestore";

export async function expectDocInCollection<T>(
  docRef: DocumentReference<T>
): Promise<T> {
  const doc = await docRef.get();
  if (!doc.exists) {
    log.debug("expected_doc_not_found", {
      id: docRef.id,
      collectionRef: docRef.parent?.path,
    });
    throw new Error("expected_doc_not_found");
  }
  return doc.data() as T;
}
