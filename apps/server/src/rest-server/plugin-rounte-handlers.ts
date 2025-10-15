import type { Request, Response } from "express";
import { firestore } from "../utils/firebase";
import { v4 as uuidv4 } from "uuid";
import z from "zod";

const pkceKeyCollectionName = "pkceKeys";
type PkceKeyDoc = {
  createdAt: number;
  readKey: string;
  writeKey: string;
  expiresAt: Date;
  hasUsedReadKey: boolean;
  userSessionId: string | null;
};
const pkceKeyCollectionRef = firestore.collection(pkceKeyCollectionName);

const userSessionCollectionName = "user-sessions";
type UserSessionDoc = {
  createdAt: number;
  sessionToken: string;
  pkceKeyId: string;
};
const userSessionCollectionRef = firestore.collection(
  userSessionCollectionName
);

export async function getPkceKeysHandler(_: Request, res: Response) {
  // TODO check if request comes from templetto.com/plugin/login

  const EXPIRATION_TIME = 1000 * 60 * 10; // 10 minutes
  const now = Date.now();
  const pkceKey = {
    readKey: uuidv4(),
    writeKey: uuidv4(),
    expiresAt: new Date(now + EXPIRATION_TIME),
  };

  const docRef = pkceKeyCollectionRef.doc(pkceKey.readKey);

  // TODO: create retry mechanism if read key already exists
  await firestore.runTransaction(async (t) => {
    const pkceKeyDoc = await t.get(docRef);
    if (pkceKeyDoc.exists) {
      throw new Error("read_key_already_exists");
    }
    t.set(docRef, {
      ...pkceKey,
      createdAt: now,
      hasUsedReadKey: false,
      userSessionId: null,
    } satisfies PkceKeyDoc);
  });

  res.status(200).json(pkceKey);
}

export async function readSessionTokenHandler(req: Request, res: Response) {
  const parsedBody = z
    .object({
      readKey: z.string(),
    })
    .safeParse(req.body);

  if (!parsedBody.success) {
    res.status(400).json({ error: "invalid_request" });
    return;
  }

  const readKey = parsedBody.data.readKey;

  try {
    const sessionToken = await firestore.runTransaction(async (t) => {
      const pkceDocRef = firestore
        .collection(pkceKeyCollectionName)
        .doc(readKey);
      const pkceKeyDoc = (await t.get(pkceDocRef)).data() as
        | PkceKeyDoc
        | undefined; // TODO:  handle types once we have database package
      if (!pkceKeyDoc) {
        throw new Error("expected_pkce_key_doc");
      }

      // TODO: test this
      if (pkceKeyDoc.expiresAt < new Date()) {
        throw new Error("pkce_key_expired");
      }

      const { userSessionId } = pkceKeyDoc;
      if (!userSessionId) {
        return null;
      }

      const userSessionDocRef = userSessionCollectionRef.doc(userSessionId);
      const userSessionDoc = (await t.get(userSessionDocRef)).data() as
        | UserSessionDoc
        | undefined;
      if (!userSessionDoc) {
        throw new Error("expected_user_session_doc_for_id");
      }

      t.delete(pkceDocRef);

      const { sessionToken } = userSessionDoc;
      return sessionToken;
    });
    res.status(200).json({ sessionToken });
  } catch (error) {
    res.status(500).json({ error: "failed_to_read_session_token" });
  }
}
