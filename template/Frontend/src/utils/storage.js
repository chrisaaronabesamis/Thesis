const tokenKey = "fanhub_token";
const siteSlugKey = "fanhub_site_slug";

export function getToken() {
  return localStorage.getItem(tokenKey) || "";
}

export function setToken(token = "") {
  if (!token) {
    localStorage.removeItem(tokenKey);
    return;
  }
  localStorage.setItem(tokenKey, token);
}

export function getSiteSlug() {
  return localStorage.getItem(siteSlugKey) || "bini";
}

export function setSiteSlug(slug = "bini") {
  localStorage.setItem(siteSlugKey, slug || "bini");
}
