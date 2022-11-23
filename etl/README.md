Modify .env so that `NILE_ENTITY_NAME=ETL`
(cd quickstart && yarn nile-init)
(cd multi-tenancy && yarn start)

cd etl
python3 -m venv venv && venv/bin/python3 -m pip install -r requirements.txt
venv/bin/python src/entity_instance_s0.py
venv/bin/python src/entity_instance_src.py
venv/bin/python src/entity_instance_dst.py
venv/bin/python src/entity_instance_job.py
