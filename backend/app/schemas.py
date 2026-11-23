from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class NoteIn(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    content: str = ""


class NoteOut(NoteIn):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
