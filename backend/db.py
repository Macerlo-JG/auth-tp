from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from flask_marshmallow import Marshmallow
from sqlalchemy.engine import Engine
from sqlalchemy import event

"""
Configura SQLAlchemy (ORM) y Marshmallow (serialización).
"""

class Base(DeclarativeBase):
    pass   

db = SQLAlchemy(model_class=Base)
ma = Marshmallow()