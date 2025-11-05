import admin from "firebase-admin";

let app: undefined | admin.app.App;

const initFirebaseAdmin = (): {
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

  app = admin.initializeApp();
  const firestore = admin.firestore(app);
  firestore.settings({ databaseId: "templetto-db" });

  return {
    storage: admin.storage(app),
    firestore,
    auth: admin.auth(app),
  };
};

const { storage, firestore, auth } = initFirebaseAdmin();

export { storage, firestore, auth };
