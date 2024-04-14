from flask import Flask, render_template
app = Flask(__name__)

@app.route('/')
def indexhtml():
    return render_template('index.html')

@app.route('/post',methods=['POST'])
def submit():
    # TODO:
    print("submit!")
    return {0}

if __name__ == '__main__':
    app.run(debug=True)