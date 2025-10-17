import type { Request, Response } from "express";
import { firestore, auth } from "../utils/firebase";
import { v4 as uuidv4 } from "uuid";
import z from "zod";
import { log } from "@templetto/logging";
import { DecodedIdToken } from "firebase-admin/auth";
import { Transaction } from "firebase-admin/firestore";

const pkceKeyCollectionName = "pkceKeys";
type PkceKeyDoc = {
  readKey: string;
  writeKey: string;
  createdAt: Date;
  expiresAt: Date;
  hasUsedReadKey: boolean;
  userSessionId: string | null;
};
const pkceKeyCollectionRef = firestore.collection(pkceKeyCollectionName);

const userSessionCollectionName = "user-sessions";
type UserSessionDoc = {
  sessionToken: string;
  createdAt: Date;
  expiresAt: Date;
  uid: string;
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

  const docRef = pkceKeyCollectionRef.doc(pkceKey.writeKey);

  // TODO: create retry mechanism if read key already exists
  await firestore.runTransaction(async (t) => {
    const pkceKeyDoc = await t.get(docRef);
    if (pkceKeyDoc.exists) {
      throw new Error("read_key_already_exists");
    }
    t.set(docRef, {
      ...pkceKey,
      createdAt: new Date(now),
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
      writeKey: z.string(),
    })
    .safeParse(req.body);

  if (!parsedBody.success) {
    res.status(400).json({ error: "invalid_request" });
    return;
  }

  const { writeKey } = parsedBody.data;

  try {
    const sessionToken = await firestore.runTransaction(async (t) => {
      const pkceDocRef = firestore
        .collection(pkceKeyCollectionName)
        .doc(writeKey);
      const pkceKeyDoc = (await t.get(pkceDocRef)).data() as
        | PkceKeyDoc
        | undefined; // TODO:  handle types once we have database package
      if (!pkceKeyDoc) {
        throw new Error("expected_pkce_key_doc");
      }

      // TODO: test this
      // if (pkceKeyDoc.expiresAt < new Date()) {
      //   throw new Error("pkce_key_expired");
      // }

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
    res.status(200).json({ sessionKey: sessionToken });
  } catch (error) {
    res.status(500).json({ error: "failed_to_read_session_token" });
  }
}

export async function createSessionTokenHandler(req: Request, res: Response) {
  // TODO: csrf cookie -> https://firebase.google.com/docs/auth/admin/manage-cookiesLL
  const parsedBody = z
    .object({
      writeKey: z.string(),
      token: z.string(),
    })
    .safeParse(req.body);

  if (!parsedBody.success) {
    res.status(400).json({ error: "invalid_request" });
    return;
  }

  const { writeKey, token } = parsedBody.data;

  let decodedToken: DecodedIdToken | undefined;
  try {
    decodedToken = await auth.verifyIdToken(token);
  } catch (error) {
    log.error("failed_to_verify_id_token", { error });
    res.status(400).json({ error: "invalid_token" });
    return;
  }

  // creating session tokens requires service account with special privileges
  // TODO: figure safe way to run it locally
  auth.createCustomToken(decodedToken.uid);
  const sessionToken = await auth.createSessionCookie(token, {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
  });

  const success = await firestore.runTransaction(async (t) => {
    const pkceKeyDocRef = await getValidPkcdKeyDocForWriteKey(writeKey, t);
    if (!pkceKeyDocRef) {
      log.debug("invalid_write_key");
      return false;
    }

    const userSessionDocRef = userSessionCollectionRef.doc();
    t.update(pkceKeyDocRef, {
      userSessionId: userSessionDocRef.id,
    });

    t.set(userSessionDocRef, {
      sessionToken,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 60 * 60 * 24 * 14), // 14 days
      uid: decodedToken.uid,
    });

    return true;
  });

  if (!success) {
    res.status(400).json({ error: "invalid_write_key" });
    return;
  }

  res.status(200).json({ message: "session_token_created" });
  return;
}

// TODO: return type once firebase collections are well defined
async function getValidPkcdKeyDocForWriteKey(writeKey: string, t: Transaction) {
  const pkceKeyDocRef = pkceKeyCollectionRef.doc(writeKey);

  const pkceKeyDoc = (await t.get(pkceKeyDocRef)).data() as
    | PkceKeyDoc
    | undefined;

  console.log("pkceKeyDoc", { pkceKeyDoc });

  if (
    !pkceKeyDoc ||
    // TODO: pkceKeyDoc.expiresAt < new Date() ||
    !!pkceKeyDoc.userSessionId
  ) {
    return null;
  }

  return pkceKeyDocRef;
}
