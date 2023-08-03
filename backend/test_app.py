import pytest
import pytest_check
import pymongo as pm
import flask
from server import app, signup
from dotenv import load_dotenv
import os
import certifi
import passwordEncrypt as e
import requests

load_dotenv()
DB_STRING = os.getenv("DB_STRING")

cert = certifi.where()

# testing database connection and initial set up with query to users collection
def test_dbConnection():
    test_client = pm.MongoClient(DB_STRING, tlsCAFile=cert)
    test_db = test_client['pythonTest']    
    res = list(test_db.users.find())
    assert len(res) > 1

# tests functionality of password encryption
# tests length to ensure SALT value has been added
def test_encryption():
    password = 'TESTPASS123'
    pwdEncrypt = e.PasswordEncrypt(password)
    encodedBytePwd = pwdEncrypt.encodePasswordByte()
    salt = pwdEncrypt.generateSalt()
    hashedPwd = pwdEncrypt.generateHash(encodedBytePwd, salt)
    assert len(hashedPwd) > len(password)
    

# test if login encryption logic will work
def test_login_encryption():
    # incoming data to DB
    sPass = 'jacobpwd'
    # establish DB connection
    test_client = pm.MongoClient(DB_STRING, tlsCAFile=cert)
    test_db = test_client['pythonTest'] 
    # query DB
    test_user = next(test_db.users.find({"_id": 'jf123'}))
    salt, ePass = test_user['salt'], test_user['password']
    # login and password encryption logic
    bsalt = salt.encode()
    pwdEncrypt = e.PasswordEncrypt(sPass)
    encodedBytePwd = pwdEncrypt.encodePasswordByte()
    hashedPwd = pwdEncrypt.generateHash(encodedBytePwd, bsalt)
    # assert login logic will work, password stored correctly, DB active
    assert hashedPwd.decode() == ePass

def test_create_user():
    data = {
        "params": {    
            'user': 'test123',
            'first': 'Test',
            'last': 'McTest',
            'email': 'test@example.com',
            'password': 'test123'
        }
    }
    create_response = requests.post('http://localhost:5000/signup/', json=data)
    key = create_response.json()['Message']
    assert key == 'ConfirmKey'
    test_client = pm.MongoClient(DB_STRING, tlsCAFile=cert)
    test_db = test_client['pythonTest']
    test_db.users.delete_one({"_id": "test123"})

def test_create_project():
    data = {
        "projectName": "test",
        "projectDescription": "test description",
        "creator": 'jf123',
        "user": 'jf123'
    }

    create_response = requests.post("http://localhost:5000/projects/", json=data)
    key = create_response.json()['Message']
    assert key == "ConfirmKey"
