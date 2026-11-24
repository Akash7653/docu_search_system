from pydantic import BaseModel, Field, field_validator


class SearchResultResponse(BaseModel):
    id: str
    name: str
    category: str
    short_description: str
    relevance_score: float = Field(ge=0.0, le=1.0)
    matched_fields: list[str]


class SearchResponse(BaseModel):
    query: str
    total: int
    results: list[SearchResultResponse]


class DocumentQueryRequest(BaseModel):
    query: str = Field(max_length=500)

    @field_validator("query")
    @classmethod
    def validate_query(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("query must not be empty or whitespace-only")
        return value


class DocumentQueryResponse(BaseModel):
    query: str
    processed_query: str
    total: int
    results: list[SearchResultResponse]
