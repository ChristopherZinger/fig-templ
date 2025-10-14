import admin from "firebase-admin"

const firebaseAdmin = admin.initializeApp({})
const authAdmin = firebaseAdmin.auth()

export { firebaseAdmin, authAdmin }
