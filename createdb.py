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

def norep(db_path,form_id,usercode):
	conn = sqlite3.connect(db_path)
	cursor = conn.cursor()
	form_id = 'form_' + form_id
	cursor.execute(f'''CREATE TABLE IF NOT EXISTS {form_id} (ip TEXT,fp TEXT)''')
	conn.commit()
	cursor.execute(f'SELECT * FROM {form_id} WHERE ip=? OR fp=?',(usercode[0],usercode[1]))
	db_result = cursor.fetchone()
	if not db_result:
		conn.close()
		return False
	conn.close()
	return True

def recrep(db_path,form_id,usercode):
	conn = sqlite3.connect(db_path)
	cursor = conn.cursor()
	cursor.execute(f'INSERT INTO {form_id} (ip,fp) VALUES (?,?)',(usercode[0],usercode[1]))
	conn.commit()
	conn.close()
