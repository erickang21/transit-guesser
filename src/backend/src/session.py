import json
# manages player sessions, allowing for various game modes and scoring systems
defaultfile = './scoringconfig'

# configuration: dict containing all the configuration details of the current session
# score: the current score
class session:
    def __init__(self, mode, configfile=defaultfile):
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
        if len(action) == 0:
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
            