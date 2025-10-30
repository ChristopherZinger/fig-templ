import type { Request, Response } from "express";
import {
  auth,
  firestore,
  getBucket,
  getOrgCollectionRef,
  getPkceKeysCollectionRef,
  getPluginSessionTokensCollectionRef,
  getTemplatesCollectionRef,
  getUserOrgJoinTableCollectionRef,
  PkceKey_FsDoc,
} from "@templetto/firebase";
import { v4 as uuidv4 } from "uuid";
import z from "zod";
import { log } from "@templetto/logging";
import type { DecodedIdToken } from "firebase-admin/auth";
import type { DocumentReference, Transaction } from "firebase-admin/firestore";
import { expectPluginSessionUid } from "../utils/plugin-session-token";
import { AppError } from "@templetto/app-error";

export async function getPkceKeysHandler(_: Request, res: Response) {
  // TODO check if request comes from templetto.com/plugin/login

  const EXPIRATION_TIME = 1000 * 60 * 10; // 10 minutes
  const now = new Date();
  const pkceKey = {
    readKey: uuidv4(),
    writeKey: uuidv4(),
    expiresAt: new Date(Date.now() + EXPIRATION_TIME),
  };

  const docRef = getPkceKeysCollectionRef().doc(pkceKey.writeKey);

  // TODO: create retry mechanism if read key already exists
  await firestore.runTransaction(async (t) => {
    const pkceKeyDoc = await t.get(docRef);
    if (pkceKeyDoc.exists) {
      throw new AppError("read_key_already_exists", { docPath: docRef.path });
    }
    t.set(docRef, {
      ...pkceKey,
      createdAt: new Date(now),
      hasUsedReadKey: false,
      userSessionId: null,
    });
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
      const pkceDocRef = getPkceKeysCollectionRef().doc(writeKey);
      const pkceKeyDoc = (await t.get(pkceDocRef)).data();
      if (!pkceKeyDoc) {
        throw new AppError("expected_pkce_key_doc");
      }

      // TODO: test this
      // if (pkceKeyDoc.expiresAt < new Date()) {
      //   throw new Error("pkce_key_expired");
      // }

      const { userSessionId } = pkceKeyDoc;
      if (!userSessionId) {
        return null;
      }

      const userSessionCollectionRef = getPluginSessionTokensCollectionRef();
      const userSessionDocRef = userSessionCollectionRef.doc(userSessionId);
      const userSessionDoc = (await t.get(userSessionDocRef)).data();
      if (!userSessionDoc) {
        throw new AppError("expected_user_session_doc_for_id");
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

    const pluginSessionTokenCollectionRef =
      getPluginSessionTokensCollectionRef();
    const userSessionDocRef = pluginSessionTokenCollectionRef.doc();
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

async function getValidPkcdKeyDocForWriteKey(
  writeKey: string,
  t: Transaction
): Promise<DocumentReference<PkceKey_FsDoc> | null> {
  const pkceKeyDocRef = getPkceKeysCollectionRef().doc(writeKey);
  const pkceKeyDoc = (await t.get(pkceKeyDocRef)).data();

  if (
    !pkceKeyDoc ||
    // TODO: pkceKeyDoc.expiresAt < new Date() ||
    !!pkceKeyDoc.userSessionId
  ) {
    return null;
  }

  return pkceKeyDocRef;
}

export async function logoutHandler(req: Request, res: Response) {
  log.info("logout_request", { request: req.body });
  const parsingResult = z
    .object({ sessionToken: z.string() })
    .safeParse(req.body);

  if (!parsingResult.success) {
    log.debug("failed_to_parse_request_body", { error: parsingResult.error });
    res.status(400).json({ error: "invalid_request" });
    return;
  }

  const { sessionToken } = parsingResult.data;

  await firestore.runTransaction(async (t) => {
    const userSessionCollectionRef = getPluginSessionTokensCollectionRef();
    const userSessionSnapshots = (
      await userSessionCollectionRef
        .where("sessionToken", "==", sessionToken)
        .get()
    ).docs;

    if (userSessionSnapshots.length === 0) {
      log.warn("no_user_session_doc_found_for_session_token", { sessionToken });
    } else if (userSessionSnapshots.length > 1) {
      log.error("multiple_user_session_docs_found_for_session_token", {
        sessionToken,
        numUserSessionDocs: userSessionSnapshots.length,
      });
    }

    userSessionSnapshots.forEach((s) => {
      t.delete(s.ref);
    });
  });

  res.status(200).json({ message: "session_token_removed" });
}

export async function getOrganizationsHandler(req: Request, res: Response) {
  const uid = expectPluginSessionUid(req);

  const userOrgs = (
    await getUserOrgJoinTableCollectionRef().where("uid", "==", uid).get()
  ).docs.map((doc) => doc.data());

  const orgs = await Promise.all(
    userOrgs.map(async ({ orgId }) => {
      const orgDoc = await getOrgCollectionRef().doc(orgId).get();
      return orgDoc.data();
    })
  );

  res.status(200).json(orgs);
}

export async function getTemplatesHandler(req: Request, res: Response) {
  const uid = expectPluginSessionUid(req);

  const parseResult = z.object({ orgId: z.string() }).safeParse(req.query);
  if (!parseResult.success) {
    res.status(400).json({ error: "invalid_request" });
    return;
  }
  const { orgId } = parseResult.data;

  try {
    await firestore.runTransaction(async (t) => {
      const [userOrgJoinTableDoc, templatesDoc] = await Promise.all([
        t.get(getUserOrgJoinTableCollectionRef().doc(`${uid}:${orgId}`)),
        t.get(getTemplatesCollectionRef({ orgId })),
      ]);

      if (!userOrgJoinTableDoc.exists) {
        throw new AppError("unauthorized");
      }

      res.status(200).json(templatesDoc.docs.map((doc) => doc.data()));
      return;
    });
  } catch (error) {
    log.error("failed_to_get_templates", { error });
    if (error instanceof Error && error.message === "unauthorized") {
      res.status(401).json({ error: "unauthorized" });
      return;
    }
    res.status(500).json({ error: "failed_to_get_templates" });
    return;
  }
}

export async function createTemplateHandler(req: Request, res: Response) {
  const uid = expectPluginSessionUid(req);

  const parsingResult = z
    .object({ templateHtml: z.string(), orgId: z.string() })
    .safeParse(req.body);
  if (!parsingResult.success) {
    res.status(400).json({ error: "invalid_request" });
    return;
  }
  const { templateHtml, orgId } = parsingResult.data;

  try {
    const newTemplateId = await firestore.runTransaction(async (t) => {
      const userOrgJoinTableDoc = await t.get(
        getUserOrgJoinTableCollectionRef().doc(`${uid}:${orgId}`)
      );
      if (!userOrgJoinTableDoc.exists) {
        log.debug("missin_org_for_user");
        throw new AppError("unauthorized");
      }

      const templatesCollectionRef = getTemplatesCollectionRef({ orgId });
      const newTemplateDocRef = templatesCollectionRef.doc();

      const pathInStorage = `organizations/${orgId}/templates/${newTemplateDocRef.id}.html`;

      t.set(newTemplateDocRef, {
        id: newTemplateDocRef.id,
        orgId,
        pathInStorage,
        downloadUrl: null,
      });

      await getBucket().file(pathInStorage).save(templateHtml);

      return newTemplateDocRef.id;
    });

    res
      .status(201)
      .json({ message: "template_created", id: newTemplateId, orgId });
  } catch (error) {
    log.error("failed_to_create_template", { error });
    if (error instanceof Error && error.message === "unauthorized") {
      log.debug("unauthorized");
      res.status(401).json({ error: "unauthorized" });
      return;
    }
    res.status(500).json({ error: "failed_to_create_template" });
    return;
  }
}
