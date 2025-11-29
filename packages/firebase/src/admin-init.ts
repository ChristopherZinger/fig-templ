import { AppError } from "@templetto/app-error";
import admin from "firebase-admin";
import z from "zod";

let app: undefined | admin.app.App;

const initFirebaseAdmin = ({
  bucketUri,
  googleApplicationCredentials,
}: {
  bucketUri: string;
  googleApplicationCredentials?: string;
}): {
  firestore: admin.firestore.Firestore;
  auth: admin.auth.Auth;
  storage: admin.storage.Storage;
} => {
  if (app) {
    return {
      firestore: admin.firestore(app),
      auth: admin.auth(app),
      storage: admin.storage(app),
    };
  }

  app = admin.apps.find((app) => !!app);
  if (app) {
    return {
      firestore: admin.firestore(app),
      auth: admin.auth(app),
      storage: admin.storage(app),
    };
  }

  const parseResult = z
    .object({
      storageBucket: z.string().nonempty(),
      credentialPath: z.string(),
    })
    .safeParse({
      storageBucket: bucketUri,
      credentialPath:
        googleApplicationCredentials ||
        process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });

  if (!parseResult.success) {
    throw new AppError("invalid_firebase_admin_config", {
      error: parseResult.error,
    });
  }

  app = admin.initializeApp({
    storageBucket: parseResult.data.storageBucket,
    credential: admin.credential.cert(parseResult.data.credentialPath),
  });
  const firestore = admin.firestore(app);
  firestore.settings({ databaseId: "templetto-db" });

  return {
    storage: admin.storage(app),
    firestore,
    auth: admin.auth(app),
  };
};

function expectApp() {
  if (!app) {
    throw new AppError("Firebase admin not initialized");
  }
  return app;
}

function getStorage() {
  return expectApp().storage();
}

function getFirestore() {
  return expectApp().firestore();
}

function getAuth() {
  return expectApp().auth();
}

export { getStorage, getFirestore, getAuth, initFirebaseAdmin };
