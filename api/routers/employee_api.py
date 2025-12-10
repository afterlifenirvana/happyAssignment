import logging
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import SessionLocal
from models.employee import Employee

router = APIRouter()

logger = logging.getLogger(__name__)

def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class EmployeeObj(BaseModel):
    name: str
    manager_id: int | None = None
    designation: str
    id: int
    team: str

class UpdateEmployee(BaseModel):
    manager_id: int

@router.get("/get-org")
async def get_org(db: Session = Depends(get_db)) -> list[EmployeeObj]:
    employees = db.query(Employee).all()
    return employees

@router.post("/employee/{employee_id}")
async def update_manager(employee_id, updated_employee: UpdateEmployee, db: Session = Depends(get_db)):
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    logger.info(employee.manager_id)
    if employee is None:
        return {"error": "Employee not found"}
    employee.manager_id = updated_employee.manager_id
    logger.info(employee.manager_id)
    db.add(employee)
    db.commit()
    return {"employee": employee_id, "manager_id": employee.manager_id}
