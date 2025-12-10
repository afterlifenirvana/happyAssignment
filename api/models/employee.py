from sqlalchemy import Column, String, Integer
from database import Base

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    manager_id = Column(Integer)
    designation = Column(String)
    team = Column(String)
