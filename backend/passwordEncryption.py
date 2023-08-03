import bcrypt

class PasswordEncrypt:

    def __init__(self, pwd):
        self.pwd = pwd
    
    def encodePasswordByte(self):
        encoded_pwd = self.pwd.encode('utf-8')
        return encoded_pwd

    def generateSalt(self):
        return bcrypt.gensalt()
    
    def generateHash(self, bytePwd, salt):
        pwd_hash = bcrypt.hashpw(bytePwd, salt)
        return pwd_hash