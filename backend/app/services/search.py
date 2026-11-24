"""Explainable weighted TF-IDF retrieval.

For each term, inverse document frequency is
``idf = log((N + 1) / (df + 1)) + 1`` and term frequency is
``tf = 1 + log(count)``. Document vectors multiply ``tf * idf`` by
field weights (name 3, category 2, description 2, content 1). The
final relevance score is cosine similarity between the weighted document
vector and the unweighted query vector, normalized to [0, 1]. This is a
retrieval score, not a probability or an AI confidence score.
"""

import math
import re
from collections import Counter
from dataclasses import dataclass
from typing import Any, Iterable, Mapping


FIELD_WEIGHTS = {
    "name": 3.0,
    "category": 2.0,
    "description": 2.0,
    "content": 1.0,
}

STOP_WORDS = {
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "by",
    "for",
    "from",
    "how",
    "in",
    "is",
    "it",
    "of",
    "on",
    "or",
    "that",
    "the",
    "this",
    "to",
    "was",
    "what",
    "where",
    "which",
    "with",
}

TOKEN_PATTERN = re.compile(r"[a-z0-9]+")


@dataclass(frozen=True)
class SearchResult:
    document_id: str
    name: str
    category: str
    description: str
    relevance_score: float
    matched_fields: tuple[str, ...]
    explanation: str


def tokenize(text: Any) -> list[str]:
    """Normalize text into lowercase non-stop-word tokens."""
    if not isinstance(text, str):
        return []
    return [
        token
        for token in TOKEN_PATTERN.findall(text.casefold())
        if token not in STOP_WORDS
    ]


def _term_frequency(tokens: Iterable[str]) -> Counter[str]:
    counts = Counter(tokens)
    return Counter(
        {
            term: 1.0 + math.log(count)
            for term, count in counts.items()
        }
    )


def _inverse_document_frequencies(
    documents: list[Mapping[str, Any]],
) -> dict[str, float]:
    document_frequency: Counter[str] = Counter()
    for document in documents:
        terms = set(
            token
            for field in FIELD_WEIGHTS
            for token in tokenize(document.get(field, ""))
        )
        document_frequency.update(terms)

    document_count = len(documents)
    return {
        term: math.log((document_count + 1) / (frequency + 1)) + 1.0
        for term, frequency in document_frequency.items()
    }


def _document_vector(
    document: Mapping[str, Any],
    inverse_document_frequencies: Mapping[str, float],
) -> dict[str, float]:
    vector: Counter[str] = Counter()
    for field, weight in FIELD_WEIGHTS.items():
        frequencies = _term_frequency(tokenize(document.get(field, "")))
        for term, frequency in frequencies.items():
            vector[term] += frequency * inverse_document_frequencies[term] * weight
    return dict(vector)


def _query_vector(
    query_tokens: list[str],
    inverse_document_frequencies: Mapping[str, float],
) -> dict[str, float]:
    frequencies = _term_frequency(query_tokens)
    return {
        term: frequency * inverse_document_frequencies[term]
        for term, frequency in frequencies.items()
        if term in inverse_document_frequencies
    }


def _cosine_similarity(
    left: Mapping[str, float],
    right: Mapping[str, float],
) -> float:
    left_norm = math.sqrt(sum(value * value for value in left.values()))
    right_norm = math.sqrt(sum(value * value for value in right.values()))
    if left_norm == 0.0 or right_norm == 0.0:
        return 0.0

    dot_product = sum(value * right.get(term, 0.0) for term, value in left.items())
    return max(0.0, min(1.0, dot_product / (left_norm * right_norm)))


def _document_id(document: Mapping[str, Any]) -> str:
    value = document.get("_id", document.get("id", ""))
    return str(value)


def search_documents(
    documents: Iterable[Mapping[str, Any]],
    query: Any,
) -> list[SearchResult]:
    """Rank documents by weighted TF-IDF cosine similarity.

    Query and document term frequency use ``1 + log(count)``. IDF uses
    ``log((N + 1) / (df + 1)) + 1``. Document field vectors apply boosts
    before cosine similarity, so name and description matches contribute
    more than content matches. Cosine similarity is returned in [0, 1].
    """
    query_tokens = tokenize(query)
    document_list = list(documents)
    if not query_tokens or not document_list:
        return []

    inverse_document_frequencies = _inverse_document_frequencies(document_list)
    query_vector = _query_vector(query_tokens, inverse_document_frequencies)
    if not query_vector:
        return []

    results: list[tuple[float, SearchResult]] = []
    query_terms = set(query_tokens)
    for document in document_list:
        document_vector = _document_vector(
            document,
            inverse_document_frequencies,
        )
        score = _cosine_similarity(query_vector, document_vector)
        if score == 0.0:
            continue

        matched_fields = tuple(
            field
            for field in FIELD_WEIGHTS
            if query_terms.intersection(tokenize(document.get(field, "")))
        )
        results.append(
            (
                score,
                SearchResult(
                    document_id=_document_id(document),
                    name=str(document.get("name", "")),
                    category=str(document.get("category", "")),
                    description=str(document.get("description", "")),
                    relevance_score=round(score, 6),
                    matched_fields=matched_fields,
                    explanation=(
                        "Matched fields: " + ", ".join(matched_fields)
                    ),
                ),
            )
        )

    results.sort(
        key=lambda item: (
            -item[0],
            item[1].name.casefold(),
            item[1].document_id,
        )
    )
    return [result for _, result in results]
