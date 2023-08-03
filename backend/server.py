#!/usr/bin/env python3

from flask import Flask, request
import json
from flask_cors import CORS
import pymongo
from dotenv import load_dotenv
import os
import passwordEncrypt
import certifi

ca=certifi.where()

load_dotenv()
DB_STRING = os.getenv("DB_STRING")

app = Flask(__name__)
client = pymongo.MongoClient(DB_STRING, tlsCAFile=ca)
db = client['pythonTest']
CORS(app)

def return_json(message):
    return json.dumps({"Message": str(message)}, indent=4)

@app.route("/login/", methods=["POST"])
def login():
    if request.method == 'POST':

        data = request.get_json()
        params = data['params']
        user = params.get('user')
        password = params.get('password')

        try:
            checker = next(db.users.find({'_id': str(user)}))
            
            salt = checker['salt'].encode()
            pwdEncrypt = passwordEncrypt.PasswordEncrypt(password)
            encodedBytePwd = pwdEncrypt.encodePasswordByte()
            hashedPwd = pwdEncrypt.generateHash(encodedBytePwd, salt)
            
            if checker['password'] == hashedPwd.decode():
                return return_json('ConfirmKey')
        except:
            return return_json("Access Denied")
    else:
        return 'LOL'

@app.route('/signup/', methods=['POST'])
def signup():
    if request.method == 'POST':

        data = request.get_json()
        params = data['params']
        user, first, last, email, password = params.get('user'), params.get('first'), params.get('last'), params.get('email'), params.get('password')

        try:
            checker = next(db.users.find({'_id': str(user)}))
            return return_json("There is already a user with this username")
        except:

            pwdEncrypt = passwordEncrypt.PasswordEncrypt(password)
            encodedBytePwd = pwdEncrypt.encodePasswordByte()
            salt = pwdEncrypt.generateSalt()
            hashedPwd = pwdEncrypt.generateHash(encodedBytePwd, salt)

            newUser = {
                '_id': user,
                'fname': first,
                'lname': last,
                'email': email,
                'password': hashedPwd.decode(),
                'salt': salt.decode(),
                'projects': list()
            }
            db.users.insert_one(newUser)
            return return_json("ConfirmKey")

@app.route('/projects/', methods=['POST'])
def projects():
    if request.method == 'POST':
        data = dict(request.get_json())
        projectName, projectDescription, creator, user = data['projectName'], data['projectDescription'], data['creator'], data['user']
        # automatically increment project ID
        next_id = db.projects.find_one(sort=[('_id', -1)])['_id'] + 1
        try:
            newProject = {
                'name': projectName,
                'description': projectDescription,
                'creator': creator,
                'users': [user],  # Wrap 'users' in a list to make it a list of users
                '_id': next_id,
                # added hardware array when creating new project
                'hardware': []
            }
            db.projects.insert_one(newProject)
            
            # Update the user's document in the 'users' collection to include the new projectID
            db.users.update_one(
                {'_id': creator},  # Use {'_id': creator} instead of {'_id': users'}
                {'$push': {'projects': next_id}}
            )
            
            return return_json("ConfirmKey")
        except:
            return return_json("Error occurred")

        

@app.route("/join_project/", methods=["POST"])
def join_project():
    if request.method == 'POST':
        data = request.get_json()
        params = data['params']
        user = params.get('user')  # Corrected key to 'user'
        project_id = int(params.get('projectID'))
        try:
            project = db.projects.find_one({'_id': project_id})  # Use find_one() instead of find()

            if not project:
                return return_json("Project does not exist")
            elif user in project['users']:
                print(project['users'])
                return return_json("User is already in the project")

            db.projects.update_one(
                {'_id': project_id},
                {'$push': {'users': user}}
            )
            db.users.update_one(
                {'_id': user},
                {'$push': {'projects': project_id}}
            )
            return return_json("User successfully joined the project")
        except:
            return return_json("Error occurred while joining the project")
    else:
        return 'LOL'

