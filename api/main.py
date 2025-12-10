import logging
import json
from fastapi import FastAPI, Depends
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware

from database import SessionLocal, Base, engine
from routers import employee_api
from models.employee import Employee

logging.basicConfig(level=logging.INFO)

logger = logging.getLogger(__name__)

origins = [
    "http://127.0.0.1",
    "http://localhost",
    "http://localhost:8080",
]

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    if db.query(Employee).count() == 0:
        with open("dummyorg.json", "r") as f:
            data = json.load(f)
            for employee in data:
                db.add(Employee(**employee))
            db.commit()
    yield

    db.close()

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(employee_api.router)

@app.get("/")
def get_index():
    logger.info("Hello")
    return {"msg": "Hello"}
