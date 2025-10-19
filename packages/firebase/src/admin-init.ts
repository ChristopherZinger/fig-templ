import admin from "firebase-admin";

const initFirebaseAdmin = () => {
  const app = admin.initializeApp({});

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
