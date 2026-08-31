export function isDatabaseUnavailable(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const code = "code" in error ? String(error.code) : "";
  return (
    code === "ECONNREFUSED" ||
    code === "P1001" ||
    code === "P1017" ||
    ("message" in error &&
      String(error.message).includes("ECONNREFUSED"))
  );
}
