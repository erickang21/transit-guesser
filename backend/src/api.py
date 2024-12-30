import os
from datetime import timedelta
import re
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
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, create_refresh_token
dotenv_path = Path('../../../.env')
load_dotenv(dotenv_path=dotenv_path)

print("Starting app: ", __name__)
app = Flask(__name__)
CORS(app)
try:
    print("Attempting to connect to MongoDB: ", os.getenv("mongodb"))
    pym = AsyncMongoClient(os.getenv("mongodb"))
    db = pym["transitguesser"]
    print("Successfully connected to MongoDB.")
except Exception as e:
    print("Error connecting to database: ", e)

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


@app.route('/api/routes', methods=['GET', 'OPTIONS'])
async def get_routes():
    response = await fetch_all_data("routes")
    return jsonify(response)

@app.route('/api/stops', methods=['GET', 'OPTIONS'])
async def get_stops():
    response = fetch_all_data("stops",
                   lambda data: list(filter(lambda entry: len(entry.get("routes", [])) > 0 and entry.get("longitude", 0) and entry.get("latitude", 0), data)))
    return jsonify(response)

@app.route('/api/randomStop', methods=['GET', 'OPTIONS'])
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

@app.route('/api/operators', methods=['GET', 'OPTIONS'])
async def getOperators():
    if cache.get("operators", None):
        return jsonify(cache["operators"])
    else:
        route_data = await fetch_all_data("routes")
        route_data = sorted(route_data, key=lambda x: int(re.sub(r'\D', '', x['number'])))
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

@app.route('/api/login', methods=['POST'])
async def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    username = data.get('username')
    if email == "" and username == "":
        return jsonify(success=False, error='Username/Email missing.')
    if password == "":
        return jsonify(success=False, error='Password not provided.')
    find_params = { "email": email } if email != '' else { "username": username }
    user_match = await users_collection.find_one(find_params)
    if not user_match:
        return jsonify(success=False, error='Email does not exist.')
    stored_hashed_password = user_match.get("password", None)
    if user_match:
        if bcrypt.checkpw(password.encode('utf-8'), stored_hashed_password):
            token = create_access_token(identity=email, fresh=True)
            refresh = create_refresh_token(identity=email)
            # Update tokens in database
            await users_collection.update_one(find_params, { "$set": { "token": token, "refresh": refresh }})
            # Return user data
            username = user_match.get("username", None)
            level = user_match.get("level", None)
            points = user_match.get("points", None)
            email = user_match.get("email", None)
            return jsonify(success=True, token=token, refresh=refresh, username=username, level=level, points=points, email=email)
        else:
            return jsonify(success=False, error='Incorrect password.')
    else:
        return jsonify(success=False, error='User not found.')

@app.route('/api/restore-session', methods=['POST'])
async def restore_session():
    data = request.get_json()
    token = data.get('token')
    if not token:
        return jsonify(success=False, error='User not logged in.')
    user_match = await users_collection.find_one({ "token": token })
    if not user_match:
        return jsonify(success=False, error='Invalid state.')
    username = user_match.get("username", None)
    level = user_match.get("level", None)
    points = user_match.get("points", None)
    email = user_match.get("email", None)
    return jsonify(success=True, username=username, level=level, points=points, email=email)

@app.route('/api/register', methods=['POST'])
async def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    username = data.get('username')
    # Check if the user already exists
    existing_user = await users_collection.find_one({"email": email})
    if existing_user:
        return jsonify(success=False, error="This email has already been used. Try logging in.")
    existing_user_username = await users_collection.find_one({"username": username})
    if existing_user_username:
        return jsonify(success=False, error="Username already taken. Please try another.")

    # Hash the password
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    # Generate a token to log in the user after registration
    token = create_access_token(identity=email, fresh=True)
    refresh = create_refresh_token(identity=email)

    # Store the new user in the database
    await users_collection.insert_one({
        "email": email,
        "password": hashed_password,
        "username": username,
        "level": 1,
        "points": 0,
        "token": token,
        "refresh": refresh
    })
    return jsonify(success=True, token=token, refresh=refresh, email=email, username=username, level=1, points=0)

@app.route('/api/logout', methods=['POST'])
async def logout():
    data = request.get_json()
    email = data.get('email')
    user = await users_collection.find_one({"email": email})
    if not user:
        return jsonify(success=False, error="Invalid state.")
    await users_collection.update_one({ "email": email }, { "$set": { "token": None, "refresh": None }})
    return jsonify(success=True)

@app.route('/api/addPoints', methods=['POST'])
async def addPoints():
    data = request.get_json()
    level = data.get('level')
    points = data.get('points')
    email = data.get('email')
    # Check if the user already exists
    user = await users_collection.find_one({"email": email})
    if not user:
        return jsonify(success=False, error="Invalid state.")

    await users_collection.update_one({ "email": email }, { "$set": { "level": level, "points": points }})
    return jsonify(success=True)

@app.route('/api/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()
    access_token = create_access_token(identity=user_id, fresh=False)
    return jsonify({'message': 'ACCESS REFRESH SUCCESS!', 'access_token': access_token})

@app.route('/api/check', methods=['POST'])
@jwt_required()
def check(): # check if our access token is still active
    return jsonify({'message': 'ACCESS CHECK SUCCESS!'})

@app.route('/api/checkfresh', methods=['POST'])
@jwt_required(fresh=True)
def checkFresh(): # required for more dangerous changes like a password change
    return jsonify({'message': 'FRESH TOKEN CHECK SUCCESS!'})

@app.route('/api/checklogin', methods=['POST'])
@jwt_required(refresh=True)
def checkLogin(): # check if we need to re-login because our refresh token is expired
    return jsonify({'message': 'REFRESH (LOGIN) TOKEN CHECK SUCCESS!'})


print("[PROD] Hosting on PORT=5000")
from waitress import serve
serve(app, host="127.0.0.1", port=5000)

