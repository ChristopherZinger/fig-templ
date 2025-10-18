import admin from "firebase-admin"
const initFirebaseAdmin = () => {
  const app = admin.initializeApp({})

  const firestore = app.firestore()
  firestore.settings({ databaseId: "templetto-db" })

  return {
    storage: app.storage(),
    firestore,
    auth: app.auth(),
  }
}

const { storage, firestore, auth } = initFirebaseAdmin()

export { storage, firestore, auth }
