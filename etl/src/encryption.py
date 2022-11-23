import keyring
import keyring.util.platform_ as keyring_platform
import sys

def set_secret(instance_id, secret_name, secret_value):
    """Set secret secret_name with value secret_value in namespace instance_id"""

    keyring.set_password(instance_id, secret_name, secret_value)

def get_secret(instance_id, secret_name):
    """Get secret secret_name from namespace instance_id"""

    return(keyring.get_password(instance_id, secret_name))
    #cred = keyring.get_credential(instance_id, secret_name)
    #print(f"Password for username {cred.username} in namespace {instance_id} is {cred.password}")

def test_set_get():
    print(keyring_platform.config_root())
    print(keyring.get_keyring())
    
    INSTANCE_ID = "inst_02foo"
    
    SECRET_NAME = "src_apiKey"
    SECRET_VALUE = "myKey2"
    set_secret(INSTANCE_ID, SECRET_NAME, SECRET_VALUE)
    print(SECRET_NAME, get_secret(INSTANCE_ID, SECRET_NAME))
    
    SECRET_NAME = "src_apiSecret"
    SECRET_VALUE = "mySecret2"
    set_secret(INSTANCE_ID, SECRET_NAME, SECRET_VALUE)
    print(SECRET_NAME, get_secret(INSTANCE_ID, SECRET_NAME))


#test_set_get()
#sys.exit(0)
