from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Conexión a Neon.tech (PostgreSQL)
DATABASE_URL = "postgresql://neondb_owner:npg_bxrt0dmus8NK@ep-yellow-brook-a9tp6293-pooler.gwc.azure.neon.tech/neondb?sslmode=require&channel_binding=require"
# Reemplaza con tus datos reales de Neon 👆

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()