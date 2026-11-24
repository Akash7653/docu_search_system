import pytest

from app.services.query_processing import process_query


@pytest.mark.parametrize(
    ("original", "processed"),
    [
        (
            "Where can I find information about database management?",
            "database management",
        ),
        (
            "Which document explains React components?",
            "react components",
        ),
        (
            "I want to learn about machine learning.",
            "machine learning",
        ),
        (
            "Can you show me details about cloud infrastructure?",
            "cloud infrastructure",
        ),
        (
            "What information is available on web application security?",
            "web application security",
        ),
        ("DATABASE!!!", "database"),
        ("database", "database"),
    ],
)
def test_processes_natural_language_queries(original: str, processed: str) -> None:
    assert process_query(original) == processed


def test_empty_whitespace_and_filler_only_queries_are_empty() -> None:
    assert process_query("") == ""
    assert process_query("   ") == ""
    assert process_query("Where can I find information about?") == ""


def test_technical_terms_are_preserved() -> None:
    assert process_query("Can you explain MongoDB indexes and REST APIs?") == (
        "mongodb indexes rest apis"
    )
