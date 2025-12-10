import { getTemplatesCollectionRef } from "../utils/collection-refs";
import { getBucket } from "../utils/storage";
import { assertAccessToOrg } from "./user";
import { pipeline } from "stream/promises";
import fs from "fs";
import path from "path";
import { getFirestore, type Transaction } from "firebase-admin/firestore";
import type { Template_FsDoc } from "../utils/collections";
import { RATE_LIMIT_SETTINGS } from "@templetto/settings";
import { RateLimitError } from "@templetto/app-error";
import slugify from "slugify"; // TODO: install it here

export async function getUserTemplateDoc(
  {
    orgId,
    userId,
    templateId,
  }: {
    orgId: string;
    userId: string;
    templateId: string;
  },
  t: Transaction
): Promise<Template_FsDoc | null> {
  await assertAccessToOrg({ orgId, uid: userId }, t);

  const templateRef = getTemplatesCollectionRef({ orgId }).doc(templateId);
  const templateDoc = (await t.get(templateRef)).data();

  return templateDoc || null;
}

function getTmpFolder() {
  const TEMPL_DIR = path.join("/tmp", "templetto");
  const tmpPath = path.join(TEMPL_DIR, Date.now().toString());
  fs.mkdirSync(tmpPath, { recursive: true });

  return {
    tmpPath,
    cleanup: () => {
      console.log("cleaning up", tmpPath);
      fs.rmSync(tmpPath, { recursive: true });
    },
  };
}

export async function getTemplateContents(
  {
    orgId,
    userId,
    templateId,
  }: {
    orgId: string;
    userId: string;
    templateId: string;
  },
  t: Transaction
): Promise<string | null> {
  await assertAccessToOrg({ orgId, uid: userId }, t);

  const templateRef = getTemplatesCollectionRef({ orgId }).doc(templateId);
  const templateDoc = (await t.get(templateRef)).data();

  const pathInStorage = templateDoc?.pathInStorage || null;
  if (!pathInStorage) {
    return null;
  }

  const templateFileRef = getBucket().file(pathInStorage);
  if (!(await templateFileRef.exists())) {
    return null;
  }

  const { tmpPath, cleanup } = getTmpFolder();
  const filePath = path.join(tmpPath, "output.html");
  await pipeline(
    templateFileRef.createReadStream(),
    fs.createWriteStream(filePath)
  );
  const htmlString = fs.readFileSync(filePath, "utf-8");

  cleanup();

  return htmlString;
}

export async function createTemplate({
  orgId,
  uid,
  templateHtml,
  dimensions,
  name,
}: {
  orgId: string;
  uid: string;
  templateHtml: string;
  name: string;
  dimensions: {
    widthPx: number;
    heightPx: number;
  };
}): Promise<string> {
  return await getFirestore().runTransaction(async (t) => {
    await assertAccessToOrg({ uid, orgId }, t);

    const templatesCollectionRef = getTemplatesCollectionRef({ orgId });
    const newTemplateDocRef = templatesCollectionRef.doc();

    const countQuery = templatesCollectionRef.count();
    const count = (await t.get(countQuery)).data().count;
    if (count >= RATE_LIMIT_SETTINGS.numTemplatesPerOrg) {
      throw new RateLimitError("num_templates_per_org_reached", "templates", {
        orgId,
      });
    }

    const pathInStorage = `organizations/${orgId}/templates/${newTemplateDocRef.id}.html`;

    t.set(newTemplateDocRef, {
      id: newTemplateDocRef.id,
      orgId,
      pathInStorage,
      downloadUrl: null,
      name: name || "Untitled",
      createdAt: new Date(),
      dimensions,
    });

    const fileName = slugify(name, {
      lower: true,
      strict: true, // strip special characters except replacement, defaults to `false`
    });
    await getBucket()
      .file(pathInStorage)
      .save(templateHtml, {
        metadata: {
          contentType: "text/html",
          contentDisposition: `attachment; filename="${fileName}.html"`,
        },
      });

    return newTemplateDocRef.id;
  });
}
