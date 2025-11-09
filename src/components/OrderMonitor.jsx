import { addDoc, collection } from "firebase/firestore";

const handleStatusChange = async (orderId, status, o) => {
  await updateDoc(doc(db, "orders", orderId), { status });

  if (status === "Selesai") {
    const mitraShare = o.price * 0.75;
    const coreShare = o.price * 0.25;

    await addDoc(collection(db, "transactions"), {
      orderId: o.orderId,
      mitraId: o.mitraId,
      amount: o.price,
      mitraShare,
      coreShare,
      createdAt: new Date().toISOString(),
      destinationBank: "BRI 035901073215504 a/n Abdurrahman Hanif",
    });
  }
};
