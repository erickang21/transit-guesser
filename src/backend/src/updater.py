import os
import OSMPythonTools.nominatim as nm
import OSMPythonTools.overpass as op
import OSMPythonTools.api as ap
import pymongo as pm
from dotenv import load_dotenv
from pathlib import Path
import logging
import time

dotenv_path = Path('../../../.env')
load_dotenv(dotenv_path=dotenv_path)
logger = logging.getLogger(__name__)
logging.basicConfig(filename='updater.log', encoding='utf-8', level=logging.INFO)

class Updater:

    def __init__(self):
        self.ovp = op.Overpass()
        self.api = ap.Api() #get the query self.api (simpler self.api for when we want to find individual nodes, rather than by attribute)
        self.pym = pm.MongoClient(os.getenv("mongodb"))
        self.db = self.pym["transitguesser"]
        self.routes_collection = self.db["routes"]
        self.stops_collection = self.db["stops"]

    def updateStops(self, aid):
        #logging variables
        start = time.time()
        end = 0
        stopsupdated = 0
        relationsqueried = 0

        #build a query for bus route relations and run it
        query = op.overpassQueryBuilder(area=aid, elementType='node', selector='"highway"="bus_stop"', out='body')
        result = self.ovp.query(query, timeout=1000)
        print("Number of bus stops in current area:", result.countElements())

        stopdict = {}

        query2 = op.overpassQueryBuilder(area=aid, elementType='relation', selector='"route"="bus"', out='body')
        result2 = self.ovp.query(query2, timeout=1000)

        for route in result2.elements():
            for m in route.members():
                if not m.id() in stopdict:
                    stopdict[m.id()] = []
                stopdict[m.id()].append(route.id())

        nolines = 0

        for stop in result.elements():
            # loop through all available bus routes to determine which ones fit (this is the fastest way I can do, OSM does not do reverse search for some reason)
            relations = []
            if not stop.id() in stopdict:
                nolines += 1
                continue
            for rid in stopdict[stop.id()]:
                querystring = 'relation/' + str(rid)
                relations.append(self.api.query(querystring))
                relationsqueried += 1
            routes = []
            for rel in relations:
                route_data = {
                    "_id": rel.id(),
                    "number": rel.tag("ref"),
                    "name": rel.tag("name"),
                    "network": rel.tag("network"),
                    "operator": rel.tag("operator"),
                    "type": rel.tag("route")
                }
                routes.append(route_data)
            if not "name" in stop.tags():
                continue # if the stop does not have a name we are cooked
            data = {
                "_id": stop.id(),
                "latitude": stop.lat(),
                "longitude": stop.lon(),
                "name": stop.tag("name"),
                "network": stop.tag("network"),
                "operator": stop.tag("operator"),
                "inaccurateReports": 0,
                "routes": routes
            }
            self.stops_collection.update_one({ "_id": stop.id() }, { "$set": data }, upsert=True)
            stopsupdated += 1
            print(f"Successfully updated/inserted routes for {stop.tag('operator')} stop {stop.tag('name')}.")
        print("Of", len(result.elements()), "nodes queried,", nolines, "had no related routes.")
        #logging info
        end = time.time()
        logstring = "Updated stops in area "+str(aid)+" at "+time.strftime('%Y-%m-%d %H:%M %Z', time.localtime(end))+" with "+str(stopsupdated)+" stops, "+str(relationsqueried)+" relations queried. Time for operation: "+str(end-start)+" seconds."
        logger.info(logstring)

    def updateRoutes(self, aid):
        #logging variables
        start = time.time()
        end = 0
        routesupdated = 0
        nodesqueried = 0

        #build a query for bus route relations and run it
        query = op.overpassQueryBuilder(area=aid, elementType='relation', selector='"route"="bus"', out='body')
        result = self.ovp.query(query, timeout=1000)
        print("Number of bus routes in current area:", result.countElements())

        for route in result.elements():
            # get a list of stop coordinates for the chosen route
            allmembers = route.members()
            stops = []
            for mem in allmembers:
                if mem.type() == 'node':
                    querystring = 'node/'+str(mem.id())
                    nod = self.api.query(querystring)
                    nodesqueried += 1
                    if 'highway' in nod.tags() and nod.tags()['highway'] == 'bus_stop':
                        stop_data = {
                            "name": nod.tag("name"),
                            "index": len(stops),
                            "latitude": nod.lat(),
                            "longitude": nod.lon()
                        }
                        stops.append(stop_data)
            if not "name" in route.tags():
                continue # if the bus route we are getting has no name, it breaks the game
            data = {
                "_id": route.id(),
                "number": route.tag("ref"),
                "name": route.tag("name"),
                "network": route.tag("network"),
                "operator": route.tag("operator"),
                "type": route.tag("route"),
                "stops": stops,
                "inaccurateReports": 0
            }
            self.routes_collection.update_one({ "_id": route.id() }, { "$set": data }, upsert=True)
            print(f"Successfully updated/inserted stops for {route.tag('operator')} route {route.tag('ref')}.")
            routesupdated += 1
        #logging info
        end = time.time()
        logstring = "Updated routes in area "+str(aid)+" at "+time.strftime('%Y-%m-%d %H:%M %Z', time.localtime(end))+" with "+str(routesupdated)+" routes, "+str(nodesqueried)+" nodes queried. Time for operation: "+str(end-start)+" seconds."
        logger.info(logstring)

# test code
if __name__ == "__main__":
    nom = nm.Nominatim()
    areaID = nom.query("Kitchener, Ontario").areaId()
    updater = Updater()
    updater.updateStops(areaID)
    updater.updateRoutes(areaID)