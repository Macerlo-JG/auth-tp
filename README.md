body {
  margin: 0;
  font-family: system-ui;
  background: #0f172a;
  color: white;
}

.container {
  max-width: 1000px;
  margin: auto;
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
}

.form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 30px;
}

input, select {
  padding: 10px;
  border-radius: 8px;
  border: none;
  outline: none;
  background: #1e293b;
  color: white;
}

button {
  grid-column: span 2;
  padding: 10px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}

button:hover {
  background: #1d4ed8;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 15px;
}

.card {
  background: #1e293b;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}

.card h3 {
  margin: 0 0 10px;
}
