from copy import deepcopy
from typing import Optional

import pytest
from fastapi.testclient import TestClient
from pymongo.errors import PyMongoError

from app.main import app
from app.routes.documents import _get_search_collection
from scripts.seed_sample_data import SAMPLE_DOCUMENTS


class QueryCollection:
    def __init__(self) -> None:
        self.documents = [
            {"_id": str(index), **document}
            for index, document in enumerate(SAMPLE_DOCUMENTS, start=1)
        ]
        self.fail = False

    def find(self, _: dict, projection: Optional[dict] = None) -> list[dict]:
        if self.fail:
            raise PyMongoError("simulated database failure")
        return deepcopy(self.documents)


@pytest.fixture
def client(monkeypatch: pytest.MonkeyPatch):
    collection = QueryCollection()
    monkeypatch.setattr("app.main.initialize_database", lambda: None)
    monkeypatch.setattr("app.main.close_database", lambda: None)
    app.dependency_overrides[_get_search_collection] = lambda: collection
    with TestClient(app) as test_client:
        yield test_client, collection
    app.dependency_overrides.clear()


@pytest.mark.parametrize(
    ("query", "expected_name"),
    [
        (
            "Where can I find information about database management?",
            "Database Fundamentals",
        ),
        ("Which document explains React components?", "React Component Architecture"),
        ("I want to learn about machine learning.", "Introduction to Machine Learning"),
        ("Can you show me details about cloud infrastructure?", "Cloud Infrastructure Basics"),
        ("What information is available on web application security?", "Web Application Security"),
    ],
)
def test_natural_language_query_finds_expected_document(
    client,
    query: str,
    expected_name: str,
) -> None:
    response = client[0].post("/documents/query", json={"query": query})

    assert response.status_code == 200
    body = response.json()
    assert body["query"] == query
    assert body["processed_query"]
    assert body["results"][0]["name"] == expected_name
    assert body["total"] == len(body["results"])
    assert all(0.0 <= result["relevance_score"] <= 1.0 for result in body["results"])
    assert [
        result["relevance_score"] for result in body["results"]
    ] == sorted(
        (result["relevance_score"] for result in body["results"]),
        reverse=True,
    )


def test_direct_query_and_irrelevant_query(client) -> None:
    direct = client[0].post("/documents/query", json={"query": "database"})
    irrelevant = client[0].post(
        "/documents/query",
        json={"query": "Tell me about quantum cooking spaceships."},
    )

    assert direct.json()["processed_query"] == "database"
    assert direct.json()["results"][0]["name"] == "Database Fundamentals"
    assert irrelevant.status_code == 200
    assert irrelevant.json()["results"] == []


def test_filler_only_query_returns_empty_results(client) -> None:
    response = client[0].post(
        "/documents/query",
        json={"query": "Where can I find information about?"},
    )

    assert response.status_code == 200
    assert response.json()["processed_query"] == ""
    assert response.json()["results"] == []


def test_invalid_query_bodies_are_rejected(client) -> None:
    empty = client[0].post("/documents/query", json={"query": "  "})
    missing = client[0].post("/documents/query", json={})
    too_long = client[0].post("/documents/query", json={"query": "a" * 501})

    assert empty.status_code == 422
    assert missing.status_code == 422
    assert too_long.status_code == 422


def test_database_failure_returns_safe_error(client) -> None:
    client[1].fail = True

    response = client[0].post(
        "/documents/query",
        json={"query": "database"},
    )

    assert response.status_code == 503
    assert response.json() == {"detail": "Database is unavailable"}
