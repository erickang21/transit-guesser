from flask import redirect, url_for, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, create_refresh_token
from .models import User
from . import db
import uuid

@auth.route('/login', methods=['POST'])
def login_post():
    # login code goes here
    email = request.form.get('email')
    password = request.form.get('password')

    user = User.query.filter_by(email=email).first()

    # check if the user actually exists
    # take the user-supplied password, hash it, and compare it to the hashed password in the database
    if not user or not check_password_hash(user.password, password):
        return jsonify({'message': 'LOGIN FAILED!', 'access_token': None, 'renew_token': None}), 401 # if the user doesn't exist or password is wrong, return empty access and refresh tokens, along with status 401 (denied)

    # if the above check passes, then we know the user has the right credentials
    access_token = create_access_token(identity=user.uuid)
    refresh_token = create_refresh_token(identity=user.uuid)
    return jsonify({'message': 'LOGIN SUCCESS!', 'access_token': access_token, 'renew_token': refresh_token})

@auth.route('/signup', methods=['POST'])
def signup_post():
    # code to validate and add user to database goes here
    email = request.form.get('email')
    name = request.form.get('displayname')
    password = request.form.get('password')

    user = User.query.filter_by(email=email).first() # if this returns a user, then the email already exists in database

    if user: # if a user is found, we want to redirect back to signup page so user can try again
        return jsonify({'message': 'USER ALREADY EXISTS!'}), 400

    # create a new user with the form data. Hash the password so the plaintext version isn't saved.
    new_user = User(uuid=str(uuid.uuid5()), email=email, displayname=name, password=generate_password_hash(password, method='sha256'))

    # add the new user to the database
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'SIGNUP SUCCESS!'})