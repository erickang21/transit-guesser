import os
from datetime import timedelta

import bcrypt
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
import pymongo as pm
from pymongo import AsyncMongoClient
import random
from dotenv import load_dotenv
from pathlib import Path
from flask_cors import CORS
from cachetools import TTLCache
from flask_jwt_extended import JWTManager, create_access_token, jwt_required
from db import db
dotenv_path = Path('../../../.env')
load_dotenv(dotenv_path=dotenv_path)

app = Flask(__name__)
CORS(app)

routes_collection = db["routes"]
stops_collection = db["stops"]
users_collection = db["users"]

cache = TTLCache(maxsize=100000, ttl=60*60*24)

adb = SQLAlchemy() #auth database stuff
app.config['SECRET_KEY'] = os.getenv("appsecret")
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite'
adb.init_app(app)

app.config["JWT_SECRET_KEY"] = os.getenv("secretkey")
app.config['JWT_TOKEN_LOCATION'] = ['headers']
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=30)
jwt = JWTManager(app)

SECRET_KEY = os.getenv("secretkey")

# blueprint for authentication code
#from auth import auth as auth_blueprint
#app.register_blueprint(auth_blueprint)

async def fetch_all_data(collection_name, dataFilter=None, dbFilter=None, alwaysUseDb=False, saveToCache=True):
    if dbFilter is None:
        dbFilter = {}
    if collection_name in cache and not alwaysUseDb:
        return cache[collection_name] if dataFilter is None else dataFilter(cache[collection_name])
    else:
        to_return = []
        async for entry in db[collection_name].find(dbFilter):
            to_return.append(entry)
        to_return = to_return if dataFilter is None else dataFilter(to_return)
        if saveToCache:
            cache[collection_name] = to_return
        return to_return

# Coalesce all aliases into one key for better user experience. Add to dictionary as needed.
def getAliases(operator_name):
    aliases = {
        "grt": "Grand River Transit",
        "metrolinx": "GO Transit"
    }
    # Case insensitive. Any uppercase/lowercase will match.
    return aliases.get(operator_name.lower(), operator_name)


@app.route('/routes', methods=['GET', 'OPTIONS'])
async def get_routes():
    response = await fetch_all_data("routes")
    return jsonify(response)

@app.route('/stops', methods=['GET', 'OPTIONS'])
async def get_stops():
    response = fetch_all_data("stops",
                   lambda data: list(filter(lambda entry: len(entry.get("routes", [])) > 0 and entry.get("longitude", 0) and entry.get("latitude", 0), data)))
    return jsonify(response)

@app.route('/randomStop', methods=['GET', 'OPTIONS'])
async def get_random_stops():
    correct_routes = {}
    data = {}
    while len(correct_routes) == 0:
        stops_data = await fetch_all_data("stops",
                       dataFilter=lambda data: list(filter(lambda entry: len(entry.get("routes", [])) > 0 and entry.get("longitude", 0) and entry.get("latitude", 0), data)))
        random_stop = random.choice(stops_data)
        route_names = list(map(lambda route: str(route["name"]), random_stop["routes"]))
        available_routes = await fetch_all_data("routes", dbFilter={"name": {"$in": route_names}}, alwaysUseDb=True, saveToCache=False)
        data = random_stop
        data["availableRoutes"] = available_routes

        for route in available_routes:
            operator = getAliases(route["operator"])
            if len(route.get("stops", [])) < 2:
                route_description = str(route['number'])
            else:
                route_description = f"{route['number']}: {route['stops'][0]['name']} - {route['stops'][-1]['name']}"
            if route.get(operator, None):
                correct_routes[operator].append(route_description)
            else:
                correct_routes[operator] = [route_description]
        data["correctRoutes"] = correct_routes
    return jsonify(data)

@app.route('/operators', methods=['GET', 'OPTIONS'])
async def getOperators():
    if cache.get("operators", None):
        return jsonify(cache["operators"])
    else:
        route_data = await fetch_all_data("routes")
        operator_data = {}
        for route in route_data:
            operator = getAliases(route["operator"])
            route_description = ""
            if len(route.get("stops", [])) < 2:
                route_description = str(route['number'])
            else :
                route_description = f"{route['number']}: {route['stops'][0]['name']} - {route['stops'][-1]['name']}"
            if operator_data.get(operator, None):
                temp = operator_data[operator]
                temp.append(route_description)
                operator_data[operator] = temp
            else:
                operator_data[operator] = [route_description]
        cache["operators"] = operator_data
        return jsonify(operator_data)

@app.route('/login', methods=['POST'])
async def login():
    # login code goes here
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    user_match = await users_collection.find_one({ "email": email })
    stored_hashed_password = user_match.get("password", None)
    if user_match:
        if bcrypt.checkpw(password.encode('utf-8'), stored_hashed_password):
            token = create_access_token(identity=email)
            return jsonify(success=True, token=token)
        else:
            return jsonify(success=False, message='Invalid credentials')
    else:
        return jsonify(success=False, message='User not found')

@app.route('/register', methods=['POST'])
async def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # Check if the user already exists
    existing_user = await users_collection.find_one({"email": email})
    if existing_user:
        return jsonify(success=False, message="User already exists")

    # Hash the password
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    # Store the new user in the database
    await users_collection.insert_one({
        "email": email,
        "password": hashed_password
    })

    # Optionally, generate a JWT token for the user
    token = create_access_token(identity=email)

    return jsonify(success=True, token=token, message="User registered successfully")

if __name__ == '__main__':
    app.run(debug=True, port=5001)