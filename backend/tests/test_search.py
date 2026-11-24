from app.services.search import search_documents, tokenize


def document(
    document_id: str,
    name: str,
    category: str,
    description: str,
    content: str,
) -> dict[str, str]:
    return {
        "_id": document_id,
        "name": name,
        "category": category,
        "description": description,
        "content": content,
    }


DOCUMENTS = [
    document(
        "1",
        "Database Design Guide",
        "database",
        "Relational schema and indexing decisions.",
        "Database normalization and query planning.",
    ),
    document(
        "2",
        "Deployment Runbook",
        "operations",
        "Production release checklist.",
        "The deployment process uses containers and health checks.",
    ),
    document(
        "3",
        "Testing Strategy",
        "quality",
        "Automated testing guidance.",
        "Unit tests, integration tests, and test fixtures.",
    ),
]


def test_exact_title_match_ranks_first() -> None:
    results = search_documents(DOCUMENTS, "database")

    assert results[0].name == "Database Design Guide"
    assert results[0].relevance_score > 0
    assert "name" in results[0].matched_fields


def test_partial_title_and_description_matches_are_retrieved() -> None:
    results = search_documents(DOCUMENTS, "schema indexing")

    assert results[0].name == "Database Design Guide"
    assert "description" in results[0].matched_fields


def test_content_and_category_matches_are_retrieved() -> None:
    content_results = search_documents(DOCUMENTS, "containers")
    category_results = search_documents(DOCUMENTS, "quality")

    assert content_results[0].name == "Deployment Runbook"
    assert "content" in content_results[0].matched_fields
    assert category_results[0].name == "Testing Strategy"
    assert "category" in category_results[0].matched_fields


def test_case_punctuation_and_repeated_terms_are_handled() -> None:
    assert tokenize("DATABASE, database!") == ["database", "database"]
    results = search_documents(DOCUMENTS, "DATABASE!!! database")

    assert results[0].name == "Database Design Guide"


def test_irrelevant_and_stop_word_only_queries_return_no_results() -> None:
    assert search_documents(DOCUMENTS, "quantum spaceship") == []
    assert search_documents(DOCUMENTS, "the and where") == []
    assert search_documents(DOCUMENTS, "   ") == []


def test_empty_database_and_missing_optional_text_are_safe() -> None:
    sparse_document = {"_id": "sparse", "name": "API Notes"}

    assert search_documents([], "api") == []
    results = search_documents([sparse_document], "api")

    assert results[0].document_id == "sparse"


def test_equal_scores_have_deterministic_order() -> None:
    equal_documents = [
        document("b", "Same Notes", "docs", "same", "same"),
        document("a", "Same Notes", "docs", "same", "same"),
    ]

    first = search_documents(equal_documents, "same")
    second = search_documents(list(reversed(equal_documents)), "same")

    assert [result.document_id for result in first] == ["a", "b"]
    assert [result.document_id for result in first] == [
        result.document_id for result in second
    ]


def test_scores_are_normalized_to_zero_one() -> None:
    results = search_documents(DOCUMENTS, "database")

    assert all(0.0 < result.relevance_score <= 1.0 for result in results)
