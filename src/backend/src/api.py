import os
from flask import Flask, jsonify
import pymongo as pm
import random
from dotenv import load_dotenv
from pathlib import Path
from flask_cors import CORS
from cachetools import TTLCache

dotenv_path = Path('../../../.env')
load_dotenv(dotenv_path=dotenv_path)

pym = pm.MongoClient(os.getenv("mongodb"))
db = pym["transitguesser"]
routes_collection = db["routes"]
stops_collection = db["stops"]

app = Flask(__name__)
CORS(app, origins="*")
cache = TTLCache(maxsize=100000, ttl=60*60*24)
CORS(app, origins=os.getenv("origins").split(","))

def fetch_all_data(collection_name, dataFilter=None, dbFilter=None, alwaysUseDb=False, cache_key=None):
    if dbFilter is None:
        dbFilter = {}
    if collection_name in cache and not alwaysUseDb:
        print("Getting from cache:", collection_name)
        return cache[collection_name] if dataFilter is None else dataFilter(cache[collection_name])
    else:
        data = db[collection_name].find(dbFilter)
        data = data.to_list()
        print("retrieved data", data)
        to_return = data if dataFilter is None else dataFilter(data)
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


@app.route('/routes', methods=['GET'])
def get_routes():
    return jsonify(fetch_all_data("routes"))

@app.route('/stops', methods=['GET'])
def get_stops():
    return jsonify(fetch_all_data("stops",
                   lambda data: list(filter(lambda entry: len(entry.get("routes", [])) > 0 and entry.get("longitude", 0) and entry.get("latitude", 0), data))))

@app.route('/randomStop', methods=['GET'])
def get_random_stops():
    correct_routes = {}
    data = {}
    while len(correct_routes) == 0:
        stops_data = fetch_all_data("stops",
                       lambda data: list(filter(lambda entry: len(entry.get("routes", [])) > 0 and entry.get("longitude", 0) and entry.get("latitude", 0), data)))
        random_stop = random.choice(stops_data)
        route_names = list(map(lambda route: str(route["name"]), random_stop["routes"]))
        available_routes = fetch_all_data("routes", dbFilter={"name": {"$in": route_names}}, alwaysUseDb=True)
        available_routes = list(filter(lambda route: route.get("operator", None) is not None, available_routes))
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

@app.route('/operators', methods=['GET'])
def getOperators():
    if cache.get("operators", None):
        return jsonify(cache["operators"])
    else:
        route_data = fetch_all_data("routes")
        print("route data", route_data)
        route_data = list(filter(lambda route: route.get("operator", None) is not None, route_data))
        print("filtered data", route_data)
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

if __name__ == '__main__':
    app.run(debug=True)