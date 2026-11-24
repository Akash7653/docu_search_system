from datetime import datetime, timezone

import pytest
from pymongo.errors import ConfigurationError

from app.database import create_mongo_client
from app.schemas.document import DocumentResponse


def test_document_timestamps_are_normalized_to_utc() -> None:
    document = DocumentResponse(
        _id="507f1f77bcf86cd799439011",
        name="Architecture Notes",
        category="engineering",
        description="System design notes",
        content="Service boundaries and data flow.",
        created_at=datetime(2026, 1, 1, 12, tzinfo=timezone.utc),
        updated_at=datetime(2026, 1, 1, 13, tzinfo=timezone.utc),
    )

    assert document.created_at.tzinfo == timezone.utc
    assert document.updated_at.tzinfo == timezone.utc


def test_document_rejects_naive_timestamps() -> None:
    with pytest.raises(ValueError, match="timezone-aware"):
        DocumentResponse(
            _id="507f1f77bcf86cd799439011",
            name="Architecture Notes",
            category="engineering",
            description="System design notes",
            content="Service boundaries and data flow.",
            created_at=datetime(2026, 1, 1, 12),
            updated_at=datetime(2026, 1, 1, 13, tzinfo=timezone.utc),
        )


def test_missing_mongodb_uri_is_rejected(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr("app.database.MONGODB_URI", "")

    with pytest.raises(ValueError, match="MONGODB_URI is not configured"):
        create_mongo_client()


def test_invalid_mongodb_uri_is_rejected(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr("app.database.MONGODB_URI", "not-a-mongodb-uri")

    with pytest.raises(ConfigurationError):
        create_mongo_client()
