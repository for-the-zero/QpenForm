from flask import Flask, send_from_directory, request , jsonify
import os
import hashlib
import yaml
import createdb

app = Flask(__name__)
def sha256(filename):
	file_extension = os.path.splitext(filename)[1]
	base_filename = filename.replace(file_extension, '')
	sha256_obj = hashlib.sha256()
	sha256_obj.update(base_filename.encode('utf-8'))
	return f"{sha256_obj.hexdigest()}{file_extension}"

with open('config.yaml','r',encoding='utf-8') as f:
	fconfig = yaml.safe_load(f)

form_save_path = os.path.join(app.root_path,fconfig['save_files'])
app.config['UPLOAD_FOLDER'] = form_save_path
if not os.path.exists(form_save_path):
	os.mkdir(form_save_path)
forms_config = []
for i in fconfig['forms']:
	forms_config.append(fconfig['forms'][i])
	if not os.path.exists(fconfig['forms'][i]['db']):
		open(fconfig['forms'][i]['db'],'w').close()
		createdb.create(fconfig['forms'][i]['db'],fconfig['forms'][i]['relativepath'])


@app.route('/')
def index():
	return send_from_directory('static','index.html')

@app.route('/<path:path>')
def staticfiles(path):
	return send_from_directory('static',path)

@app.route('/submit',methods=['POST'])
def submit():
	data = request.get_json()
	if data is None:
		err_response = jsonify({'error':'no data'})
		err_response.status_code = 400
		return err_response
	temp__fullcombo = True
	form_config = ''
	for i in range(len(forms_config)):
		if data[0] == forms_config[i]['source']:
			temp__fullcombo = False
			form_config = forms_config[i]
			break
	if temp__fullcombo:
		err_response = jsonify({'error':'no form'})
		err_response.status_code = 400
		return err_response
	with open('log.txt','a',encoding='utf-8') as f:
		f.write(f"{data}\n")
	createdb.add(data[1],form_config['db'])
		
	return jsonify({})

@app.route('/upload',methods=['POST'])
def uploadfile():
	if 'file' not in request.files:
		return jsonify({'result':'no file'})
	file = request.files['file']
	if file.filename == '':
		return jsonify({'result':'no file'})
	else:
		filename = sha256(file.filename)
		file.save(os.path.join(form_save_path,filename))
		return jsonify({'result':'success', 'filename': filename})

@app.route('/norep',methods=['POST'])
def norep():
	data = request.get_json()
	if data is None:
		err_response = jsonify([False])
		err_response.status_code = 400
		return err_response
	createdb.norep(data[0],data[1])
	return jsonify([True])

if __name__ == '__main__':
	app.run(debug=True)