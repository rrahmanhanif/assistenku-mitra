export const endpoints = {
  auth: {
    whoami: "/api/auth/whoami",
  },

  mitra: {
    worklogs: "/api/mitra/worklogs",
  },

  orders: {
    listAssigned: "/api/orders/list?scope=assigned",
    detail: (orderId) => `/api/orders/${orderId}`,
    events: (orderId) => `/api/orders/${orderId}/events`,
    checkin: "/api/orders/checkin",
    complete: "/api/orders/complete",
    evidenceUpload: "/api/evidence/upload",
    evidenceCommit: (orderId) =>
      `/api/orders/${orderId}/evidence/commit`,
    evidenceList: (orderId) =>
      `/api/orders/${orderId}/evidence`,
  },

  payouts: {
    summary: "/api/payouts/summary",
    request: "/api/payouts/request",
    list: "/api/payouts/list",
  },

  services: {
    list: "/api/services/list",
  },
};
