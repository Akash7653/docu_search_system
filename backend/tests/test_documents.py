from copy import deepcopy
from types import SimpleNamespace
from typing import Optional

import pytest
from bson import ObjectId
from fastapi.testclient import TestClient
from pymongo.errors import PyMongoError

from app.database import get_documents_collection
from app.main import app


class FakeCursor:
    def __init__(self, documents: list[dict]) -> None:
        self.documents = documents

    def sort(self, fields: list[tuple[str, int]]) -> "FakeCursor":
        for field, direction in reversed(fields):
            self.documents.sort(
                key=lambda document: document[field],
                reverse=direction == -1,
            )
        return self

    def skip(self, amount: int) -> "FakeCursor":
        self.documents = self.documents[amount:]
        return self

    def limit(self, amount: int) -> "FakeCursor":
        self.documents = self.documents[:amount]
        return self

    def __iter__(self):
        return iter(self.documents)


class FakeCollection:
    def __init__(self) -> None:
        self.documents: list[dict] = []
        self.fail = False

    def _check_failure(self) -> None:
        if self.fail:
            raise PyMongoError("simulated database failure")

    def insert_one(self, document: dict) -> SimpleNamespace:
        self._check_failure()
        stored = deepcopy(document)
        stored["_id"] = ObjectId()
        self.documents.append(stored)
        return SimpleNamespace(inserted_id=stored["_id"])

    def count_documents(self, _: dict) -> int:
        self._check_failure()
        return len(self.documents)

    def find(self, _: dict) -> FakeCursor:
        self._check_failure()
        return FakeCursor(deepcopy(self.documents))

    def find_one(self, query: dict) -> Optional[dict]:
        self._check_failure()
        for document in self.documents:
            if document["_id"] == query["_id"]:
                return deepcopy(document)
        return None

    def update_one(self, query: dict, update: dict) -> SimpleNamespace:
        self._check_failure()
        for document in self.documents:
            if document["_id"] == query["_id"]:
                document.update(update["$set"])
                return SimpleNamespace(matched_count=1)
        return SimpleNamespace(matched_count=0)

    def delete_one(self, query: dict) -> SimpleNamespace:
        self._check_failure()
        for index, document in enumerate(self.documents):
            if document["_id"] == query["_id"]:
                self.documents.pop(index)
                return SimpleNamespace(deleted_count=1)
        return SimpleNamespace(deleted_count=0)


@pytest.fixture
def client(monkeypatch: pytest.MonkeyPatch):
    collection = FakeCollection()
    monkeypatch.setattr("app.main.initialize_database", lambda: None)
    monkeypatch.setattr("app.main.close_database", lambda: None)
    app.dependency_overrides[get_documents_collection] = lambda: collection
    with TestClient(app) as test_client:
        yield test_client, collection
    app.dependency_overrides.clear()


def payload(name: str = "Architecture Notes") -> dict[str, str]:
    return {
        "name": name,
        "category": "engineering",
        "description": "System design notes",
        "content": "Service boundaries and data flow.",
    }


def test_create_document(client) -> None:
    response = client[0].post("/documents", json=payload())

    assert response.status_code == 201
    body = response.json()
    assert body["name"] == "Architecture Notes"
    assert body["_id"]
    assert body["created_at"] == body["updated_at"]


def test_rejects_invalid_document_creation(client) -> None:
    response = client[0].post("/documents", json={**payload(), "name": "  "})

    assert response.status_code == 422


def test_lists_documents_and_supports_pagination(client) -> None:
    for index in range(3):
        assert client[0].post(
            "/documents",
            json=payload(f"Document {index}"),
        ).status_code == 201

    response = client[0].get("/documents?skip=1&limit=1")

    assert response.status_code == 200
    assert len(response.json()["items"]) == 1
    assert response.json()["total"] == 3
    assert response.json()["skip"] == 1
    assert response.json()["limit"] == 1
    assert response.json()["has_more"] is True


def test_rejects_invalid_pagination(client) -> None:
    response = client[0].get("/documents?skip=-1")

    assert response.status_code == 422


def test_get_update_and_preserve_created_at(client) -> None:
    created = client[0].post("/documents", json=payload()).json()
    document_id = created["_id"]

    response = client[0].get(f"/documents/{document_id}")
    assert response.status_code == 200

    original_created_at = response.json()["created_at"]
    response = client[0].put(
        f"/documents/{document_id}",
        json={"name": "Updated Notes"},
    )

    assert response.status_code == 200
    assert response.json()["created_at"] == original_created_at
    assert response.json()["updated_at"] >= original_created_at
    assert response.json()["name"] == "Updated Notes"


def test_invalid_and_missing_document_ids(client) -> None:
    invalid = client[0].get("/documents/not-an-object-id")
    missing = client[0].get(f"/documents/{ObjectId()}")

    assert invalid.status_code == 400
    assert missing.status_code == 404


def test_delete_document_and_missing_document(client) -> None:
    created = client[0].post("/documents", json=payload()).json()
    document_id = created["_id"]

    assert client[0].delete(f"/documents/{document_id}").status_code == 200
    assert client[0].get(f"/documents/{document_id}").status_code == 404
    assert client[0].delete(f"/documents/{document_id}").status_code == 404


def test_database_errors_return_safe_response(client) -> None:
    client[1].fail = True

    response = client[0].get("/documents")

    assert response.status_code == 503
    assert response.json() == {"detail": "Database is unavailable"}
