#!/usr/bin/env python3

from flask import Flask, request
import json
from flask_cors import CORS, cross_origin
import pymongo
from dotenv import load_dotenv
import os

load_dotenv()
DB_STRING = os.getenv("DB_STRING")

app = Flask(__name__)
app.config['CORS_HEADERS'] = 'Content-Type'
client = pymongo.MongoClient(DB_STRING)
db = client['jacobTest']
CORS(app)

# DELETE
@app.route("/users/", methods=['GET'])
@cross_origin()
def users():
    query_res = db.users.find()
    res = []
    for qr in query_res:
        res.append(qr)

    return json.dumps(res, indent=4)

@app.route("/login/", methods=["POST"])
@cross_origin()
def login():
    if request.method == 'POST':
        attempt = dict(request.get_json())
        user_id, password = attempt['userId'], attempt['password']
        try:
            user = next(db.users.find({'_id': user_id}))
            if user['password'] == password:
                return json.dumps({'message': 'ConfirmKey'}, indent=4)
        except:
            return 'Access Denied'
    return "Only POST Requests allowed"

@app.route("/signup/", methods=['POST'])
@cross_origin()
def signup():
    if request.method == 'POST':
        a = dict(request.get_json())
        user_id, first, last, email, password = a['userId'], a['fname'], a['lname'], a['email'], a['password']
        checker = db.users.find({'_id': user_id})
        try:
            existing = next(checker)
            return 'There is already a user with this username'
        except:
            new_user = {'_id': user_id, 
                'fname': first, 
                'lname': last, 
                'email': email,
                'password': password, 
                'projects': []}
            db.users.insert_one(new_user)
            return 'ConfirmKey'
    return 'Only POST Requests are Allowed'

@app.route('/projects', methods=["GET", "POST"])
@cross_origin()
def projects():
    if request.method == 'GET':
        args = request.args
        user = args.get('userId')
        user_spec = db.projects.find({'users': str(user)})
        all_proj = db.projects.find()
        return json.dumps({
            'userProj': [p for p in user_spec],
            'allProj': [p for p in all_proj]
        }, indent=4)
    
    elif request.method == 'POST':
        new = dict(request.get_json())
        user, name, desc = new['user'], new['name'], new['desc']
        next_id = db.projects.find_one(sort=[('_id', -1)])['_id'] + 1
        new_proj = {
            "_id": next_id,
            "name": name,
            "description": desc,
            "users": [str(user)],
            "creator": user,
            "hardware": []
        }
        db.users.update_one({"_id": str(user)}, {"$push": {"projects": next_id}})
        db.projects.insert_one(new_proj)
        return json.dumps({"message": "Success"}, indent=4)

@app.route('/joinproject/', methods=['POST'])
@cross_origin()
def join_project():
    if request.method == 'POST':
        join = dict(request.get_json())
        user, project = join['user'], join['project']
        db.users.update_one({"_id": str(user)}, {"$push": {"projects": project}})
        db.projects.update_one({"_id": project}, {"$push": {"users": str(user)}})
        return "Success"

@app.route("/hardware/", methods=['GET', 'POST'])
@cross_origin()
def hardware():
    if request.method == 'POST':
        req = dict(request.get_json())
        hwReq, project = req['hwReq'], req['project']
        for r in hwReq:
            checker = next(db.hardware.find({'_id': int(r)}))
            if (checker['capacity'] - checker['checkedOut']) >= int(hwReq[r]):
                checkout_response = db.hardware.update_one({'_id': int(r)}, {'$inc': {'checkedOut': int(hwReq[r])}})
                try:
                    # if the user is adding more hardware to hardware that is already checked out
                    cur_exists = next(db.projects.find({"hardware.id": int(r)}))
                    # print("CURRENT EXISTS:", cur_exists)
                    p_inc = db.projects.update_one({"_id": int(project), "hardware.id": int(r)}, {"$inc": {"hardware.$.amt": hwReq[r]}})
                    h_inc = db.hardware.update_one({"_id": int(r), "projects.id": int(project)}, {"$inc": {"projects.$.amt": hwReq[r]}})
                    # print("PROJECTS INCREMENT:", p_inc)
                    # print("HARDWARE INCREMENT:", h_inc)
                except:
                    # first time adding hardware to a project for that particular hardware
                    p_ins = db.projects.update_one({"_id": int(project)}, {"$push": {"hardware": {"id": int(r), "amt": hwReq[r]}}})
                    h_ins = db.hardware.update_one({"_id": int(r)}, {"$push": {"projects": {"id": int(project), "amt": hwReq[r]}}})
                    # print("PROJECT INSERT:", p_ins.raw_result)
                    # print("HARDWARE INSERT:", h_ins.raw_result)
                finally:
                    success = 'True'
            else:
                return 'You may not check out more resources than are available. Please re-enter or refresh the page.'
        return success
    else:
        query_res = db.hardware.find()
        res = []
        for qr in query_res:
            res.append(qr)

        return json.dumps(res, indent=4)

@app.route("/hardwareReturn/", methods=["POST"])
@cross_origin()
def return_hardware():
    if request.method == 'POST':
        req = (request.get_json())
        hwRet, project = req['hwReturn'], req['project']
        for r in hwRet:
            checker = next(db.hardware.find({'_id': int(r)}))
            if (int(hwRet[r]) > (checker['capacity'] - (checker['capacity'] - checker['checkedOut']))):
                return "You may not return more objects than the current capacity"
            else:
                try:
                    does_exist = next(db.projects.find({"hardware.id": int(r)}))
                    # print(does_exist)
                    p_dec = db.projects.update_one({"_id": int(project), "hardware.id": int(r)}, {"$inc": {"hardware.$.amt": -int(hwRet[r])}})
                    h_dec = db.hardware.update_one({"_id": int(r), "projects.id": int(project)}, {"$inc": {"projects.$.amt": -int(hwRet[r])}})
                    # print("PROJECT DECREMENT:", p_dec.raw_result)
                    # print("HARDWARE DECREMENT:", h_dec.raw_result)                    
                    response = db.hardware.update_one({'_id': int(r)}, {'$inc': {'checkedOut': -int(hwRet[r])}})
                except:
                    # print(does_exist)
                    return "You must have hardware checked out to check hardware in"
        return str(response.acknowledged)
    else:
        return 'Only POST Requests Allowed'
            

if __name__ == "__main__":
    app.run(debug=True)