@app.route("/get_user_projects/", methods=["POST"])
def get_user_projects():
    if request.method == 'POST':
        data = request.get_json()
        params = data['params']
        user = params.get('user')
        print(user)

        try:

            collection = db.projects

            # Query find in the collection HWSet1
            result = collection.find({'users':user})

            documents_list = list(result)
            # print("doc list:", documents_list)

            if (len(documents_list) == 0):
                return None
            else:
                dataTable = []
                for document in documents_list:
                    # check if the project has any hardware checked out
                    rows = {
                        'id': document['_id'], 
                        'projectName': document['name'], 
                        'projectDescription': document['description'], 
                        # 'hwSet1': document['hardware'][0], 
                        # 'hwSet2': document['hardware'][1]
                        }
                    
                    dataTable.append(rows)

                # print("dataTable:", dataTable)
                return dataTable
        except:
            return return_json("Error occurred while loading the projects")
    else:
        return 'LOL'

@app.route('/hardware/', methods=['GET'])
def hardware():
    if request.method == 'GET':
        hw = db.hardware.find()
        return json.dumps(list(hw))

@app.route('/manageHardware/', methods=['POST'])
def manageHardware():
    if request.method == 'POST':
        # get and set user data from client
        data = dict(request.get_json())
        user, req, project, operation = data['user'], data['request'], data['project'], data['operation']
        print(user)
        # logic path for returning hardware
        if operation == 'return':
            for hw in req:
                # find the hardware set in database
                hwset = next(db.hardware.find({'_id': int(hw)}))
                if (int(req[hw]) > (hwset['capacity'] - (hwset['capacity'] - hwset['checkedOut']))):
                    return return_json("You may not return more objects than the current availability")
                # find how many of this particular hardware set have been checked out to this project
                # find the project and the hardware checked out to it
                try:
                    proj_hw = next(db.projects.find({'_id': project}))['hardware']
                    print('proj_hw:', proj_hw)
                    # iterate through the hardware sets to find the one corresponding to the request
                    for i in proj_hw:
                        # print(list(i.keys())[0])
                        if int(i['id']) == int(hw):
                            # check if user is returning more hardware than checked out
                            if int(i['amt']) < int(req[hw]):
                                return return_json("You may not return more hardware than you have checked out")
                            else:
                                # all requirements satisfied so hardware can be returned and all is right in the world
                                proj_dec = db.projects.update_one({"_id": int(project), "hardware.id": int(hw)}, {"$inc": {"hardware.$.amt": -int(req[hw])}})
                                hard_dec = db.hardware.update_one({"_id": int(hw), "projects.id": int(project)}, {"$inc": {"projects.$.amt": -int(req[hw])}})
                                response = db.hardware.update_one({"_id": int(hw)}, {"$inc": {"checkedOut": -int(req[hw])}})
                except:
                    return return_json("You must have hardware checked out to return hardware.")

            return return_json("Success")
        
        # logic path for checking out hardware
        elif operation == 'request':
            # iterate through all hardware requests
            for hw in req:
                # find hardware set in db
                hwset = next(db.hardware.find({"_id": int(hw)}))
                # determine if requested amount is less than or equal to available amount
                if (hwset['capacity'] - hwset['checkedOut'] >= int(req[hw])):
                    # determine if project has hardware already checked out - just checking out more
                    try:
                        exists_in_project = next(db.projects.find({'hardware.id': int(hw)}))
                        # increment amount checked out in projects and hardware collection
                        proj_inc = db.projects.update_one({"_id": int(project), "hardware.id": int(hw)}, {"$inc": {"hardware.$.amt": req[hw]}})
                        hard_inc = db.hardware.update_one({"_id": int(hw), "projects.id": int(project)}, {"$inc": {"projects.$.amt": req[hw]}})

                    # logic path for project checking out hardware from new hardware set
                    except:
                        # push the information to the hardware array on each project document
                        proj_insert = db.projects.update_one({"_id": int(project)}, {"$push": {"hardware": {"id": int(hw), "amt": req[hw]}}})
                        hard_insert = db.hardware.update_one({"_id": int(hw)}, {"$push": {"projects": {"id": int(project), "amt": req[hw]}}})
                    finally:
                        db.hardware.update_one({"_id": int(hw)}, {"$inc": {"checkedOut": int(req[hw])}})
                        return return_json("Success")
                return return_json("You may not check out more resources than are available")

if __name__ == "__main__":
    app.run(debug=True)
