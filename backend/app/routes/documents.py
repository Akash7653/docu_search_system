from typing import Iterable

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pymongo.collection import Collection
from pymongo.errors import PyMongoError

from app.database import get_documents_collection
from app.schemas.document import (
    DocumentCreateRequest,
    DocumentListResponse,
    DocumentResponse,
    DocumentUpdateRequest,
)
from app.schemas.search import (
    DocumentQueryRequest,
    DocumentQueryResponse,
    SearchResponse,
    SearchResultResponse,
)
from app.services.documents import (
    DocumentNotFoundError,
    create_document,
    delete_document,
    get_document,
    list_documents,
    update_document,
)
from app.services.search import search_documents
from app.services.search import SearchResult
from app.services.query_processing import process_query


router = APIRouter(prefix="/documents", tags=["documents"])


def _parse_object_id(document_id: str) -> ObjectId:
    if not ObjectId.is_valid(document_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid document ID",
        )
    return ObjectId(document_id)


def _database_unavailable(error: PyMongoError) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="Database is unavailable",
    )


def _get_search_collection() -> Collection:
    try:
        return get_documents_collection()
    except (PyMongoError, RuntimeError) as error:
        raise _database_unavailable(error) from error


def _format_search_results(
    matches: Iterable[SearchResult],
) -> list[SearchResultResponse]:
    return [
        SearchResultResponse(
            id=match.document_id,
            name=match.name,
            category=match.category,
            short_description=match.description,
            relevance_score=match.relevance_score,
            matched_fields=list(match.matched_fields),
        )
        for match in matches
    ]


@router.post(
    "",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create(
    request: DocumentCreateRequest,
    collection: Collection = Depends(get_documents_collection),
) -> DocumentResponse:
    try:
        return create_document(collection, request)
    except PyMongoError as error:
        raise _database_unavailable(error) from error


@router.get("", response_model=DocumentListResponse)
def list_all(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    collection: Collection = Depends(get_documents_collection),
) -> DocumentListResponse:
    try:
        return list_documents(collection, skip, limit)
    except PyMongoError as error:
        raise _database_unavailable(error) from error


@router.get("/search", response_model=SearchResponse)
def search(
    q: str = Query(..., max_length=500),
    collection: Collection = Depends(_get_search_collection),
) -> SearchResponse:
    if not q.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Search query must not be empty or whitespace-only",
        )

    try:
        documents = collection.find(
            {},
            {
                "_id": 1,
                "name": 1,
                "category": 1,
                "description": 1,
                "content": 1,
            },
        )
        matches = search_documents(documents, q)
    except PyMongoError as error:
        raise _database_unavailable(error) from error

    results = _format_search_results(matches)
    return SearchResponse(query=q, total=len(results), results=results)


@router.post("/query", response_model=DocumentQueryResponse)
def query_documents(
    request: DocumentQueryRequest,
    collection: Collection = Depends(_get_search_collection),
) -> DocumentQueryResponse:
    processed_query = process_query(request.query)
    if not processed_query:
        return DocumentQueryResponse(
            query=request.query,
            processed_query="",
            total=0,
            results=[],
        )

    try:
        documents = collection.find(
            {},
            {
                "_id": 1,
                "name": 1,
                "category": 1,
                "description": 1,
                "content": 1,
            },
        )
        matches = search_documents(documents, processed_query)
    except PyMongoError as error:
        raise _database_unavailable(error) from error

    results = _format_search_results(matches)
    return DocumentQueryResponse(
        query=request.query,
        processed_query=processed_query,
        total=len(results),
        results=results,
    )


@router.get("/{document_id}", response_model=DocumentResponse)
def get_one(
    document_id: str,
    collection: Collection = Depends(get_documents_collection),
) -> DocumentResponse:
    object_id = _parse_object_id(document_id)
    try:
        return get_document(collection, object_id)
    except DocumentNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        ) from error
    except PyMongoError as error:
        raise _database_unavailable(error) from error


@router.put("/{document_id}", response_model=DocumentResponse)
def update(
    document_id: str,
    request: DocumentUpdateRequest,
    collection: Collection = Depends(get_documents_collection),
) -> DocumentResponse:
    object_id = _parse_object_id(document_id)
    try:
        return update_document(collection, object_id, request)
    except DocumentNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        ) from error
    except PyMongoError as error:
        raise _database_unavailable(error) from error


@router.delete("/{document_id}")
def delete(
    document_id: str,
    collection: Collection = Depends(get_documents_collection),
) -> dict[str, str]:
    object_id = _parse_object_id(document_id)
    try:
        delete_document(collection, object_id)
    except DocumentNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        ) from error
    except PyMongoError as error:
        raise _database_unavailable(error) from error
    return {"message": "Document deleted successfully"}
