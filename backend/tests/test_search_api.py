from copy import deepcopy
from typing import Optional

import pytest
from fastapi.testclient import TestClient
from pymongo.errors import PyMongoError

from app.main import app
from app.routes.documents import _get_search_collection


class SearchCollection:
    def __init__(self) -> None:
        self.documents = [
            {
                "_id": "1",
                "name": "Database Fundamentals",
                "category": "Technology",
                "description": "An introduction to database concepts.",
                "content": "Relational tables and database normalization.",
            },
            {
                "_id": "2",
                "name": "Deployment Guide",
                "category": "Operations",
                "description": "A production release checklist.",
                "content": "Deployment uses containers and health checks.",
            },
            {
                "_id": "3",
                "name": "Security Handbook",
                "category": "Security",
                "description": "Application security practices.",
                "content": "Authentication and authorization controls.",
            },
        ]
        self.fail = False

    def find(self, _: dict, projection: Optional[dict] = None) -> list[dict]:
        if self.fail:
            raise PyMongoError("simulated database failure")
        return deepcopy(self.documents)


@pytest.fixture
def client(monkeypatch: pytest.MonkeyPatch):
    collection = SearchCollection()
    monkeypatch.setattr("app.main.initialize_database", lambda: None)
    monkeypatch.setattr("app.main.close_database", lambda: None)
    app.dependency_overrides[_get_search_collection] = lambda: collection
    with TestClient(app) as test_client:
        yield test_client, collection
    app.dependency_overrides.clear()


def test_search_matches_title_and_returns_expected_shape(client) -> None:
    response = client[0].get("/documents/search?q=database")

    assert response.status_code == 200
    body = response.json()
    assert body["query"] == "database"
    assert body["total"] == 1
    assert body["results"][0]["id"] == "1"
    assert body["results"][0]["short_description"]
    assert "name" in body["results"][0]["matched_fields"]


def test_search_matches_description_content_and_category(client) -> None:
    description = client[0].get("/documents/search?q=production")
    content = client[0].get("/documents/search?q=containers")
    category = client[0].get("/documents/search?q=security")

    assert description.json()["results"][0]["id"] == "2"
    assert content.json()["results"][0]["id"] == "2"
    assert category.json()["results"][0]["id"] == "3"


def test_irrelevant_and_stop_word_queries_return_empty_results(client) -> None:
    irrelevant = client[0].get("/documents/search?q=quantum")
    stop_words = client[0].get("/documents/search?q=the%20and%20where")
    punctuation = client[0].get("/documents/search?q=%21%40%23")

    assert irrelevant.json() == {
        "query": "quantum",
        "total": 0,
        "results": [],
    }
    assert stop_words.json()["results"] == []
    assert punctuation.json()["results"] == []


def test_empty_and_too_long_queries_are_rejected(client) -> None:
    empty = client[0].get("/documents/search?q=%20%20")
    too_long = client[0].get(f"/documents/search?q={'a' * 501}")

    assert empty.status_code == 422
    assert "must not be empty" in empty.json()["detail"]
    assert too_long.status_code == 422


def test_scores_are_descending_and_in_range(client) -> None:
    response = client[0].get("/documents/search?q=database%20normalization")
    results = response.json()["results"]
    scores = [result["relevance_score"] for result in results]

    assert scores == sorted(scores, reverse=True)
    assert all(0.0 <= score <= 1.0 for score in scores)


def test_database_failure_returns_safe_error(client) -> None:
    client[1].fail = True

    response = client[0].get("/documents/search?q=database")

    assert response.status_code == 503
    assert response.json() == {"detail": "Database is unavailable"}


def test_missing_query_is_rejected(client) -> None:
    response = client[0].get("/documents/search")

    assert response.status_code == 422
