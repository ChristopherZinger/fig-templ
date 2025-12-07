import firebaseConfig from "../../../firebase.config.json"
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"

const pluginApp = initializeApp(firebaseConfig, "plugin-auth")
const pluginAuth = getAuth(pluginApp)

export { pluginAuth }
