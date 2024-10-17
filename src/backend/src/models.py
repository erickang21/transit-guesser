from . import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True) # primary keys are required by SQLAlchemy
    uuid = db.Column(db.String(100), unique=True)
    email = db.Column(db.String(100), unique=True)
    displayname = db.Column(db.String(1000))
    password = db.Column(db.String(100))
    # add more fields as we go