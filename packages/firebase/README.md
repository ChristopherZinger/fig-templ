# @templetto/firebase

Shared Firebase and Firestore utilities for Templetto applications.

## Installation

This package is part of the Templetto monorepo and uses npm workspaces. To use it in any app:

```json
{
  "dependencies": {
    "@templetto/firebase": "*"
  }
}
```

Then run `npm install` from the workspace root.

## Usage

### Firebase Admin SDK

```typescript
import { storage, firestore, auth } from "@templetto/firebase";

// Use Firebase Admin SDK services
const bucket = storage.bucket("my-bucket");
const usersCollection = firestore.collection("users");
const userRecord = await auth.getUser(uid);
```

### Firebase Storage Utilities

```typescript
import { getBucket, pushToStorage } from "@templetto/firebase";

// Get the default bucket
const bucket = getBucket();

// Upload a file to storage
await pushToStorage({
  localFilePath: "/path/to/local/file.pdf",
  destinationInStorage: "outputs/file.pdf"
});
```

## Environment Variables

The package requires the following environment variables:

- `GCLOUD_PROJECT_ID` - Google Cloud Project ID
- `FIREBASE_STORAGE_BUCKET_NAME` - Firebase Storage bucket name (format: `gs://bucket-name`)
- `NODE_ENV` - Set to "production" for production mode, otherwise runs in local/dev mode
- `GOOGLE_APPLICATION_CREDENTIALS` - Path to service account key (production only)

In development mode, the package will automatically load `.env` files using dotenv.

## Features

- **Automatic initialization**: Firebase Admin SDK is initialized once when the package is imported
- **Firestore configuration**: Automatically configured to use the `templetto-db` database
- **Environment-aware**: Handles both local development and production environments
- **Type-safe**: Full TypeScript support
