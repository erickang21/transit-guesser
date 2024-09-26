import OSMPythonTools.nominatim as nm
import OSMPythonTools.overpass as op
import OSMPythonTools.api as ap
import pymongo as pm

class Updater:

    def __init__(self):
        self.ovp = op.Overpass()
        self.pym = pm.MongoClient("mongodb+srv://erickang21:bananaboy21@transitguesser.yx6hg.mongodb.net/?retryWrites=true&w=majority&appName=transitguesser")
        self.db = self.pym["transitguesser"]
        self.routes_collection = self.db["routes"]

    def updateStops(self, aid):
        return

    def updateRoutes(self, aid):
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
                    querystring = 'node/'+str(mem.id())
                    info = api.query(querystring)
                    if 'highway' in info.tags() and info.tags()['highway'] == 'bus_stop':
                        stop_data = {
                            "name": info.tag("name"),
                            "index": len(stops),
                            "latitude": info.lat(),
                            "longitude": info.lon()
                        }
                        stops.append(stop_data)
            if not "name" in busroute.tags():
                continue # if the bus route we are getting has no name, it breaks the game
            data = {
                "_id": busroute.id(),
                "number": busroute.tag("ref"),
                "name": busroute.tag("name"),
                "network": busroute.tag("network"),
                "operator": busroute.tag("operator"),
                "type": busroute.tag("route"),
                "stops": stops,
                "inaccurateReports": 0
            }
            self.routes_collection.update_one({ "_id": busroute.id() }, { "$set": data }, upsert=True)
            print(f"Successfully updated/inserted stops for {busroute.tag('operator')} route {busroute.tag('ref')}.")

nom = nm.Nominatim()
areaID = nom.query("Kitchener, Ontario").areaId()
updater = Updater()
updater.updateRoutes(areaID)