import json
import uuid #we will use uuid5 in this game
from enum import Enum
from names_generator import generate_name
import time
# manages player sessions, allowing for various game modes and scoring systems
defaultfile = './scoringconfig'

# configuration: dict containing all the configuration details of the current session
# score: the current score

def fetchAccountDetails(): #TODO: fetch account details from database
    return {"displayname": "DISPLAY NAME PLACEHOLDER"}

def getActionStats(mode, action, configfile=defaultfile): #return the score and rounds left change of an action, returns 0, 0 (do nothing) if errored
    configdict = None
    with open(configfile) as cfg:
        configdict = json.load(cfg)
    if configdict is None:
        return 0, 0
    if not mode in configdict.keys():
        return 0, 0
    current = configdict["mode"]
    if not "actions" in current:
        return 0, 0
    current = current["actions"]
    if len(action) == 0: #we can use this to refresh without changing anything
            return 0, 0
    lexemes = action.split()
    for lex in lexemes:
        if isinstance(current, dict): # parse the current lexeme as string
            if not lex in current.keys():
                return 0, 0
            current = current[lex]
        elif isinstance(current, list):
            try:
                current = current[int(lex)]
            except ValueError:
                return 0, 0
        else: #something has really gone wrong here
            return 0, 0
    if (not isinstance(current, list)) or (not len(current) == 2): # the leaf object is a list of length 2, representing (score change, round change)
        return 0, 0
    return int(current[0]), int(current[1])

class Session:
    def __init__(self, mode, configfile=defaultfile, auid="", displayname="Guest"):
        self.cfile = configfile
        self.auid = auid #if this is empty, then guest session
        self.sessionuuid = str(uuid.uuid5())
        self.displayname = displayname
        self.mode = mode
        configdict = None
        with open(configfile) as cfg:
            configdict = json.load(cfg)
        if not mode in configdict.keys():
            raise Exception("GAME MODE NOT FOUND DURING SESSION CREATION: "+mode)
        self.configuration = configdict[mode]
        if not "startscore" in self.configuration.keys():
            raise Exception("INVALID MODE DATA: START SCORE NOT FOUND!")
        self.score = int(self.configuration["startscore"])
        if not "actions" in self.configuration.keys():
            raise Exception("INVALID MODE DATA: ACTIONS NOT FOUND!")
        if not "rounds" in self.configuration.keys():
            raise Exception("INVALID MODE DATA: NUMBER OF ROUNDS NOT FOUND!")
        self.rounds = int(self.configuration["rounds"]) #set to -1 for survival mode, set to any positive number for modes counting rounds
        self.minscore = None
        if "minscore" in self.configuration.keys():
            self.minscore = int(self.configuration["minscore"])
        self.maxscore = None
        if "maxscore" in self.configuration.keys():
            self.minscore = int(self.configuration["maxscore"])
        self.gameover = False
    
    def update(self, action): #parses the action and updates the score, returns if the operation was a success
        if self.rounds == 0: #game ends when there are exactly 0 rounds in the counter
            self.gameover = True
            return False
        if self.score < self.minscore or self.score > self.maxscore:
            self.gameover = True
            return False
        if len(action) == 0: #we can use this to refresh without changing anything
            return False
        lexemes = action.split()
        current = self.configuration["actions"]
        for lex in lexemes:
            if isinstance(current, dict): # parse the current lexeme as string
                if not lex in current.keys():
                    return False
                current = current[lex]
            elif isinstance(current, list):
                try:
                    current = current[int(lex)]
                except ValueError:
                    return False
            else: #something has really gone wrong here
                return False
        if (not isinstance(current, list)) or (not len(current) == 2): # the leaf object is a list of length 2, representing (score change, round change)
            return False
        scorechange = int(current[0])
        roundchange = int(current[1])
        self.score += scorechange
        self.rounds += max(roundchange, -1) # the game ends if the rounds number is exactly 0, so we make sure any downwards change is by 1 only so it always goes through
        return True
    
    def getMode(self):
        return self.mode
    
    def getStatus(self):
        self.update("")
        return (self.gameover, self.score, abs(self.rounds))

    def getState(self): #useful for putting in the database
        self.update("")
        state = {
            "mode": self.mode,
            "score": self.score,
            "rounds": self.rounds,
            "gameover": self.gameover
        }
        return state
    
    def getAUID(self):
        return self.auid
    
    def getUUID(self):
        return self.sessionuuid
    
    def getName(self):
        return self.displayname
    
    def isGameOver(self):
        return self.gameover
    
    def getMode(self):
        return self.mode
    
    def getCFile(self):
        return self.cfile

class GroupStatus(Enum):
    NORMAL = 0
    FINISHED = 1
    EMPTY = -1
