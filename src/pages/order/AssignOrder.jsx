update(ref(db, "orders/" + orderId), {
  mitraId: selectedMitraId,
  status: "assigned",
});
