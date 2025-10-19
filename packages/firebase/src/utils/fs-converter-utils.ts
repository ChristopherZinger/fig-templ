import type {
  FirestoreDataConverter,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import z from "zod";

export function getParsedConverter<
  T extends Record<string | number | symbol, unknown>,
>(parser: z.ZodSchema<T>): FirestoreDataConverter<T> {
  return {
    toFirestore(data): DocumentData {
      return parser.parse(data);
    },
    fromFirestore(snapshot: QueryDocumentSnapshot): T {
      return parser.parse(snapshot.data());
    },
  };
}