class Group: #multiplayer support, each session is contained in a group of one or more sessions
    def __init__(self, initiator): #initiator is the session that initiates the group, will "own" the group
        self.groupid = str(uuid.uuid5())
        self.mode = initiator.getMode()
        self.cfile = initiator.getCFile()
        self.players = {initiator.getUUID(): initiator}
        self.playerids = [initiator.getUUID()] #the owner will always sit at index 0, if they leave then ownership goes to the next available person
                                    #I do not trust trying to index dict keys
        self.status = GroupStatus.NORMAL
        self.unfinished = 1
        self.lastaccess = time.time()
    def addPlayer(self, player): #add player session
        self.lastaccess = time.time()
        if not self.players.get(player.getUUID()) is None:
            return False #DO NOT add duplicates
        if self.mode != player.getMode() or self.cfile != player.getCFile():
            if self.status == GroupStatus.EMPTY:
                self.mode = player.getMode()
                self.cfile = player.getCFile()
            else:
                return False #DO NOT mix modes, of course if mode is empty that is different
        self.players[player.getUUID] = player
        self.playerids.append(player.getUUID)
        if not player.isGameOver():
            self.unfinished += 1
            self.status = GroupStatus.NORMAL
        elif self.unfinished == 0:
            self.status = GroupStatus.FINISHED
        return True

    def removePlayer(self, uuid):
        self.lastaccess = time.time()
        if self.players.get(uuid) is None:
            return False
        else:
            if not self.players.get(uuid).isGameOver:
                self.unfinished -= 1
                if self.unfinished == 0:
                    self.status = GroupStatus.FINISHED
            self.players.pop(uuid)
            self.playerids.remove(uuid)
            if len(self.playerids) == 0:
                self.status = GroupStatus.EMPTY
            return True
    
    def getStatus(self):
        self.lastaccess = time.time()
        return self.status
    
    def getNPlayers(self):
        self.lastaccess = time.time()
        return len(self.playerids)
    
    def getOwner(self):
        self.lastaccess = time.time()
        return self.playerids[0] if len(self.playerids) > 0 else ""
    
    def doUpdate(self, uuid, action):
        self.lastaccess = time.time()
        if self.players.get(uuid) is None:
            return False
        stat = self.players.get(uuid).update(action)
        if not stat:
            return False
        if self.players.get(uuid).isGameOver:
            self.unfinished -= 1
            if self.unfinished == 0:
                self.status = GroupStatus.FINISHED
        return True
    
    def getState(self):
        self.lastaccess = time.time()
        statedict = {}
        for id in self.playerids:
            statedict[id] = self.players[id].getState()
        return statedict
    
    def getID(self):
        self.lastaccess = time.time()
        return self.groupid
    
    def getCFile(self):
        self.lastaccess = time.time()
        return self.cfile
    
    def getMode(self):
        self.lastaccess = time.time()
        return self.mode
    
    def getSession(self, uuid): #use if you really want to use the session methods
        return self.players.get(uuid)
    
    def getLastAccess(self):
        return self.lastaccess

class SessionManager:
    def __init__(self):
        self.groups = {} #these are indexed by group ID
    def start(self, mode, configfile="", account=""): #initiates group, returns group ID and session ID
        initsession = None
        if account != "":
            initsession = Session(mode, configfile, account, fetchAccountDetails(account)["displayname"])
        else:
            guestname = generate_name(style='capital') # using name generator, generate a randomized guest name
            initsession = Session(mode, configfile, account, guestname)
        group = Group(initsession)
        self.groups[group.getID()] = group
        return group.getID(), initsession.getUUID()
    def startWithSession(self, session): #returns only group ID
        group = Group(session)
        self.groups[group.getID()] = group
        return group.getID()
    def addGroup(self, group): #if for some reason you want to add a whole fully-formed group
        self.groups[group.getID()] = group
    def addUser(self, groupid, account=""): #returns status and the session ID
        if self.groups.get(groupid) is None:
            return False
        newsession = None
        if account != "":
            newsession = Session(self.groups[groupid].getMode(), self.groups[groupid].getCFile(), account, fetchAccountDetails(account)["displayname"])
        else:
            guestname = generate_name(style='capital') # using name generator, generate a randomized guest name
            newsession = Session(self.groups[groupid].getMode(), self.groups[groupid].getCFile(), account, guestname)
        return self.groups[groupid].addPlayer(newsession), newsession.getUUID()
    
    def addSession(self, groupid, session): #return status only
        if self.groups.get(groupid) is None:
            return False
        return self.groups[groupid].addPlayer(session)
    
    def removeSession(self, groupid, uuid): #returns status
        if self.groups.get(groupid) is None:
            return False
        return self.groups[groupid].removePlayer(uuid)
    
    def getGroup(self, groupid): #if you wanna do some operation on the group using group methods, use this
        return self.groups[groupid]
    
    def clean(self, lastaccess=0): #run this every once in a while to clean up groups, joining empty groups is possible if you do it quick enough
        toremove = []
        for k in self.groups.keys():
            if lastaccess > self.groups[k].getLastAccess() or self.groups[k].getStatus() == GroupStatus.EMPTY:
                toremove.append(k)
        for k in toremove:
            self.groups.pop(k)
