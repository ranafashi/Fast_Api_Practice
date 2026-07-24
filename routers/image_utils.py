from __future__ import annotations

import json
import re
import urllib.error
import urllib.parse
import urllib.request
from functools import lru_cache

STOPWORDS = {
    "a",
    "an",
    "and",
    "or",
    "the",
    "of",
    "for",
    "with",
    "to",
    "in",
    "on",
    "by",
    "from",
    "set",
    "pack",
    "pair",
    "new",
    "pro",
    "plus",
    "premium",
    "edition",
    "model",
    "size",
    "color",
    "colour",
}


def _tokens(value: str) -> list[str]:
    cleaned = re.sub(r"[^a-zA-Z0-9\s-]", " ", value or "")
    parts = [p.lower() for p in cleaned.replace("-", " ").split() if p]
    return [p for p in parts if p not in STOPWORDS and len(p) > 1]


def _name_query(name: str, category: str = "") -> str:
    """Build a search query that prefers the product name."""
    name_parts = _tokens(name)
    if name_parts:
        return " ".join(name_parts[:6])
    cat_parts = _tokens(category)
    if cat_parts:
        return " ".join(cat_parts[:3])
    return "product"


def _loremflickr_from_name(name: str, category: str, product_id: int) -> str:
    """Fallback: Flickr tags from the product name first."""
    tags = _tokens(name)[:3]
    if not tags:
        tags = _tokens(category)[:2] or ["product"]
    path = ",".join(urllib.parse.quote(tag) for tag in tags)
    return f"https://loremflickr.com/640/480/{path}?lock={product_id}"


@lru_cache(maxsize=256)
def _openverse_search(query: str, pick: int = 0) -> str | None:
    """
    Search Openverse (Creative Commons images) by product-name query.
    Returns a direct image URL relevant to the query.
    """
    if not query.strip():
        return None

    params = urllib.parse.urlencode(
        {
            "q": query,
            "page_size": 5,
            "license_type": "commercial,modification",
        }
    )
    url = f"https://api.openverse.org/v1/images/?{params}"
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "BrandiayaStore/1.0 (ecommerce demo)",
            "Accept": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=8) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, json.JSONDecodeError):
        return None

    results = payload.get("results") or []
    if not results:
        return None

    choice = results[pick % len(results)]
    return choice.get("url") or choice.get("thumbnail")


def is_auto_image_url(image_url: str | None) -> bool:
    """True when the URL was auto-generated (safe to refresh)."""
    if not image_url:
        return True
    auto_hosts = (
        "loremflickr.com",
        "source.unsplash.com",
        "picsum.photos",
    )
    return any(host in image_url for host in auto_hosts)


def build_product_image_url(
    *,
    product_id: int,
    name: str = "",
    category: str = "",
) -> str:
    """
    Resolve a real photograph matching the product NAME (not just category).

    Primary: Openverse search using the cleaned product name.
    Fallback: LoremFlickr tags derived from the product name.
    """
    query = _name_query(name, category)
    openverse_url = _openverse_search(query, pick=max(product_id, 0))
    if openverse_url:
        return openverse_url
    return _loremflickr_from_name(name, category, product_id)


def ensure_product_image(product: dict, *, refresh_auto: bool = True) -> dict:
    """
    Ensure product has an image_url.

    Custom admin-provided URLs are kept.
    Old category-based LoremFlickr URLs are refreshed to name-based images.
    """
    data = dict(product)
    existing = data.get("image_url")
    if existing and not (refresh_auto and is_auto_image_url(existing)):
        return data

    data["image_url"] = build_product_image_url(
        product_id=int(data.get("id") or 0),
        name=str(data.get("name") or ""),
        category=str(data.get("category") or ""),
    )
    return data
