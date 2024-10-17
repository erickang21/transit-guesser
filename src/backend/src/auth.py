import os
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required
from dotenv import load_dotenv
from pathlib import Path

dotenv_path = Path('../../../.env')
load_dotenv(dotenv_path=dotenv_path)

class TokenManager: # we will be using a renewal/access token setup like Auth0's article
    def __init__(self, app): #this automatically configures our flask app
        self.app = app
        self.jwt = JWTManager(self.app)
        self.db = SQLAlchemy(self.app)

        # Configuration
        app.config['SECRET_KEY'] = os.getenv('authsecret')
        app.config["JWT_SECRET_KEY"] = os.getenv('jwtsecret')
        app.config['JWT_TOKEN_LOCATION'] = ['headers']
    
    

