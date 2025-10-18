import admin from "firebase-admin";

// WARN: hast be run with service account for token creation!
// application default credentials are failing to create session tokens
// TODO: check if this can be mitigated with IAM permissions
const initFirebaseAdmin = () => {
  const app = admin.initializeApp({});

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
