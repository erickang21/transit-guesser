import OSMPythonTools.nominatim as nm
import OSMPythonTools.overpass as op
import OSMPythonTools.api as ap
from random import randrange


#using nominatim, get an area ID for the Kitchener area
nom = nm.Nominatim()
areaID = nom.query("Kitchener, Ontario").areaId()
print("Area ID of Kitchener:", areaID)

#build a query for bus route relations and run it
ovp = op.Overpass()
query = op.overpassQueryBuilder(area=areaID, elementType='relation', selector='"route"="bus"', out='body')
result = ovp.query(query, timeout=1000)
print("Number of elements:", result.countElements())

#pick out a random result
sz = result.countElements()
busroute = result.elements()[randrange(0, sz)]
print("Chosen:", busroute.tag('name'))

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

# print out coords
print("\n\n\n")
for node in stops:
    print('Bus stop at:', node.lat(), node.lon(), "with ID:", node.id())