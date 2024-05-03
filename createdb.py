import sqlite3
import json

def create(db_path,source_path):
	conn = sqlite3.connect(db_path)
	cursor = conn.cursor()
	col = []
	with open(source_path,'r',encoding='utf-8') as f:
		contents = f.readlines()
		print(contents)
		for i in contents:
			if i.startswith('&-->'):
				i = i.replace('&-->','')
				i = json.loads(i)
				i = i['id']
				col.append(i)
	cursor.execute(f'CREATE TABLE results ({",".join(col)} TEXT)')
	conn.commit()
	conn.close()

def add(data,db_path):
	for key in data:
		if isinstance(data[key],list) or isinstance(data[key],dict):
			data[key] = json.dumps(data[key])
		else :
			data[key] = str(data[key])
	conn = sqlite3.connect(db_path)
	cursor = conn.cursor()
	columns = ', '.join(data.keys())
	placeholders = ', '.join(['?'] * len(data))
	query = f'INSERT INTO results ({columns}) VALUES ({placeholders})'
	values = tuple(data.values())
	cursor.execute(query, values)
	conn.commit()
	conn.close()

def norep(form_id,usercode):
	#TODO: