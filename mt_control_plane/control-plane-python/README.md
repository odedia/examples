To run this project:

1. Set up the environment:
```
export NILE_URL=http://localhost:8080
export NILE_WORKSPACE=mysql-control-plane
export NILE_KEY=gwen@thenile.dev
export NILE_SECRET=gwensecret
export FLASK_ENV=development
```

1. Signup to Nile as a developer: (take care to preserve correct quotes when copy-pasting)
```
curl --location --request POST $NILE_URL/developers \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "'$NILE_KEY'",
    "password": "'$NILE_SECRET'"
}'
```

2. Install Flask and other dependencies:
```
python3 -m venv venv
. venv/bin/activate
pip install -r requirements.txt
```

Then initialize the workspace for the project:
```

```

The run Flask:
```

$ flask run
```