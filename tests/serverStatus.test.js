import assert from "node:assert/strict";
import { afterEach, beforeEach, mock, test } from "node:test";
import { API_BASE, apiUrl, normalizeBase } from "../src/lib/endpoint.js";
import {
  checkServer,
  classifyHealth,
  healthUrl,
} from "../src/lib/serverStatus.js";

beforeEach(() => {
  mock.method(globalThis, "fetch", async () => {
    assert.fail("Unexpected fetch: stub every request in these tests.");
  });
});

afterEach(() => {
  mock.restoreAll();
});

function stubFetch(...responses) {
  let index = 0;
  globalThis.fetch.mock.mockImplementation(async (url, options) => {
    assert.ok(index < responses.length, `Unexpected fetch to ${url}`);
    const response = responses[index++];
    return typeof response === "function" ? response(url, options) : response;
  });
  return globalThis.fetch.mock;
}

function pendingUntilAborted() {
  return (_url, { signal }) =>
    new Promise((_resolve, reject) => {
      signal.addEventListener("abort", () => reject(signal.reason), {
        once: true,
      });
    });
}

test("normalizeBase falls back to /api and strips trailing slashes", () => {
  assert.equal(normalizeBase(""), "/api");
  assert.equal(normalizeBase("   "), "/api");
  assert.equal(normalizeBase("https://be.sawitq.my.id/api/"), "https://be.sawitq.my.id/api");
  assert.equal(normalizeBase("/api///"), "/api");
});

test("apiUrl and healthUrl join the configured base without double slashes", () => {
  assert.equal(API_BASE, "/api");
  assert.equal(apiUrl("/health"), "/api/health");
  assert.equal(apiUrl("health"), "/api/health");
  assert.equal(healthUrl(), "/api/health");
});

test("classifyHealth only accepts 2xx responses with status ok", () => {
  assert.equal(classifyHealth({ ok: true, payload: { status: "ok" } }), "online");
  assert.equal(classifyHealth({ ok: true, payload: { status: false } }), "offline");
  assert.equal(classifyHealth({ ok: false, payload: { status: "ok" } }), "offline");
  assert.equal(classifyHealth({ ok: true, payload: null }), "offline");
});

test("checkServer reports online with latency, database and version", async () => {
  const fetchMock = stubFetch(
    Response.json({
      status: "ok",
      database: "connected",
      version: "12.71.0",
    }),
  );

  const result = await checkServer();

  assert.equal(result.state, "online");
  assert.equal(result.checking, false);
  assert.equal(result.httpStatus, 200);
  assert.equal(result.database, "connected");
  assert.equal(result.version, "12.71.0");
  assert.equal(result.message, "");
  assert.ok(result.latencyMs >= 0);
  assert.match(result.checkedAt, /^\d{4}-\d{2}-\d{2}T/);
  assert.equal(fetchMock.calls[0].arguments[0], "/api/health");
  assert.equal(fetchMock.calls[0].arguments[1].method, "GET");
});

test("checkServer reports offline when the static host answers 404", async () => {
  stubFetch(new Response("<html>Not Found</html>", { status: 404 }));

  const result = await checkServer();

  assert.equal(result.state, "offline");
  assert.equal(result.httpStatus, 404);
  assert.match(result.message, /HTTP 404/);
});

test("checkServer reports offline on a network failure", async () => {
  stubFetch(() => {
    throw new TypeError("Synthetic network failure");
  });

  const result = await checkServer();

  assert.equal(result.state, "offline");
  assert.equal(result.httpStatus, 0);
  assert.match(result.message, /Tidak dapat menghubungi backend/);
});

test("checkServer reports offline when the health check times out", async () => {
  stubFetch(pendingUntilAborted());

  const result = await checkServer({ timeoutMs: 10 });

  assert.equal(result.state, "offline");
  assert.match(result.message, /tidak merespons/);
});

test("checkServer forwards caller cancellation instead of returning offline", async () => {
  stubFetch(pendingUntilAborted());
  const controller = new AbortController();
  const reason = new Error("Caller cancelled");

  const result = checkServer({ signal: controller.signal });
  controller.abort(reason);

  await assert.rejects(result, (error) => error === reason);
});
