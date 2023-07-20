#!/usr/bin/env python3

from flask import Flask, request
import json
from flask_cors import CORS
import pymongo
from dotenv import load_dotenv
import os

load_dotenv()
DB_STRING = os.getenv("DB_STRING")

app = Flask(__name__)
client = pymongo.MongoClient(DB_STRING)
db = client['pythonTest']
CORS(app)

# DELETE
@app.route("/users/", methods=['GET'])
def users():
    query_res = db.users.find()
    res = []
    for qr in query_res:
        res.append(qr)

    return json.dumps(res, indent=4)

@app.route("/login/", methods=["POST"])
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
def projects():
    if request.method == 'GET':
        args = request.args
        user = args.get('userId')
        user_spec = db.projects.find({'users': [str(user)]})
        all_proj = db.projects.find()
        return json.dumps({
            'userProj': [p for p in user_spec],
            'allProj': [p for p in all_proj]
        }, indent=4)
    
    elif request.method == 'POST':
        new = dict(request.get_json())
        user, name, desc = new['user'], new['name'], new['desc']
        next_id = db.projects.find_one(sort=[('_id', -1)])['_id'] + 1
        print(next_id)
        new_proj = {
            "_id": next_id,
            "name": name,
            "description": desc,
            "users": [str(user)],
            "creator": user,
            "hardware": []
        }
        db.projects.insert_one(new_proj)
        return json.dumps({"message": "Success"}, indent=4)

@app.route("/hardware/", methods=['GET', 'POST'])
def hardware():
    if request.method == 'POST':
        req = request.get_json()['hwReq']
        for r in req:
            checker = next(db.hardware.find({'_id': int(r)}))
            if (checker['capacity'] - checker['checkedOut']) >= int(req[r]):
                response = db.hardware.update_one({'_id': int(r)}, {'$inc': {'checkedOut': int(req[r])}})
            else:
                return 'You may not check out more resources than are available. Please re-enter or refresh the page.'
        return str(response.acknowledged)
    else:
        query_res = db.hardware.find()
        res = []
        for qr in query_res:
            res.append(qr)

        return json.dumps(res, indent=4)

@app.route("/hardwareReturn/", methods=["POST"])
def return_hardware():
    if request.method == 'POST':
        req = request.get_json()['hwReturn']
        for r in req:
            checker = next(db.hardware.find({'_id': int(r)}))
            if (int(req[r]) > (checker['capacity'] - (checker['capacity'] - checker['checkedOut']))):
                return "You may not return more objects than the current capacity"
            else:
                response = db.hardware.update_one({'_id': int(r)}, {'$inc': {'checkedOut': -int(req[r])}})
        return str(response.acknowledged)
    else:
        return 'Only POST Requests Allowed'
            

if __name__ == "__main__":
    app.run(debug=True)