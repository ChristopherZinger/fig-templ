import { firestore } from "../admin-init";
import { CollectionName } from "./collections";
import {
  getParsedConverter,
  // getTypeAssertionConverter,
} from "./fs-converter-utils";
import type {
  DocumentReference,
  CollectionReference,
} from "firebase-admin/firestore";
import type { PkceKey_FsDoc, PluginSessionToken_FsDoc } from "./collections";
import z from "zod";
import { pkceKeyParser, pluginSessionTokenParser } from "./collection-parsers";

function getCollectionRef<T extends Record<string, unknown>>({
  collectionName,
  getBase,
  parser,
}: {
  collectionName: CollectionName;
  getBase: (() => DocumentReference) | null;
  parser: z.ZodSchema<T>;
}): CollectionReference<T> {
  return (getBase?.() ?? firestore)
    .collection(collectionName)
    .withConverter(getParsedConverter(parser));
}

export function getPkceKeysCollectionRef(): CollectionReference<PkceKey_FsDoc> {
  return getCollectionRef({
    collectionName: CollectionName.pkceKeys,
    getBase: null,
    parser: pkceKeyParser,
  });
}

export function getPluginSessionTokensCollectionRef(): CollectionReference<PluginSessionToken_FsDoc> {
  return getCollectionRef({
    collectionName: CollectionName.pluginSessionTokens,
    getBase: null,
    parser: pluginSessionTokenParser,
  });
}
