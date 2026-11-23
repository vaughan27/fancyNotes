from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session

from .db import Base, engine, get_db
from .models import Note
from .schemas import NoteIn, NoteOut


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(engine)
    yield


app = FastAPI(title="Notes API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def _get_or_404(db: Session, note_id: int) -> Note:
    note = db.get(Note, note_id)
    if note is None:
        raise HTTPException(404, "Note not found")
    return note


@app.get("/api/notes", response_model=list[NoteOut])
def list_notes(db: Session = Depends(get_db)):
    return db.scalars(select(Note).order_by(Note.updated_at.desc())).all()


@app.post("/api/notes", response_model=NoteOut, status_code=201)
def create_note(data: NoteIn, db: Session = Depends(get_db)):
    note = Note(**data.model_dump())
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@app.put("/api/notes/{note_id}", response_model=NoteOut)
def update_note(note_id: int, data: NoteIn, db: Session = Depends(get_db)):
    note = _get_or_404(db, note_id)
    note.title, note.content = data.title, data.content
    db.commit()
    db.refresh(note)
    return note


@app.delete("/api/notes/{note_id}", status_code=204)
def delete_note(note_id: int, db: Session = Depends(get_db)):
    db.delete(_get_or_404(db, note_id))
    db.commit()
