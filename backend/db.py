import pymongo
from dotenv import load_dotenv
import os

load_dotenv()
DB_STRING = os.getenv("DB_STRING")

# establish connection and create database
client = pymongo.MongoClient(DB_STRING)
db = client['pythonTest']

# input user data to users collection
user_col = db['users']
users = [
    {'_id': 'jf123', 'fname': 'Jacob', 'lname': 'Foster', 'email': 'jacob@jacob.com', 'password': 'password', 'projects': []},
    {'_id': 'ev123', 'fname': 'Enrique', 'lname': 'Villarreal', 'email': 'erique@enrique.com', 'password': 'password', 'projects': []},
    {'_id': 'sg123', 'fname': 'Srishti', 'lname': 'Gupta', 'email': 'srishti@srishti.com', 'password': 'password', 'projects': []},
    {'_id': 'ab123', 'fname': 'Aishwarya', 'lname': 'Bhosle', 'email': 'aishwarya@aishwarya.com', 'password': 'password', 'projects': []},
    {'_id': 'sy123', 'fname': 'Suhas', 'lname': 'Yogish', 'email': 'suhas@suhas.com', 'password': 'password', 'projects': []}
]

proj_col = db['projects']
projects = [
    {'_id': 1, 'name': 'First Project', 'description': 'This is the first project', 'users': ['jf123'], 'creator': 'jf123', 'hardware': []}
]

hardware_col = db['hardware']
hardware = [
    {'_id': 1, 'name': 'Hardware Set 1', 'checkedOut': 0, 'projects': [], 'capacity': 1000},
    {'_id': 2, 'name': 'Hardware Set 2', 'checkedOut': 0, 'projects': [], 'capacity': 1000},
    {'_id': 3, 'name': 'Hardware Set 3', 'checkedOut': 0, 'projects': [], 'capacity': 1000},
    {'_id': 4, 'name': 'Hardware Set 4', 'checkedOut': 0, 'projects': [], 'capacity': 1000},
    {'_id': 5, 'name': 'Hardware Set 5', 'checkedOut': 0, 'projects': [], 'capacity': 1000}
]

user_col.insert_many(users)
hardware_col.insert_many(hardware)
proj_col.insert_many(projects)