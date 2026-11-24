from copy import deepcopy
from datetime import datetime, timezone
from types import SimpleNamespace
from typing import Optional

from bson import ObjectId

from scripts.seed_sample_data import SAMPLE_KEY_FIELD, seed_sample_documents
from sample_data.documents import SAMPLE_DOCUMENTS
from app.services.search import search_documents


class SeedCollection:
    def __init__(self) -> None:
        self.documents: list[dict] = []

    def find_one(self, query: dict) -> Optional[dict]:
        for document in self.documents:
            if all(document.get(key) == value for key, value in query.items()):
                return deepcopy(document)
        return None

    def insert_one(self, document: dict) -> SimpleNamespace:
        stored = deepcopy(document)
        stored["_id"] = ObjectId()
        self.documents.append(stored)
        return SimpleNamespace(inserted_id=stored["_id"])

    def update_one(self, query: dict, update: dict) -> SimpleNamespace:
        for document in self.documents:
            if all(document.get(key) == value for key, value in query.items()):
                document.update(update["$set"])
                return SimpleNamespace(matched_count=1)
        return SimpleNamespace(matched_count=0)


def test_exactly_ten_documents_have_required_meaningful_fields() -> None:
    required_fields = {"name", "category", "description", "content"}

    assert len(SAMPLE_DOCUMENTS) == 10
    for document in SAMPLE_DOCUMENTS:
        assert required_fields.issubset(document)
        assert all(isinstance(document[field], str) for field in required_fields)
        assert all(document[field].strip() for field in required_fields)


def test_seed_is_idempotent() -> None:
    collection = SeedCollection()
    timestamp = datetime(2026, 1, 1, tzinfo=timezone.utc)

    first = seed_sample_documents(collection, now=timestamp)
    second = seed_sample_documents(collection, now=timestamp)

    assert first.inserted == 10
    assert first.updated == 0
    assert second.inserted == 0
    assert second.updated == 0
    assert second.unchanged == 10
    assert len(collection.documents) == 10
    assert all(SAMPLE_KEY_FIELD in document for document in collection.documents)
    assert all(
        document["created_at"].tzinfo == timezone.utc
        and document["updated_at"].tzinfo == timezone.utc
        for document in collection.documents
    )


def test_seed_preserves_unrelated_user_documents() -> None:
    collection = SeedCollection()
    unrelated = {
        "_id": ObjectId(),
        "name": "User Created Notes",
        "category": "Personal",
        "description": "Unrelated document",
        "content": "Must remain untouched.",
    }
    collection.documents.append(deepcopy(unrelated))

    summary = seed_sample_documents(collection)

    assert summary.inserted == 10
    assert len(collection.documents) == 11
    assert collection.find_one({"_id": unrelated["_id"]}) == unrelated


def test_seeded_documents_support_expected_searches() -> None:
    collection = SeedCollection()
    seed_sample_documents(collection)

    expected_names = {
        "database": "Database Fundamentals",
        "React components": "React Component Architecture",
        "machine learning": "Introduction to Machine Learning",
        "cloud infrastructure": "Cloud Infrastructure Basics",
        "security vulnerabilities": "Web Application Security",
        "API design": "REST API Design Principles",
        "network protocols": "Computer Network Fundamentals",
        "agile development": "Agile Software Development",
        "data visualization": "Data Analysis and Visualization",
    }
    documents = collection.documents

    for query, expected_name in expected_names.items():
        first = search_documents(documents, query)
        second = search_documents(documents, query)

        assert first
        assert first[0].name == expected_name
        assert [result.document_id for result in first] == [
            result.document_id for result in second
        ]
        assert all(0.0 < result.relevance_score <= 1.0 for result in first)

    irrelevant = search_documents(
        documents,
        "quantum cooking spaceship",
    )
    assert irrelevant == []
