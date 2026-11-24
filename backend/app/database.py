import logging
from typing import Optional

from pymongo import MongoClient
from pymongo.collection import Collection
from pymongo.database import Database
from pymongo.errors import ConfigurationError, PyMongoError
from pymongo.uri_parser import parse_uri

from app.config import MONGODB_DATABASE, MONGODB_URI


logger = logging.getLogger(__name__)

DOCUMENTS_COLLECTION = "documents"
_client: Optional[MongoClient] = None
_database: Optional[Database] = None


def create_mongo_client() -> MongoClient:
    if not MONGODB_URI:
        raise ValueError("MONGODB_URI is not configured")

    parse_uri(MONGODB_URI)
    return MongoClient(
        MONGODB_URI,
        connectTimeoutMS=5_000,
        serverSelectionTimeoutMS=5_000,
        socketTimeoutMS=5_000,
        tz_aware=True,
    )


def initialize_database() -> None:
    global _client, _database

    _client = create_mongo_client()
    _client.admin.command("ping")
    _database = _client[MONGODB_DATABASE]

    if DOCUMENTS_COLLECTION not in _database.list_collection_names():
        _database.create_collection(DOCUMENTS_COLLECTION)


def close_database() -> None:
    global _client, _database

    if _client is not None:
        _client.close()
    _client = None
    _database = None


def get_documents_collection() -> Collection:
    if _database is None:
        raise RuntimeError("Database is not initialized")
    return _database[DOCUMENTS_COLLECTION]


def check_database_health() -> dict[str, str]:
    if _client is None or _database is None:
        raise RuntimeError("Database is not initialized")

    _client.admin.command("ping")
    return {
        "status": "ok",
        "database": MONGODB_DATABASE,
        "collection": DOCUMENTS_COLLECTION,
    }


def is_database_error(error: Exception) -> bool:
    return isinstance(
        error,
        (ConfigurationError, PyMongoError, OSError, RuntimeError, ValueError),
    )
