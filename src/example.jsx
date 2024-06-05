import React, { useState } from "react";
import ReactDOM from "react-dom";

// Компонент Counter
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Ви натиснули {count} разів</p>
      <button onClick={() => setCount(count + 1)}>Натисни мене</button>
    </div>
  );
}

// Головний компонент App
function App() {
  return (
    <div>
      <h1>Лічильник</h1>
      <Counter />
      <Counter />
    </div>
  );
}

// Рендеринг компонента App
ReactDOM.render(<App />, document.getElementById("root"));
