import { firestore } from "../admin-init";
import { getEmailSubscriptionsCollectionRef } from "../utils/collection-refs";
import { AppError } from "@templetto/app-error";

export async function upsertEmailSubscription({
  email,
}: {
  email: string;
}): Promise<void> {
  await firestore.runTransaction(async (t) => {
    const lowerCaseEmail = email.toLowerCase();
    const emailSubscriptionDocRef = getEmailSubscriptionsCollectionRef()
      .where("email", "==", lowerCaseEmail)
      .limit(2);

    const emailSubscriptionSnaps = (await t.get(emailSubscriptionDocRef)).docs;
    if (emailSubscriptionSnaps.length === 0) {
      await t.set(getEmailSubscriptionsCollectionRef().doc(), {
        email: lowerCaseEmail,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return;
    } else if (emailSubscriptionSnaps.length > 1) {
      throw new AppError("multiple_email_subscriptions_found", { email });
    }

    await t.update(emailSubscriptionSnaps[0].ref, {
      updatedAt: new Date(),
    });
  });
}
