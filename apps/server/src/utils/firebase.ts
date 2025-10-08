import admin from "firebase-admin";

const PROJECT_ID = process.env.GCLOUD_PROJECT_ID;

const initFirebaseAdmin = () => {
  const app = admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: PROJECT_ID,
  });

  const firestore = app.firestore();
  firestore.settings({ databaseId: "templetto-db" });

  return {
    storage: app.storage(),
    firestore,
    auth: app.auth(),
  };
};

const { storage, firestore, auth } = initFirebaseAdmin();

export { storage, firestore, auth };
