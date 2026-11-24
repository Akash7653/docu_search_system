"""Deterministic cleanup for natural-language document questions."""

import re
from typing import Any

from app.services.search import tokenize


FILLER_PATTERNS = (
    r"\bwhere\s+can\s+i\s+find\s+information\s+about\b",
    r"\bwhich\s+document\s+explains\b",
    r"\bi\s+want\s+to\s+learn\s+about\b",
    r"\bcan\s+you\s+show\s+me\s+details\s+about\b",
    r"\bwhat\s+information\s+is\s+available\s+on\b",
    r"\btell\s+me\s+about\b",
    r"\bcan\s+you\s+explain\b",
    r"\bwhat\s+(?:is|are)\b",
)


def process_query(query: Any) -> str:
    """Return meaningful normalized keywords from a user question.

    Known question phrases are removed before the shared tokenizer handles
    case normalization, punctuation, and generic stop words. Domain words
    are not stemmed, expanded, or replaced with semantic equivalents.
    """
    if not isinstance(query, str) or not query.strip():
        return ""

    processed = query.casefold()
    for pattern in FILLER_PATTERNS:
        processed = re.sub(pattern, " ", processed)

    return " ".join(tokenize(processed))
