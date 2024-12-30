from pymongo import AsyncMongoClient
import os

pym = AsyncMongoClient(os.getenv("mongodb"))
db = pym["transitguesser"]