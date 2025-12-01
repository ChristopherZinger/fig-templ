import { getContactUsMessagesCollectionRef } from "../utils/collection-refs";

export async function createContactUsMessage({
  email,
  phone,
  company,
  fullName,
  message,
}: {
  email: string;
  phone?: string;
  company?: string;
  fullName: string;
  message: string;
}): Promise<void> {
  const docRef = getContactUsMessagesCollectionRef().doc();
  await docRef.set({
    id: docRef.id,
    email,
    phone: phone ?? null,
    company: company ?? null,
    fullName,
    message,
    createdAt: new Date(),
  });
}
