from datetime import datetime, timezone
from typing import Any

from bson import ObjectId
from pymongo.collection import Collection
from pymongo.errors import PyMongoError

from app.schemas.document import (
    DocumentCreateRequest,
    DocumentListResponse,
    DocumentResponse,
    DocumentUpdateRequest,
)


class DocumentNotFoundError(Exception):
    pass


def _serialize(document: dict[str, Any]) -> DocumentResponse:
    document = {**document, "_id": str(document["_id"])}
    return DocumentResponse.model_validate(document)


def create_document(
    collection: Collection,
    request: DocumentCreateRequest,
) -> DocumentResponse:
    now = datetime.now(timezone.utc)
    document = {
        **request.model_dump(),
        "created_at": now,
        "updated_at": now,
    }
    result = collection.insert_one(document)
    return get_document(collection, result.inserted_id)


def list_documents(
    collection: Collection,
    skip: int,
    limit: int,
) -> DocumentListResponse:
    total = collection.count_documents({})
    cursor = (
        collection.find({})
        .sort([("created_at", -1), ("_id", 1)])
        .skip(skip)
        .limit(limit)
    )
    items = [_serialize(document) for document in cursor]
    return DocumentListResponse(
        items=items,
        total=total,
        skip=skip,
        limit=limit,
        has_more=skip + len(items) < total,
    )


def get_document(
    collection: Collection,
    document_id: ObjectId,
) -> DocumentResponse:
    document = collection.find_one({"_id": document_id})
    if document is None:
        raise DocumentNotFoundError
    return _serialize(document)


def update_document(
    collection: Collection,
    document_id: ObjectId,
    request: DocumentUpdateRequest,
) -> DocumentResponse:
    update = {
        **request.model_dump(exclude_unset=True),
        "updated_at": datetime.now(timezone.utc),
    }
    result = collection.update_one({"_id": document_id}, {"$set": update})
    if result.matched_count == 0:
        raise DocumentNotFoundError
    return get_document(collection, document_id)


def delete_document(collection: Collection, document_id: ObjectId) -> None:
    result = collection.delete_one({"_id": document_id})
    if result.deleted_count == 0:
        raise DocumentNotFoundError
