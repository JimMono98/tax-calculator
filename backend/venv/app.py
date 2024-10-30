from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tax_audit.db'
db = SQLAlchemy(app)

class Calculation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    income = db.Column(db.Float, nullable=False)
    tax = db.Column(db.Float, nullable=False)

@app.route('/calculate_tax', methods=['POST'])
def calculate_tax():
    try:
        data = request.json  # JSON data
        income = data.get('income')
        expenses = data.get('expenses')
        deductions = data.get('deductions')

        if income is None or expenses is None or deductions is None:
            return jsonify({"error": "Missing input values"}), 400

        taxable_income = income - expenses - deductions
        tax = taxable_income * 0.24  # tax rate 24%

        new_calculation = Calculation(income=income, tax=tax)
        db.session.add(new_calculation)
        db.session.commit()

        return jsonify({"tax": tax}), 201
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 400

@app.route('/get_calculation_history', methods=['GET'])
def get_history():
    try:
        calculations = Calculation.query.all()
        return jsonify({"history": [{"income": calc.income, "tax": calc.tax} for calc in calculations]})
    except Exception as e:
        print(f"Error fetching history: {e}")  
        return jsonify({"error": str(e)}), 500  
    
@app.route('/clear_history', methods=['DELETE'])
def clear_history():
    try:
        db.session.query(Calculation).delete()  
        db.session.commit()
        return jsonify({"message": "Calculation history cleared"}), 200
    except Exception as e:
        print(f"Error clearing history: {e}")
        return jsonify({"error": str(e)}), 400


if __name__ == '__main__':
    with app.app_context():
        db.create_all() 
    app.run(debug=True)