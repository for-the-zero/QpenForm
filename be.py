from flask import Flask, send_from_directory, request , jsonify
import os
import hashlib
app = Flask(__name__)
def sha1(filename):
    file_extension = os.path.splitext(filename)[1]
    base_filename = filename.replace(file_extension, '')
    sha1_obj = hashlib.sha1()
    sha1_obj.update(base_filename.encode('utf-8'))
    return f"{sha1_obj.hexdigest()}{file_extension}"
    

#####config####
form_save_path = os.path.join(app.root_path,'form_save_test')
#####config####

app.config['UPLOAD_FOLDER'] = form_save_path
if not os.path.exists(form_save_path):
    os.mkdir(form_save_path)

@app.route('/')
def index():
    return send_from_directory('static','index.html')

@app.route('/<path:path>')
def staticfiles(path):
    return send_from_directory('static',path)

@app.route('/post',methods=['POST'])
def submit():
    # TODO:
    print("submit!")
    return jsonify({0})

@app.route('/upload',methods=['POST'])
def uploadfile():
    if 'file' not in request.files:
        return jsonify({'result':'no file'})
    file = request.files['file']
    if file.filename == '':
        return jsonify({'result':'no file'})
    else:
        filename = sha1(file.filename)
        file.save(os.path.join(form_save_path,filename))
        print(os.path.join(form_save_path,filename))
        return jsonify({'result':'success', 'filename': filename})

if __name__ == '__main__':
    app.run(debug=True)