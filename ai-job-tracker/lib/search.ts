export function listSearchPath(pathname: string) {
  if (pathname === "/Applications" || pathname.startsWith("/Applications/")) {
    return "/Applications";
  }

  if (pathname === "/Interviews" || pathname.startsWith("/Interviews/")) {
    return "/Interviews";
  }

  return "/Jobs";
}

export function isListSearchPage(pathname: string) {
  return (
    pathname === "/Jobs" ||
    pathname === "/Applications" ||
    pathname === "/Interviews"
  );
}

export function searchPlaceholder(pathname: string) {
  const path = listSearchPath(pathname);

  if (path === "/Applications") {
    return "Search applications...";
  }

  if (path === "/Interviews") {
    return "Search interviews...";
  }

  return "Search jobs, companies...";
}

export function listSearchHref(
  pathname: string,
  currentParams: string,
  query: string
) {
  const params = new URLSearchParams(currentParams);
  const next = query.trim();

  if (next) {
    params.set("q", next);
  } else {
    params.delete("q");
  }

  params.delete("page");
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

export function formatEnumLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
