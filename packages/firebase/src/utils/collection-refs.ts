import { firestore } from "../admin-init";
import { CollectionName } from "./collections";
import { getParsedConverter } from "./fs-converter-utils";
import type {
  DocumentReference,
  CollectionReference,
} from "firebase-admin/firestore";
import type {
  ApiToken_FsDoc,
  Artifact_FsDoc,
  Organization_FsDoc,
  PkceKey_FsDoc,
  PluginSessionToken_FsDoc,
  Template_FsDoc,
  User_FsDoc,
  UserOrgJoinTable_FsDoc,
} from "./collections";
import z from "zod";
import {
  apiTokenParser,
  artifactParser,
  organizationParser,
  pkceKeyParser,
  pluginSessionTokenParser,
  templateParser,
  userOrgJoinTableParser,
  userParser,
} from "./collection-parsers";

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

export function getUsersCollectionRef(): CollectionReference<User_FsDoc> {
  return getCollectionRef({
    collectionName: CollectionName.users,
    getBase: null,
    parser: userParser,
  });
}

export function getOrgCollectionRef(): CollectionReference<Organization_FsDoc> {
  return getCollectionRef({
    collectionName: CollectionName.organizations,
    getBase: null,
    parser: organizationParser,
  });
}

export function getUserOrgJoinTableCollectionRef(): CollectionReference<UserOrgJoinTable_FsDoc> {
  return getCollectionRef({
    collectionName: CollectionName.userOrgJoinTable,
    getBase: null,
    parser: userOrgJoinTableParser,
  });
}

export function getTemplatesCollectionRef({
  orgId,
}: {
  orgId: string;
}): CollectionReference<Template_FsDoc> {
  return getCollectionRef({
    collectionName: CollectionName.templates,
    getBase: () => getOrgCollectionRef().doc(orgId),
    parser: templateParser,
  });
}

export function getOrgApiTokensCollectionRef(): CollectionReference<ApiToken_FsDoc> {
  return getCollectionRef({
    collectionName: CollectionName.apiTokens,
    getBase: null,
    parser: apiTokenParser,
  });
}

export function getArtifactsCollectionRef({
  orgId,
}: {
  orgId: string;
}): CollectionReference<Artifact_FsDoc> {
  return getCollectionRef({
    collectionName: CollectionName.artifacts,
    getBase: () => getOrgCollectionRef().doc(orgId),
    parser: artifactParser,
  });
}
