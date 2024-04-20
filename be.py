from flask import Flask, send_from_directory
app = Flask(__name__)

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
    return {0}

if __name__ == '__main__':
    app.run(debug=True)