// ==================================
// Session Heartbeat (GLOBAL VERSION)
// ==================================

let __heartbeatTimer = null;
const HEARTBEAT_INTERVAL = 10000;

// ==================================
// Check session once
// ==================================

// ==================================
// Check session once (UX SAFE)
// ==================================
async function checkSessionOnce() {
  if (document.hidden) return;

  const res = await authFetch(API + "/me", { silent: true });

  if (!res) {
    setTimeout(() => {
      location.replace("./login.html");
    }, 500);
  }
}

// ==================================
// Start heartbeat
// ==================================
function startSessionHeartbeat() {
  if (__heartbeatTimer) return;

  __heartbeatTimer = setInterval(checkSessionOnce, HEARTBEAT_INTERVAL);

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      checkSessionOnce();
    }
  });
}

// ==================================
// Stop heartbeat
// ==================================
function stopSessionHeartbeat() {
  if (__heartbeatTimer) {
    clearInterval(__heartbeatTimer);
    __heartbeatTimer = null;
  }
}

// 🔥 expose global
window.startSessionHeartbeat = startSessionHeartbeat;
window.stopSessionHeartbeat = stopSessionHeartbeat;
