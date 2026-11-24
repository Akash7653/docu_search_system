from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, model_validator


def _clean_required_text(value: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValueError("value must not be empty or whitespace-only")
    return value.strip()


class DocumentCreateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str
    category: str
    description: str
    content: str

    @model_validator(mode="after")
    def clean_text_fields(self) -> "DocumentCreateRequest":
        for field_name in ("name", "category", "description", "content"):
            setattr(self, field_name, _clean_required_text(getattr(self, field_name)))
        return self


class DocumentUpdateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None

    @model_validator(mode="after")
    def clean_and_require_update(self) -> "DocumentUpdateRequest":
        update_fields = self.model_dump(exclude_unset=True)
        if not update_fields:
            raise ValueError("at least one document field is required")
        for field_name, value in update_fields.items():
            setattr(self, field_name, _clean_required_text(value))
        return self


class DocumentResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(alias="_id")
    name: str
    category: str
    description: str
    content: str
    created_at: datetime
    updated_at: datetime

    @model_validator(mode="after")
    def normalize_timestamps(self) -> "DocumentResponse":
        for field_name in ("created_at", "updated_at"):
            value = getattr(self, field_name)
            if value.tzinfo is None or value.utcoffset() is None:
                raise ValueError("timestamp must be timezone-aware")
            setattr(self, field_name, value.astimezone(timezone.utc))
        return self


class DocumentListResponse(BaseModel):
    items: list[DocumentResponse]
    total: int
    skip: int
    limit: int
    has_more: bool
