from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
import sys
from typing import Any, Iterable, Mapping, Optional

# Allow this script to be run from the backend directory while importing the
# repository-level sample_data package.
PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.database import close_database, get_documents_collection, initialize_database
from app.schemas.document import DocumentCreateRequest
from sample_data.documents import SAMPLE_DOCUMENTS


SAMPLE_KEY_FIELD = "_sample_data_key"
SAMPLE_KEY_PREFIX = "document-search-system-v1"
TEXT_FIELDS = ("name", "category", "description", "content")


@dataclass(frozen=True)
class SeedSummary:
    inserted: int
    updated: int
    unchanged: int


def _sample_key(document: Mapping[str, str]) -> str:
    slug = "-".join(document["name"].casefold().split())
    return f"{SAMPLE_KEY_PREFIX}:{slug}"


def seed_sample_documents(
    collection: Any,
    documents: Iterable[Mapping[str, str]] = SAMPLE_DOCUMENTS,
    now: Optional[datetime] = None,
) -> SeedSummary:
    timestamp = now or datetime.now(timezone.utc)
    inserted = 0
    updated = 0
    unchanged = 0

    for source_document in documents:
        validated = DocumentCreateRequest.model_validate(source_document)
        fields = validated.model_dump()
        key = _sample_key(fields)
        existing = collection.find_one({SAMPLE_KEY_FIELD: key})

        if existing is None:
            collection.insert_one(
                {
                    **fields,
                    "created_at": timestamp,
                    "updated_at": timestamp,
                    SAMPLE_KEY_FIELD: key,
                }
            )
            inserted += 1
            continue

        if any(existing.get(field) != fields[field] for field in TEXT_FIELDS):
            collection.update_one(
                {"_id": existing["_id"]},
                {
                    "$set": {
                        **fields,
                        "updated_at": timestamp,
                    }
                },
            )
            updated += 1
        else:
            unchanged += 1

    return SeedSummary(
        inserted=inserted,
        updated=updated,
        unchanged=unchanged,
    )


def main() -> None:
    initialize_database()
    try:
        summary = seed_sample_documents(get_documents_collection())
        print(
            "Sample data seed complete: "
            f"inserted={summary.inserted}, "
            f"updated={summary.updated}, "
            f"unchanged={summary.unchanged}"
        )
    finally:
        close_database()


if __name__ == "__main__":
    main()
