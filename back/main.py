# main.py
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from models.base import SessionLocal, engine, Base
from models.rol import Rol, TipoRol
from models.propiedad import Propiedad

app = FastAPI()

# Crear tablas en Neon (solo una vez)
@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    Rol.crear_roles_predeterminados(db)  # 👈 Insertar roles predeterminados
    db.close()

# Dependency para obtener la DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



@app.get("/data")
def get_properties():
    return db.get_properties()

@app.delete("/data")
def delete_properties():
    return db.delete_properties()

@app.post("/propiedades/")
def crear_propiedad(titulo: str, precio: float, db: Session = Depends(get_db)):
    propiedad = Propiedad(
        id="uuid-generado-aqui",  # Usa `uuid.uuid4()` en producción
        titulo=titulo,
        precio=precio
    )
    db.add(propiedad)
    db.commit()
    return {"mensaje": "Propiedad creada en Neon!"}