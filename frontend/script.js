document.getElementById('tax-form').addEventListener('submit', async (event) => {
    event.preventDefault();  

    const income = parseFloat(document.getElementById('income').value);
    const expenses = parseFloat(document.getElementById('expenses').value);
    const deductions = parseFloat(document.getElementById('deductions').value);


    

    try {
        if (isNaN(income) || isNaN(expenses) || isNaN(deductions)) {
            document.getElementById('result').innerText = 'Please enter valid numbers.';
            return; 
        }
        
        const response = await fetch('http://127.0.0.1:5000/calculate_tax', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ income, expenses, deductions })
        });


        if (!response.ok) {
            const errorData = await response.json();  // error
            throw new Error(errorData.error || 'Error calculating tax'); 
        }

        const data = await response.json(); // JSON
        document.getElementById('result').innerText = `Calculated Tax: ${data.tax}`;

        fetchHistory();
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('result').innerText = error.message;
    }
});

async function fetchHistory() {
    try {
        const response = await fetch('http://127.0.0.1:5000/get_calculation_history');

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json(); 
        console.log("Fetched history:", data); 

        const historyDiv = document.getElementById('history');
        historyDiv.innerHTML = ''; 

        data.history.forEach(calc => {
            const formattedTax = parseFloat(calc.tax).toFixed(1); // one decimal
            const div = document.createElement('tr');
            div.innerHTML = `<td>${calc.income}</td><td>${formattedTax}</td>`;
            historyDiv.prepend(div);
        });
    } catch (error) {
        console.error('Error fetching history:', error);
    }
}


window.onload = fetchHistory;

document.getElementById('clear-history').addEventListener('click', async () => {
    const confirmation = confirm("Are you sure you want to delete the history? This action cannot be undone.");

    if (!confirmation) {
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:5000/clear_history', {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Failed to clear history');
        }

        document.getElementById('history').innerHTML = ''; 
        alert('Calculation history cleared successfully!');
    } catch (error) {
        console.error('Error clearing history:', error);
        alert('Error clearing history. Please try again later.');
    }
});

