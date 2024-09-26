import OSMPythonTools.nominatim as nm
import OSMPythonTools.overpass as op
import OSMPythonTools.api as ap
from random import randrange
import pymongo as pm

class Updater:

    def __init__(self):
        self.ovp = op.Overpass()
        self.pym = pm.MongoClient("mongodb://localhost:27017/")

    def updateStops(self, aid):
        return

    def updateRoutes(self, aid):
        dbstring = str(aid)+"_route"
        curdb = self.pym[dbstring]
        #build a query for bus route relations and run it
        query = op.overpassQueryBuilder(area=aid, elementType='relation', selector='"route"="bus"', out='body')
        result = self.ovp.query(query, timeout=1000)
        print("Number of bus routes in current area:", result.countElements())

        
        for busroute in result.elements():
            # get a list of stop coordinates for the chosen route
            allmembers = busroute.members()
            api = ap.Api() #get the query API (simpler API for when we want to find individual nodes, rather than by attribute)
            stops = []
            for mem in allmembers:
                if mem.type() == 'node':
                    print('found node at id:', mem.id())
                    querystring = 'node/'+str(mem.id())
                    info = api.query(querystring)
                    if 'highway' in info.tags() and info.tags()['highway'] == 'bus_stop':
                        stops.append(info)
            
            routeid = busroute.id()
            if not "name" in busroute.tags():
                continue # if the bus route we are getting has no name, it breaks the game
            routecol = curdb[str(routeid)]
            hasroute = str(routeid) in curdb.list_collection_names()
            canupdate = True # if it's something like fixing a typo in the OSM data, we can just tweak the existing entries
            # however, if there are significant changes to the route we might as well just redo it

            if hasroute:
                current = routecol.find().sort("idx") # if exists, compare changes
                #because of how mongodb is we store the name of the bus route as a "stop" with idx -1, so that it is always first
                # here we update the name entry
                newname = {"_id": 0, "name": busroute.tag("name"), "idx": -1, "lat": 0, "lon": 0} #nothing has id 0
                routecol.update_one({"idx": -1}, newname)
                current.pop(0)
                for i in range(len(stops)):
                    curentry = current[i]["_id"]
                    gotentry = stops[i].id()
                    if curentry != gotentry:
                        canupdate = False
                        break
            
            newname = {"_id": 0, "name": busroute.tag("name"), "idx": -1, "lat": 0, "lon": 0} #nothing has id 0
            if canupdate:
                # here we update the name entry
                routecol.update_one({"idx": -1}, newname)
                # then the rest
                for i in range(len(stops)):
                    name = ((stops[i].tag("name")) if "name" in stops[i].tags else "")
                    full = {"_id": stops[i].id(), "idx": i, "lat": stops[i].lat(), "lon": stops[i].lon(), "name": name}
                    routecol.update_one({"_id": stops[i].id()}, full)
            else:
                routecol.delete_many({})
                routecol.insert_one(newname)
                inserts = []
                for i in range(len(stops)):
                    name = ((stops[i].tag("name")) if "name" in stops[i].tags else "")
                    full = {"_id": stops[i].id(), "idx": i, "lat": stops[i].lat(), "lon": stops[i].lon(), "name": name}
                    inserts.append(full)
                routecol.insert_many(inserts)


        