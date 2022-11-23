import keyring
import keyring.util.platform_ as keyring_platform
import sys

def save_secret(INSTANCE_ID, SECRET_NAME, SECRET_VALUE):
    keyring.set_password(INSTANCE_ID, SECRET_NAME, SECRET_VALUE)

def get_secret(INSTANCE_ID, SECRET_NAME):
    return(keyring.get_password(INSTANCE_ID, SECRET_NAME))
    #cred = keyring.get_credential(INSTANCE_ID, SECRET_NAME)
    #print(f"Password for username {cred.username} in namespace {INSTANCE_ID} is {cred.password}")

def test_set_get():
    print(keyring_platform.config_root())
    print(keyring.get_keyring())
    
    INSTANCE_ID = "inst_02foo"
    
    SECRET_NAME = "src_apiKey"
    SECRET_VALUE = "myKey2"
    save_secret(INSTANCE_ID, SECRET_NAME, SECRET_VALUE)
    print(SECRET_NAME, get_secret(INSTANCE_ID, SECRET_NAME))
    
    SECRET_NAME = "src_apiSecret"
    SECRET_VALUE = "mySecret2"
    save_secret(INSTANCE_ID, SECRET_NAME, SECRET_VALUE)
    print(SECRET_NAME, get_secret(INSTANCE_ID, SECRET_NAME))

test_set_get()
sys.exit(0)
