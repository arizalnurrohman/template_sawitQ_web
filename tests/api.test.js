import assert from "node:assert/strict";
import { afterEach, beforeEach, mock, test } from "node:test";
import {
  ApiError,
  getCurrentAdmin,
  loginAdmin,
  request,
} from "../src/lib/api.js";

const admin = { id: 7, name: "Test Administrator", role: "admin" };
const testToken = "test-only-access-token";

// Tests run sequentially. Every fetch is mocked, including unexpected calls.
beforeEach(() => {
  mock.method(globalThis, "fetch", async () => {
    assert.fail(
      "Unexpected fetch: no network requests are allowed in these tests.",
    );
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

function matchesApiError(message, status = 0, code = null) {
  return (error) => {
    assert.ok(error instanceof ApiError);
    assert.equal(error.name, "ApiError");
    assert.equal(error.message, message);
    assert.equal(error.status, status);
    assert.equal(error.code, code);
    return true;
  };
}

const connectionMessage =
  "Tidak dapat terhubung ke server. Periksa koneksi dan layanan API.";
const invalidResponseMessage =
  "Respons API tidak valid. Periksa alamat server.";
const forbiddenMessage =
  "Akses ditolak. Akun ini tidak memiliki izin administrator.";
const nonAdminMessage =
  "Portal ini khusus administrator. Gunakan akun dengan role admin.";

test("ApiError extends Error and defaults to status zero and a null code", () => {
  const error = new ApiError("Test error");
  assert.ok(error instanceof Error);
  matchesApiError("Test error")(error);
});

test("ApiError preserves an explicit HTTP status and application code", () => {
  matchesApiError(
    "Maintenance",
    503,
    "MAINTENANCE_MODE",
  )(new ApiError("Maintenance", 503, "MAINTENANCE_MODE"));
});

test("request uses the API prefix, GET, JSON Accept, no cache and omitted credentials", async () => {
  const payload = { success: true, data: { total: 0 } };
  const fetchMock = stubFetch(Response.json(payload));

  assert.deepEqual(await request("/dashboard?range=week"), payload);
  assert.equal(fetchMock.callCount(), 1);
  const [url, options] = fetchMock.calls[0].arguments;
  assert.equal(url, "/api/dashboard?range=week");
  assert.equal(options.method, "GET");
  assert.equal(options.credentials, "omit");
  assert.equal(options.cache, "no-store");
  assert.deepEqual(options.headers, { Accept: "application/json" });
  assert.equal(Object.hasOwn(options, "body"), false);
  assert.ok(options.signal instanceof AbortSignal);
  assert.equal(options.signal.aborted, false);
});

test("request sends Bearer authorization and serializes a JSON body with the requested method", async () => {
  const body = { amount: 0, name: "Test", nested: { enabled: false } };
  const fetchMock = stubFetch(Response.json({ success: true }));

  await request("/settings", { token: testToken, method: "PATCH", body });
  const [url, options] = fetchMock.calls[0].arguments;
  assert.equal(url, "/api/settings");
  assert.equal(options.method, "PATCH");
  assert.equal(options.credentials, "omit");
  assert.deepEqual(options.headers, {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${testToken}`,
  });
  assert.equal(options.body, JSON.stringify(body));
});

for (const body of [null, false, 0, ""]) {
  test(`request serializes an explicitly supplied ${JSON.stringify(body)} body`, async () => {
    const fetchMock = stubFetch(Response.json({ success: true }));
    await request("/example", { method: "POST", body });
    const options = fetchMock.calls[0].arguments[1];
    assert.equal(options.body, JSON.stringify(body));
    assert.equal(options.headers["Content-Type"], "application/json");
  });
}

test("request omits authorization for absent or empty tokens and omits an undefined body", async () => {
  const fetchMock = stubFetch(
    ...Array.from({ length: 3 }, () => Response.json({})),
  );
  for (const token of [undefined, null, ""]) {
    await request("/public", { token, body: undefined });
  }
  assert.equal(fetchMock.callCount(), 3);
  for (const {
    arguments: [, options],
  } of fetchMock.calls) {
    assert.deepEqual(options.headers, { Accept: "application/json" });
    assert.equal(Object.hasOwn(options, "body"), false);
    assert.equal(options.credentials, "omit");
  }
});

test("loginAdmin trims only login, preserves password, identifies web, and returns token and user", async () => {
  const fetchMock = stubFetch(
    Response.json({
      success: true,
      data: { access_token: testToken, user: admin },
    }),
  );
  const password = "  synthetic password with spaces\t";

  assert.deepEqual(await loginAdmin(" \tadmin@example.test\n", password), {
    token: testToken,
    user: admin,
  });
  assert.equal(fetchMock.callCount(), 1);
  const [url, options] = fetchMock.calls[0].arguments;
  assert.equal(url, "/api/login");
  assert.equal(options.method, "POST");
  assert.equal(options.credentials, "omit");
  assert.deepEqual(options.headers, {
    Accept: "application/json",
    "Content-Type": "application/json",
  });
  const body = JSON.parse(options.body);
  assert.match(
    body.device_id,
    /^sawitq-web-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  );
  assert.deepEqual(body, {
    login: "admin@example.test",
    password,
    device_id: body.device_id,
    device_name: "SawitQ Admin Web",
    platform: "web",
  });
});

test("loginAdmin generates a distinct device ID on every login, including a failed attempt", async () => {
  const successfulLogin = () =>
    Response.json({ data: { access_token: testToken, user: admin } });
  const fetchMock = stubFetch(
    successfulLogin(),
    Response.json({ message: "Invalid credentials." }, { status: 401 }),
    successfulLogin(),
  );

  await loginAdmin("admin@example.test", "test-password");
  await assert.rejects(
    loginAdmin("admin@example.test", "test-password"),
    matchesApiError("Invalid credentials.", 401),
  );
  await loginAdmin("admin@example.test", "test-password");

  assert.equal(fetchMock.callCount(), 3);
  const ids = fetchMock.calls.map(({ arguments: [url, options] }) => {
    assert.equal(url, "/api/login");
    const body = JSON.parse(options.body);
    assert.equal(body.platform, "web");
    assert.match(body.device_id, /^sawitq-web-[0-9a-f-]{36}$/i);
    return body.device_id;
  });
  assert.equal(new Set(ids).size, 3);
});

for (const role of ["user", "manager", "Admin", undefined]) {
  test(`loginAdmin rejects role ${String(role)} and attempts authenticated server logout`, async () => {
    const fetchMock = stubFetch(
      Response.json({
        data: { access_token: testToken, user: { id: 8, role } },
      }),
      Response.json({ success: true }),
    );

    await assert.rejects(
      loginAdmin("user@example.test", "test-password"),
      matchesApiError(nonAdminMessage, 403),
    );
    assert.equal(fetchMock.callCount(), 2);
    const [url, options] = fetchMock.calls[1].arguments;
    assert.equal(url, "/api/logout");
    assert.equal(options.method, "POST");
    assert.equal(options.credentials, "omit");
    assert.deepEqual(options.headers, {
      Accept: "application/json",
      Authorization: `Bearer ${testToken}`,
    });
    assert.equal(Object.hasOwn(options, "body"), false);
  });
}

test("loginAdmin rejects a missing user and attempts logout", async () => {
  const fetchMock = stubFetch(
    Response.json({ data: { access_token: testToken } }),
    Response.json({ success: true }),
  );
  await assert.rejects(
    loginAdmin("user@example.test", "test-password"),
    matchesApiError(nonAdminMessage, 403),
  );
  assert.equal(fetchMock.callCount(), 2);
  assert.equal(fetchMock.calls[1].arguments[0], "/api/logout");
});

for (const failure of ["HTTP", "network"]) {
  test(`loginAdmin preserves the role rejection when logout fails with a ${failure} error`, async () => {
    const fetchMock = stubFetch(
      Response.json({
        data: { access_token: testToken, user: { role: "user" } },
      }),
      failure === "HTTP"
        ? Response.json({ message: "Logout unavailable." }, { status: 500 })
        : () => {
            throw new TypeError("Synthetic connection failure");
          },
    );

    await assert.rejects(
      loginAdmin("user@example.test", "test-password"),
      matchesApiError(nonAdminMessage, 403),
    );
    assert.equal(fetchMock.callCount(), 2);
    assert.equal(fetchMock.calls[1].arguments[0], "/api/logout");
    assert.equal(
      fetchMock.calls[1].arguments[1].headers.Authorization,
      `Bearer ${testToken}`,
    );
  });
}

for (const [description, payload] of [
  ["missing data", {}],
  ["null data", { data: null }],
  ["missing access_token", { data: { user: admin } }],
  ["empty access_token", { data: { access_token: "", user: admin } }],
  ["null access_token", { data: { access_token: null, user: admin } }],
  [
    "missing token on a non-admin response",
    { data: { user: { role: "user" } } },
  ],
]) {
  test(`loginAdmin rejects ${description} without attempting logout`, async () => {
    const fetchMock = stubFetch(Response.json(payload));
    await assert.rejects(
      loginAdmin("admin@example.test", "test-password"),
      matchesApiError("Token login tidak ditemukan dalam respons API."),
    );
    assert.equal(fetchMock.callCount(), 1);
  });
}

test("getCurrentAdmin requests /me with the token and returns only the administrator user", async () => {
  const controller = new AbortController();
  const fetchMock = stubFetch(
    Response.json({ success: true, data: { user: admin }, message: "OK" }),
  );

  assert.deepEqual(await getCurrentAdmin(testToken, controller.signal), admin);
  assert.equal(fetchMock.callCount(), 1);
  const [url, options] = fetchMock.calls[0].arguments;
  assert.equal(url, "/api/me");
  assert.equal(options.method, "GET");
  assert.equal(options.credentials, "omit");
  assert.deepEqual(options.headers, {
    Accept: "application/json",
    Authorization: `Bearer ${testToken}`,
  });
  assert.ok(options.signal instanceof AbortSignal);
  assert.equal(options.signal.aborted, false);
  controller.abort();
  assert.equal(options.signal.aborted, true);
  assert.equal(options.signal.reason, controller.signal.reason);
});

for (const [description, payload] of [
  ["non-admin", { data: { user: { role: "user" } } }],
  ["case-mismatched role", { data: { user: { role: "Admin" } } }],
  ["missing role", { data: { user: {} } }],
  ["missing user", { data: {} }],
  ["null user", { data: { user: null } }],
  ["missing data", {}],
]) {
  test(`getCurrentAdmin rejects ${description} without logging out`, async () => {
    const fetchMock = stubFetch(Response.json(payload));
    await assert.rejects(
      getCurrentAdmin(testToken),
      matchesApiError(
        "Akses administrator tidak lagi tersedia untuk akun ini.",
        403,
      ),
    );
    assert.equal(fetchMock.callCount(), 1);
  });
}

test("request uses the first Laravel 422 validation error ahead of the generic message", async () => {
  stubFetch(
    Response.json(
      {
        message: "The given data was invalid.",
        errors: {
          login: ["The login field is required.", "Another login error."],
          password: ["The password field is required."],
        },
      },
      { status: 422 },
    ),
  );

  await assert.rejects(
    request("/login", { method: "POST", body: {} }),
    matchesApiError("The login field is required.", 422),
  );
});

test("request falls back to the server message when validation errors are empty", async () => {
  stubFetch(
    Response.json(
      { message: "Validation failed.", errors: {} },
      { status: 422 },
    ),
  );
  await assert.rejects(
    request("/example"),
    matchesApiError("Validation failed.", 422),
  );
});

test("request preserves the maintenance 503 message and application code", async () => {
  stubFetch(
    Response.json(
      {
        success: false,
        message: "Layanan sedang dalam pemeliharaan.",
        code: "MAINTENANCE_MODE",
      },
      { status: 503 },
    ),
  );

  await assert.rejects(
    request("/dashboard", { token: testToken }),
    matchesApiError(
      "Layanan sedang dalam pemeliharaan.",
      503,
      "MAINTENANCE_MODE",
    ),
  );
});

test("authenticated 401 replaces server and validation messages with the expired-session message", async () => {
  stubFetch(
    Response.json(
      {
        message: "Unauthenticated.",
        errors: { token: ["Invalid token."] },
        code: "TOKEN_EXPIRED",
      },
      { status: 401 },
    ),
  );

  await assert.rejects(
    getCurrentAdmin(testToken),
    matchesApiError(
      "Sesi Anda berakhir. Silakan masuk kembali.",
      401,
      "TOKEN_EXPIRED",
    ),
  );
});

test("unauthenticated 401 retains the server login error instead of claiming the session expired", async () => {
  stubFetch(
    Response.json({ message: "Login atau password salah." }, { status: 401 }),
  );
  await assert.rejects(
    loginAdmin("admin@example.test", "test-password"),
    matchesApiError("Login atau password salah.", 401),
  );
});

test("403 replaces server and validation messages with the administrator access error", async () => {
  stubFetch(
    Response.json(
      {
        message: "Forbidden.",
        errors: { account: ["Account blocked."] },
        code: "FORBIDDEN",
      },
      { status: 403 },
    ),
  );
  await assert.rejects(
    request("/admin", { token: testToken }),
    matchesApiError(forbiddenMessage, 403, "FORBIDDEN"),
  );
});

for (const flag of ["success", "status"]) {
  test(`request rejects ${flag}: false even when HTTP status is 200`, async () => {
    stubFetch(
      Response.json({
        [flag]: false,
        message: "Operation failed.",
        code: "FAILED",
      }),
    );
    await assert.rejects(
      request("/example"),
      matchesApiError("Operation failed.", 200, "FAILED"),
    );
  });
}

test("request supplies an HTTP fallback when an error response has no message", async () => {
  stubFetch(Response.json({}, { status: 500 }));
  await assert.rejects(
    request("/example"),
    matchesApiError("Layanan tidak tersedia (HTTP 500).", 500),
  );
});

for (const [description, response] of [
  [
    "malformed JSON",
    () => new Response("<html>Not JSON</html>", { status: 200 }),
  ],
  ["JSON null", () => Response.json(null)],
  ["an empty 204 body", () => new Response(null, { status: 204 })],
]) {
  test(`request rejects ${description} on a successful HTTP response`, async () => {
    stubFetch(response());
    await assert.rejects(
      request("/example"),
      matchesApiError(invalidResponseMessage),
    );
  });
}

for (const [status, token, message] of [
  [503, undefined, "Layanan tidak tersedia (HTTP 503)."],
  [401, testToken, "Sesi Anda berakhir. Silakan masuk kembali."],
  [403, undefined, forbiddenMessage],
]) {
  test(`request retains HTTP ${status} error semantics when the body is malformed JSON`, async () => {
    stubFetch(new Response("not json", { status }));
    await assert.rejects(
      request("/example", { token }),
      matchesApiError(message, status),
    );
  });
}

test("request wraps fetch network errors in a connection ApiError without leaking the original message", async () => {
  stubFetch(() => {
    throw new TypeError("Synthetic low-level network detail");
  });
  await assert.rejects(request("/example"), matchesApiError(connectionMessage));
});

test("request treats an unrelated fetch AbortError as a connection failure", async () => {
  const controller = new AbortController();
  stubFetch(() => {
    throw new DOMException("Unrelated abort", "AbortError");
  });
  await assert.rejects(
    request("/example", { signal: controller.signal }),
    matchesApiError(connectionMessage),
  );
});

test("request installs a 20-second timeout and reports its expiration without waiting", async () => {
  const timeoutController = new AbortController();
  const timeoutMock = mock.method(AbortSignal, "timeout", (milliseconds) => {
    assert.equal(milliseconds, 20000);
    return timeoutController.signal;
  });
  stubFetch((_url, { signal }) => {
    timeoutController.abort(
      new DOMException("Synthetic timeout", "TimeoutError"),
    );
    signal.throwIfAborted();
  });

  await assert.rejects(
    request("/example"),
    matchesApiError("Server terlalu lama merespons. Silakan coba lagi."),
  );
  assert.equal(timeoutMock.mock.callCount(), 1);
});

test("request preserves the original rejection for an already-aborted caller signal", async () => {
  const controller = new AbortController();
  const reason = new DOMException("Caller cancelled", "AbortError");
  controller.abort(reason);
  stubFetch((_url, { signal }) => {
    assert.equal(signal.aborted, true);
    assert.equal(signal.reason, reason);
    signal.throwIfAborted();
  });

  await assert.rejects(
    request("/example", { signal: controller.signal }),
    (error) => {
      assert.equal(error, reason);
      return true;
    },
  );
});

test("getCurrentAdmin forwards in-flight caller cancellation without converting it to an ApiError", async () => {
  const controller = new AbortController();
  const reason = new Error("Custom caller cancellation");
  const fetchMock = stubFetch(
    (_url, { signal }) =>
      new Promise((_resolve, reject) => {
        signal.addEventListener("abort", () => reject(signal.reason), {
          once: true,
        });
      }),
  );

  const result = getCurrentAdmin(testToken, controller.signal);
  const rejection = assert.rejects(result, (error) => {
    assert.equal(error, reason);
    return true;
  });
  controller.abort(reason);
  await rejection;
  assert.equal(fetchMock.callCount(), 1);
});

test("request preserves caller cancellation while reading JSON", async () => {
  const controller = new AbortController();
  const reason = new DOMException(
    "Caller cancelled while reading response",
    "AbortError",
  );
  // Model fetch resolving headers before cancellation rejects response.json().
  stubFetch({
    ok: true,
    status: 200,
    async json() {
      controller.abort(reason);
      throw reason;
    },
  });

  await assert.rejects(
    request("/example", { signal: controller.signal }),
    (error) => error === reason,
  );
  assert.equal(controller.signal.reason, reason);
});
