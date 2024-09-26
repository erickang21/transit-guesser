import os
from flask import Flask, jsonify
import pymongo as pm
from dotenv import load_dotenv
from pathlib import Path

dotenv_path = Path('../../../.env')
load_dotenv(dotenv_path=dotenv_path)

pym = pm.MongoClient(os.getenv("mongodb"))
db = pym["transitguesser"]
routes_collection = db["routes"]
stops_collection = db["stops"]

app = Flask(__name__)

@app.route('/routes', methods=['GET'])
def get_routes():
    routes_data = routes_collection.find({})
    return jsonify(routes_data.to_list())

@app.route('/stops', methods=['GET'])
def get_stops():
    stops_data = stops_collection.find({})
    stops_data = list(filter(lambda entry: len(entry.get("routes", [])) > 0, stops_data.to_list()))
    return jsonify(stops_data);

if __name__ == '__main__':
    app.run(debug=True)